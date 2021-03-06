import { createAsyncThunk } from '@reduxjs/toolkit';
import moment from 'moment';

import type { Task, DownloadTaskState, PostsContext, ThunkApi } from '@store/types';
import type { Post, PostSearchOptions, Tag } from '@appTypes/gelbooruTypes';

import { db } from '@db';
import * as api from '@service/apiService';
import { deleteImage, saveImage, saveThumbnail } from '@util/imageIpcUtils';
import { delay } from '@util/utils';
import { getActionLogger } from '@util/logger';
import { thumbnailCache } from '@util/objectUrlCache';

export const deduplicateAndCheckTagsAgainstDb = async (tags: string[]): Promise<string[]> => {
	const deduplicated = Array.from(new Set(tags));
	const checked = await Promise.all(
		deduplicated.map(async (tag) => {
			const exists = await db.tags.checkIfExists(tag);
			if (!exists) return tag;
		})
	);
	const checkedAndFiltered: string[] = [];
	checked.forEach((val) => val !== undefined && checkedAndFiltered.push(val));
	return checkedAndFiltered;
};

export const copyAndBlacklistPost = (p: Post): Post => {
	const post = { ...p };
	post.blacklisted = 1;
	post.downloaded = 0;
	post.selected = false;
	return post;
};

/**
 * @param tags tags to be downloaded, tags will be first checked against DB and deduplicated
 * @returns an array of Tag objects containing tags that have been downloaded
 */
export const downloadTags = createAsyncThunk<Tag[], string[], ThunkApi>(
	'tags/download',
	async (tags, { getState }): Promise<Tag[]> => {
		const logger = getActionLogger(downloadTags);
		const apiKey = getState().settings.apiKey;
		logger.debug(`Deduplicating and checking ${tags.length} tags against DB`);
		const filteredTags = await deduplicateAndCheckTagsAgainstDb(tags);
		logger.debug(`Getting ${filteredTags.length} tags from API`);
		const tagsFromApi = await api.getTagsByNames(filteredTags, apiKey);
		logger.debug(`Saving ${tagsFromApi.length} tags from API`);
		db.tags.bulkPut(tagsFromApi);
		return tagsFromApi;
	}
);

export const cancelPostsDownload = createAsyncThunk<void, Post[], ThunkApi>(
	'posts/cancelPostsDownload',
	async (posts): Promise<void> => {
		const logger = getActionLogger(cancelPostsDownload);
		const updatedPosts: Post[] = [];
		for (const post of posts) {
			const updatedPost = { ...post };
			updatedPost.downloaded = 0;
			updatedPosts.push(updatedPost);
			deleteImage(post);
		}
		logger.debug(`Deleted ${updatedPosts.length} images. Saving to DB`);
		db.posts.bulkSave(updatedPosts);
	}
);

export const fetchPostsByIds = createAsyncThunk<Post[], { context: PostsContext | string; ids: number[] }, ThunkApi>(
	'posts/fetchPostsByIds',
	async ({ ids }): Promise<Post[]> => {
		thumbnailCache.revokeAll();
		const logger = getActionLogger(fetchPostsByIds);
		logger.debug('Getting', ids.length, 'posts from DB');
		const postsFromDb = await db.posts.getBulk(ids);
		const result = await Promise.all(
			postsFromDb.map(async (post, index) => {
				if (!post) {
					const p = await api.getPostById(ids[index]);
					await db.posts.put(p);
					await saveThumbnail(p);
					return p;
				} else {
					return post;
				}
			})
		);

		return result;
	}
);

/**
 * @param post Post whose image will be downloaded
 * @param taskId If this is a batch download, taskId should be provided for progress bar
 * @returns Instance of Post that have been downloaded with updated state
 */
export const downloadPost = createAsyncThunk<
	Post,
	{ post: Post; context: PostsContext | string; taskId?: number },
	ThunkApi
>(
	'posts/downloadPost',
	async (params, thunkApi): Promise<Post> => {
		getActionLogger(downloadPost);
		const updatedPost: Post = {
			...params.post,
			downloaded: 1,
			blacklisted: 0,
			downloadedAt: moment().valueOf(),
		};
		await saveImage(updatedPost);
		db.posts.put(updatedPost);

		!params.taskId && (await thunkApi.dispatch(downloadTags(updatedPost.tags)));
		return updatedPost;
	}
);

