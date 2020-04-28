import { db } from 'db';
import * as api from 'service/apiService';
import { ThunkApi } from 'store/types';
import { actions } from '../internal';
import { useSaveImage, useDeleteImage } from 'hooks/useImageBus';
import { Post, PostSearchOptions } from 'types/gelbooruTypes';
import { delay } from 'util/utils';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { thunks } from 'store/internal';
import { useProgress } from 'hooks/useProgress';

const saveImage = useSaveImage();
const deleteImage = useDeleteImage();

const deduplicateAndCheckTagsAgainstDb = async (tags: string[]): Promise<string[]> => {
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

const copyAndBlacklistPost = (p: Post): Post => {
	const post = { ...p };
	post.blacklisted = 1;
	post.downloaded = 0;
	post.favorite = 0;
	post.selected = false;
	return post;
};

const downloadPost = createAsyncThunk<Post, Post, ThunkApi>(
	'posts/downloadPost',
	async (post, thunkApi): Promise<Post> => {
		const updatedPost = { ...post };
		saveImage(updatedPost);
		updatedPost.downloaded = 1;
		updatedPost.blacklisted = 0;
		db.posts.update(updatedPost);

		thunkApi.dispatch(thunks.tags.downloadTags(updatedPost.tags));
		return updatedPost;
	}
);

const downloadPosts = createAsyncThunk<Post[], { posts: Post[]; taskId?: number }, ThunkApi>(
	'posts/downloadPosts',
	async (params, thunkApi): Promise<Post[]> => {
		const state = thunkApi.getState();

		const tagsToSave: string[] = [];
		const updatedPosts: Post[] = [];
		let postsDone = 0;

		for (const p of params.posts) {
			const post = { ...p };
			saveImage(post);
			post.downloaded = 1;
			post.blacklisted = 0;
			db.posts.update(post);

			await db.posts.update(post);
			await saveImage(post);

			params.taskId &&
				thunkApi.dispatch(actions.tasks.setProgress({ id: params.taskId, progress: (postsDone++ / (params.posts.length - 1)) * 100 }));

			updatedPosts.push(post);
			tagsToSave.push(...post.tags);

			if (params.taskId && state.tasks.tasks[params.taskId].isCanceled) {
				break;
			}
		}

		const filteredTags = await deduplicateAndCheckTagsAgainstDb(tagsToSave);
		const tagsFromApi = await api.getTagsByNames(filteredTags, state.settings.apiKey);
		db.tags.saveBulk(tagsFromApi);
		return updatedPosts;
	}
);

const downloadSelectedPosts = createAsyncThunk<void, void, ThunkApi>(
	'posts/downloadSelectedPosts',
	async (_, thunkApi): Promise<void> => {
		const [id, close] = await useProgress(thunkApi.dispatch);
		const posts = thunkApi.getState().posts.posts.filter((p) => p.selected);
		await thunkApi.dispatch(downloadPosts({ posts, taskId: id }));
		close();
		return Promise.resolve();
	}
);

const downloadAllPosts = createAsyncThunk<void, void, ThunkApi>(
	'posts/downloadAllPosts',
	async (_, thunkApi): Promise<void> => {
		const [id, close] = await useProgress(thunkApi.dispatch);
		const posts = thunkApi.getState().posts.posts;
		await thunkApi.dispatch(downloadPosts({ posts, taskId: id }));
		close();
		return Promise.resolve();
	}
);

const downloadWholeSearch = createAsyncThunk<void, void, ThunkApi>(
	'posts/downloadWholeSearch',
	async (_, thunkApi): Promise<void> => {
		const [id, close] = await useProgress(thunkApi.dispatch);
		const state = thunkApi.getState();
		const tags = state.onlineSearchForm.selectedTags;
		const excludedTags = state.onlineSearchForm.excludededTags;
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
		await thunkApi.dispatch(downloadPosts({ posts: totalPosts, taskId: id }));
		close();
		return Promise.resolve();
	}
);

const blacklistPosts = createAsyncThunk<Post[], Post[], ThunkApi>(
	'posts/blacklistPosts',
	async (posts): Promise<Post[]> => {
		const resultPosts: Post[] = [];
		for (const p of posts) {
			const post = copyAndBlacklistPost(p);
			deleteImage(post);
			db.posts.update(post);
			resultPosts.push(post);
		}
		return resultPosts;
	}
);

const blacklistAllPosts = createAsyncThunk<void, void, ThunkApi>(
	'posts/blacklistAllPosts',
	async (_, thunkApi): Promise<void> => {
		thunkApi.dispatch(blacklistPosts(thunkApi.getState().posts.posts));
	}
);

const blacklistSelectedPosts = createAsyncThunk<void, void, ThunkApi>(
	'posts/blacklistSelectedPosts',
	async (_, thunkApi): Promise<void> => {
		const posts = thunkApi.getState().posts.posts.filter((post) => post.selected);
		thunkApi.dispatch(blacklistPosts(posts));
	}
);

const incrementViewCount = createAsyncThunk<Post, Post, ThunkApi>(
	'posts/incrementViewCount',
	async (post): Promise<Post> => {
		return db.posts.incrementviewcount(post);
	}
);

export const postsThunk = {
	downloadPosts,
	downloadSelectedPosts,
	downloadAllPosts,
	downloadPost,
	downloadWholeSearch,
	blacklistPosts,
	blacklistSelectedPosts,
	blacklistAllPosts,
	incrementViewCount,
};
