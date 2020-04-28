import { db } from 'db';
import * as api from 'service/apiService';
import { AppThunk, ThunkApi } from 'store/types';
import { actions } from '../internal';
import { useSaveImage, useDeleteImage } from 'hooks/useImageBus';
import { Post, PostSearchOptions } from 'types/gelbooruTypes';
import { delay, deduplicateAndCheckTagsAgainstDb } from 'util/utils';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { thunks } from 'store/internal';

const saveImage = useSaveImage();

const copyAndBlacklistPost = (p: Post): Post => {
	const post = { ...p };
	post.blacklisted = 1;
	post.downloaded = 0;
	post.favorite = 0;
	post.selected = false;
	return post;
};

const downloadPost2 = (post: Post): AppThunk => async (dispatch, getState): Promise<void> => {
	try {
		const updatedPost = { ...post };
		saveImage(updatedPost);
		updatedPost.downloaded = 1;
		updatedPost.blacklisted = 0;
		db.posts.update(updatedPost);

		dispatch(actions.posts.updatePost(updatedPost));
		const filteredTags = await deduplicateAndCheckTagsAgainstDb(updatedPost.tags);
		const tagsFromApi = await api.getTagsByNames(filteredTags, getState().settings.apiKey);
		db.tags.saveBulk(tagsFromApi);
	} catch (err) {
		console.error('Error while downloading post', err);
	}
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

const downloadPosts = (posts: Post[], taskId?: number): AppThunk => async (dispatch, getState): Promise<void> => {
	try {
		const saveImage = useSaveImage();
		const tagsToSave: string[] = [];
		const updatedPosts: Post[] = [];
		let postsDone = 0;

		for (const p of posts) {
			await (async (): Promise<void> => {
				const post = { ...p };
				post.downloaded = 1;
				post.blacklisted = 0;
				post.selected = false;
				await db.posts.update(post);
				await saveImage(post);

				taskId && dispatch(actions.tasks.setProgress({ id: taskId, progress: (postsDone++ / (posts.length - 1)) * 100 }));

				updatedPosts.push(post);
				tagsToSave.push(...post.tags);
				return Promise.resolve();
			})();

			if (taskId && getState().tasks.tasks[taskId].isCanceled) {
				break;
			}
		}

		dispatch(actions.posts.updatePosts(updatedPosts));
		const filteredTags = await deduplicateAndCheckTagsAgainstDb(tagsToSave);
		const tagsFromApi = await api.getTagsByNames(filteredTags, getState().settings.apiKey);
		db.tags.saveBulk(tagsFromApi);
		return Promise.resolve();
	} catch (err) {
		console.error('Error while downloading all posts', err);
		return Promise.reject(err);
	}
};

const downloadSelectedPosts = (taskId?: number): AppThunk => async (dispatch, getState): Promise<void> => {
	const posts = getState().posts.posts.filter((p) => p.selected);
	return dispatch(downloadPosts(posts, taskId));
};
const downloadAllPosts = (taskId?: number): AppThunk<void> => async (dispatch, getState): Promise<void> => {
	const posts = getState().posts.posts;
	return dispatch(downloadPosts(posts, taskId));
};

const downloadWholeSearch = (taskId?: number): AppThunk => async (dispatch, getState): Promise<void> => {
	try {
		const tags = getState().onlineSearchForm.selectedTags;
		const excludedTags = getState().onlineSearchForm.excludededTags;
		const tagsString = tags.map((tag) => tag.tag);
		const excludedTagString = excludedTags.map((tag) => tag.tag);
		const options: PostSearchOptions = {
			limit: 100,
			page: 0,
			rating: getState().onlineSearchForm.rating,
			apiKey: getState().settings.apiKey,
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
		return dispatch(downloadPosts(totalPosts, taskId));
	} catch (err) {
		console.error('Error while downloading whole search', err);
		return Promise.reject(err);
	}
};

const blacklistPost = (post: Post): AppThunk => async (dispatch): Promise<void> => {
	try {
		const deleteImage = useDeleteImage();
		const updatedPost = copyAndBlacklistPost(post);
		deleteImage(updatedPost);
		await db.posts.update(updatedPost);

		dispatch(actions.posts.removePost(updatedPost));
	} catch (err) {
		console.error('Error occured while blacklisting a post', err, post);
	}
};

const blacklistSelectedPosts = (): AppThunk => async (dispatch, getState): Promise<void> => {
	try {
		const deleteImage = useDeleteImage();
		const posts = getState().posts.posts.filter((p) => p.selected);
		posts.forEach((p) => {
			const post = copyAndBlacklistPost(p);
			deleteImage(post);
			db.posts.update(post);
			dispatch(actions.posts.removePost(post));
		});
	} catch (err) {
		console.error('Error occured while blacklisting selected posts', err);
	}
};

const blackListAllPosts = (): AppThunk => async (dispatch, getStsate): Promise<void> => {
	try {
		const deleteImage = useDeleteImage();
		const posts = getStsate().posts.posts;
		posts.forEach((p) => {
			const post = copyAndBlacklistPost(p);
			deleteImage(post);
			db.posts.update(post);
			dispatch(actions.posts.removePost(post));
		});
	} catch (err) {
		console.error('Error occured while blacklisting all posts', err);
	}
};

const addSelectedPostsToFavorites = (): AppThunk => async (dispatch, getState): Promise<void> => {
	try {
		const posts = getState().posts.posts.filter((p) => p.selected);
		posts.forEach((p) => {
			const post = { ...p };
			post.favorite = 1;
			post.blacklisted = 0;
			post.selected = false;
			db.posts.update(post);
			dispatch(actions.posts.updatePost(post));
		});
	} catch (err) {
		console.error('Erroro ccured while adding selected posts to favorites', err);
	}
};

const addAllPostsToFavorites = (): AppThunk => async (dispatch, getState): Promise<void> => {
	try {
		const posts = getState().posts.posts;
		posts.forEach((p) => {
			const post = { ...p };
			post.favorite = 1;
			post.blacklisted = 0;
			post.selected = false;
			db.posts.update(post);
			dispatch(actions.posts.updatePost(post));
		});
	} catch (err) {
		console.error('Error occured while adding selected posts to favorites', err);
	}
};

const incrementViewCount = (post: Post): AppThunk => async (_): Promise<void> => {
	try {
		await db.posts.incrementviewcount(post);
		// dispatch(actions.posts.updatePost(updatedPost));
	} catch (err) {
		console.error('Error while incrementing viewCount of post', err, post);
	}
};

export const postsThunk = {
	downloadPosts,
	downloadSelectedPosts,
	downloadAllPosts,
	downloadPost,
	downloadWholeSearch,
	blacklistPost,
	blacklistSelectedPosts,
	blackListAllPosts,
	addSelectedPostsToFavorites,
	addAllPostsToFavorites,
	incrementViewCount,
};