export const persistTask = createAsyncThunk<Task | undefined, DownloadTaskState, ThunkApi>(
	'posts/persistTask',
	async (state, thunkApi): Promise<Task | undefined> => {
		const logger = getActionLogger(persistTask);
		const taskFromState = thunkApi.getState().tasks.tasks[state.taskId];
		if (!taskFromState) return;
		const task = { ...taskFromState };

		const downloaded = state.downloaded;
		const skipped = state.skipped;
		const canceled = state.canceled;
		if (downloaded + skipped === task.items) {
			task.itemsDone = downloaded + skipped;
			task.state = 'completed';
		} else if (!canceled) {
			task.state = 'failed';
		} else if (canceled) {
			task.state = 'canceled';
		}
		task.timestampDone = Date.now();

		await db.tasks.save(task);
		logger.debug(`Task id ${state.taskId} was persisted succesfuly`, task);

		return task;
	}
);

export const downloadPosts = createAsyncThunk<
	{ taskId: number; skipped: number; downloaded: number; canceled: boolean },
	{ posts: Post[]; context: PostsContext | string },
	ThunkApi
>(
	'posts/downloadPosts',
	async (params, thunkApi): Promise<DownloadTaskState> => {
		const logger = getActionLogger(downloadPosts);
		const taskId = thunkApi.getState().tasks.lastId;
		const tagsToSave: string[] = [];
		let canceled = false;
		let skippedPostCount = 0;
		let downloadedPostCount = 0;

		logger.debug(`Downloading ${params.posts.length} posts. Skipping already downloaded.`);
		const downloadedPosts: Post[] = [];
		const promises: Promise<unknown>[] = [];
		for await (const post of params.posts) {
			if (post.downloaded === 1) {
				logger.debug(`Skipping post id ${post.id} because it is already downloaded.`, post.fileUrl);
				skippedPostCount++;
				continue;
			}
			promises.push(thunkApi.dispatch(downloadPost({ post, taskId, context: params.context })));
			downloadedPosts.push(post);

			tagsToSave.push(...post.tags);
			downloadedPostCount++;

			await delay(500);
			if (thunkApi.getState().tasks.tasks[taskId].state === 'canceled') {
				logger.debug(`Cancelling task. Deleting ${downloadedPosts.length} posts`);
				await thunkApi.dispatch(cancelPostsDownload(downloadedPosts));
				canceled = true;
				break;
			}
		}
		await Promise.all(promises);
		if (!canceled) {
			logger.debug(
				`${params.posts.length} posts given to download. ${downloadedPostCount} posts downloaded, ${skippedPostCount} posts skipped. Updating Task id ${taskId} to DB`
			);
			db.tasks.save(thunkApi.getState().tasks.tasks[taskId]);
			thunkApi.dispatch(downloadTags(tagsToSave));
		}

		if (downloadedPostCount + skippedPostCount === params.posts.length) {
			logger.debug('Task finished succesfuly');
		} else if (canceled) {
			logger.debug('Task was canceled');
		} else {
			logger.debug('Unexpected error occured while downloading posts.');
		}
		const result = {
			taskId,
			canceled,
			skipped: skippedPostCount,
			downloaded: downloadedPostCount,
		};
		thunkApi.dispatch(persistTask(result));
		return result;
	}
);

export const downloadSelectedPosts = createAsyncThunk<void, { context: PostsContext | string }, ThunkApi>(
	'posts/downloadSelectedPosts',
	async ({ context }, thunkApi): Promise<void> => {
		const logger = getActionLogger(downloadSelectedPosts);
		const posts = thunkApi.getState().searchContexts[context].posts.filter((p) => p.selected);
		if (posts.length === 0) {
			logger.error('No posts selected');
			throw new Error('No posts selected');
		}

		logger.debug('Downloading', posts.length, 'selected posts');
		await thunkApi.dispatch(downloadPosts({ posts, context }));
		return Promise.resolve();
	}
);

