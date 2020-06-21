import { createAsyncThunk } from '@reduxjs/toolkit';

import { db } from '../../db';
import * as api from '../../service/apiService';

import { useSaveImage, useDeleteImage } from '../../hooks/useImageBus';

// import { actions } from '../tasks';
import { ThunkApi } from '../../store/types';

import { Post, PostSearchOptions, Tag } from '../../types/gelbooruTypes';
import { delay } from '../../util/utils';
import moment from 'moment';

const saveImage = useSaveImage();
const deleteImage = useDeleteImage();

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
	async (tags, thunkApi): Promise<Tag[]> => {
		const filteredTags = await deduplicateAndCheckTagsAgainstDb(tags);
		const tagsFromApi = await api.getTagsByNames(filteredTags, thunkApi.getState().settings.apiKey);
		db.tags.saveBulk(tagsFromApi);
		return tagsFromApi;
	}
);

export const cancelPostsDownload = createAsyncThunk<void, Post[], ThunkApi>(
	'posts/cancelPostsDownload',
	async (posts): Promise<void> => {
		const updatedPosts: Post[] = [];
		for (const post of posts) {
			const updatedPost = { ...post };
			updatedPost.downloaded = 0;
			updatedPosts.push(updatedPost);
			deleteImage(post);
		}
		db.posts.bulkSave(updatedPosts);
	}
);

export const fetchPostsByIds = createAsyncThunk<Post[], number[], ThunkApi>(
	'posts/fetchPostsByIds',
	async (ids): Promise<Post[]> => {
		return db.posts.getBulk(ids);
	}
);

/**
 * @param post Post whose image will be downloaded
 * @param taskId If this is a batch download, taskId should be provided for progress bar
 * @returns Instance of Post that have been downloaded with updated state
 */
export const downloadPost = createAsyncThunk<Post, { post: Post; taskId?: number }, ThunkApi>(
	'posts/downloadPost',
	async (params, thunkApi): Promise<Post> => {
		const updatedPost = { ...params.post };
		await saveImage(updatedPost);
		updatedPost.downloaded = 1;
		updatedPost.blacklisted = 0;
		updatedPost.downloadedAt = moment().valueOf();
		db.posts.update(updatedPost);

		!params.taskId && (await thunkApi.dispatch(downloadTags(updatedPost.tags)));
		return updatedPost;
	}
);

export const downloadPosts = createAsyncThunk<void, { posts: Post[] }, ThunkApi>(
	'posts/downloadPosts',
	async (params, thunkApi): Promise<void> => {
		const taskId = thunkApi.getState().tasks.lastId;
		const tagsToSave: string[] = [];

		const downloadedPosts: Post[] = [];
		for await (const post of params.posts) {
			if (post.downloaded === 1) {
				continue;
			}
			thunkApi.dispatch(downloadPost({ post, taskId }));
			downloadedPosts.push(post);

			tagsToSave.push(...post.tags);

			await delay(500);
			if (thunkApi.getState().tasks.tasks[taskId].state === 'canceled') {
				thunkApi.dispatch(cancelPostsDownload(downloadedPosts));
				break;
			}
		}
		db.tasks.save(thunkApi.getState().tasks.tasks[taskId]);
		thunkApi.dispatch(downloadTags(tagsToSave));
		return Promise.resolve();
	}
);

export const downloadSelectedPosts = createAsyncThunk<void, void, ThunkApi>(
	'posts/downloadSelectedPosts',
	async (_, thunkApi): Promise<void> => {
		const posts = thunkApi.getState().posts.posts.filter((p) => p.selected);
		if (posts.length === 0) throw new Error('No posts selected');
		await thunkApi.dispatch(downloadPosts({ posts }));
		return Promise.resolve();
	}
);

export const downloadAllPosts = createAsyncThunk<void, void, ThunkApi>(
	'posts/downloadAllPosts',
	async (_, thunkApi): Promise<void> => {
		const posts = thunkApi.getState().posts.posts;
		if (posts.length === 0) throw new Error('No posts to download');
		await thunkApi.dispatch(downloadPosts({ posts }));
		return Promise.resolve();
	}
);

export const downloadWholeSearch = createAsyncThunk<void, void, ThunkApi>(
	'posts/downloadWholeSearch',
	async (_, thunkApi): Promise<void> => {
		const state = thunkApi.getState();
		const tags = state.onlineSearchForm.selectedTags;
		const excludedTags = state.onlineSearchForm.excludedTags;
		const tagsString = tags.map((tag) => tag.tag);
		const excludedTagString = excludedTags.map((tag) => tag.tag);
		const options: PostSearchOptions = {
			limit: 100,
			page: 0,
			rating: state.onlineSearchForm.rating,
			apiKey: state.settings.apiKey,
		};

		let posts = await api.getPostsForTags(tagsString, options, excludedTagString);
		let lastPage = 0;
		const totalPosts: Post[] = [...posts];
		await delay(2000);
		while (posts.length > 0) {
			const newOptions = {
				...options,
				page: ++lastPage,
			};
			posts = await api.getPostsForTags(tagsString, newOptions, excludedTagString);
			totalPosts.push(...posts);
			await delay(2000);
		}
		await thunkApi.dispatch(downloadPosts({ posts: totalPosts }));
		return Promise.resolve();
	}
);

export const blacklistPosts = createAsyncThunk<Post[], Post[], ThunkApi>(
	'posts/blacklistPosts',
	async (posts): Promise<Post[]> => {
		const resultPosts: Post[] = [];
		for (const p of posts) {
			deleteImage(p);
			const post = copyAndBlacklistPost(p);
			db.posts.update(post);
			resultPosts.push(post);
		}
		return resultPosts;
	}
);

export const blacklistAllPosts = createAsyncThunk<void, void, ThunkApi>(
	'posts/blacklistAllPosts',
	async (_, thunkApi): Promise<void> => {
		thunkApi.dispatch(blacklistPosts(thunkApi.getState().posts.posts)); // TODO throw when no posts
	}
);

export const blacklistSelectedPosts = createAsyncThunk<void, void, ThunkApi>(
	'posts/blacklistSelectedPosts',
	async (_, thunkApi): Promise<void> => {
		const posts = thunkApi.getState().posts.posts.filter((post) => post.selected); // TODO throw when no posts
		thunkApi.dispatch(blacklistPosts(posts));
	}
);

export const incrementViewCount = createAsyncThunk<Post, Post, ThunkApi>(
	'posts/incrementViewCount',
	async (post): Promise<Post> => {
		return db.posts.incrementViewcount(post);
	}
);