export const downloadAllPosts = createAsyncThunk<void, { context: PostsContext | string }, ThunkApi>(
	'posts/downloadAllPosts',
	async ({ context }, thunkApi): Promise<void> => {
		const logger = getActionLogger(downloadAllPosts);
		const posts = thunkApi.getState().searchContexts[context].posts;
		if (posts.length === 0) {
			logger.error('No posts to download');
			throw new Error('No posts to download');
		}

		logger.debug('Downloading', posts.length, 'posts');
		await thunkApi.dispatch(downloadPosts({ posts, context }));
		return Promise.resolve();
	}
);

export const downloadWholeSearch = createAsyncThunk<void, { context: PostsContext | string }, ThunkApi>(
	'posts/downloadWholeSearch',
	async ({ context }, thunkApi): Promise<void> => {
		const logger = getActionLogger(downloadWholeSearch);

		const state = thunkApi.getState();
		const tags = state.searchContexts[context].selectedTags;
		const excludedTags = state.searchContexts[context].excludedTags;
		const tagsString = tags.map((tag) => tag.tag);
		const excludedTagString = excludedTags.map((tag) => tag.tag);
		const options: PostSearchOptions = {
			limit: 100,
			page: 0,
			rating: state.searchContexts[context].rating,
			apiKey: state.settings.apiKey,
		};

		logger.debug(
			`Fetching posts from api. Selected Tags: [${tagsString}]. Excluded Tags: [${excludedTagString}]. API Options:`,
			JSON.stringify({
				...options,
				apiKey: 'redacted',
			})
		);
		let posts = await api.getPostsForTags(tagsString, options, excludedTagString);
		let lastPage = 0;
		const totalPosts: Post[] = [...posts];
		await delay(2000);
		while (posts.length > 0) {
			const newOptions = {
				...options,
				page: ++lastPage,
			};
			logger.debug(
				`Fetching posts from api. Selected Tags: [${tagsString}]. Excluded Tags: [${excludedTagString}]. API Options:`,
				JSON.stringify({
					...newOptions,
					apiKey: 'redacted',
				})
			);
			posts = await api.getPostsForTags(tagsString, newOptions, excludedTagString);
			totalPosts.push(...posts);
			await delay(2000);
		}
		await thunkApi.dispatch(downloadPosts({ posts: totalPosts, context }));
		return Promise.resolve();
	}
);

export const blacklistPosts = createAsyncThunk<Post[], { context: PostsContext | string; posts: Post[] }, ThunkApi>(
	'posts/blacklistPosts',
	async ({ posts }): Promise<Post[]> => {
		const logger = getActionLogger(blacklistPosts);
		const resultPosts: Post[] = [];
		for (const p of posts) {
			deleteImage(p);
			const post = copyAndBlacklistPost(p);
			db.posts.put(post);
			resultPosts.push(post);
		}
		logger.debug(`Blacklisted and deleted ${resultPosts.length} posts`);
		return resultPosts;
	}
);

export const blacklistAllPosts = createAsyncThunk<void, { context: PostsContext | string }, ThunkApi>(
	'posts/blacklistAllPosts',
	async ({ context }, thunkApi): Promise<void> => {
		thunkApi.dispatch(blacklistPosts({ context, posts: thunkApi.getState().searchContexts[context].posts })); // TODO throw when no posts
	}
);

export const blacklistSelectedPosts = createAsyncThunk<void, { context: PostsContext | string }, ThunkApi>(
	'posts/blacklistSelectedPosts',
	async ({ context }, thunkApi): Promise<void> => {
		const posts = thunkApi.getState().searchContexts[context].posts.filter((post) => post.selected); // TODO throw when no posts
		thunkApi.dispatch(blacklistPosts({ posts, context }));
	}
);

export const incrementViewCount = createAsyncThunk<Post, { post: Post; context: PostsContext | string }, ThunkApi>(
	'posts/incrementViewCount',
	async ({ post }): Promise<Post> => {
		const logger = getActionLogger(incrementViewCount);
		logger.debug(`Post id ${post.id} view count incremented to ${post.viewCount + 1}`);
		const p: Post = { ...post, viewCount: post.viewCount + 1 };
		await db.posts.put(p);
		return p;
	}
);
