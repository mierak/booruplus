import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { actions as globalActions } from '.';
import { AppThunk } from './types';

import { useSaveImage, useDeleteImage } from '../src/hooks/useImageBus';
import { Post } from '../types/gelbooruTypes';
import * as api from '../service/apiService';
import { db } from '../db';
import { PostPropertyOptions } from './types';
import { delay } from 'util/utils';

export interface PostsState {
	activePostIndex: number | undefined;
	posts: Post[];
}

const initialState: PostsState = {
	activePostIndex: undefined,
	posts: [],
};

const postsSlice = createSlice({
	name: 'posts',
	initialState: initialState,
	reducers: {
		setActivePostIndex: (state, action: PayloadAction<number | undefined>): void => {
			state.activePostIndex = action.payload;
		},
		removePost: (state, action: PayloadAction<Post>): void => {
			const index = state.posts.findIndex((p: Post) => p.id === action.payload.id); //TODO returns -1 not undefined, test if correctly removes
			state.posts.splice(index, 1);
			state.activePostIndex = index;
		},
		setPosts: (state, action: PayloadAction<Post[]>): void => {
			state.posts = action.payload;
		},
		addPosts: (state, action: PayloadAction<Post[]>): void => {
			state.posts.push(...action.payload);
		},
		updatePost: (state, action: PayloadAction<Post>): void => {
			const index = state.posts.findIndex((p) => p.id === action.payload.id);
			state.posts[index] = action.payload;
		},
		updatePosts: (state, action: PayloadAction<Post[]>): void => {
			const posts = action.payload;
			posts.forEach((post) => {
				const index = state.posts.findIndex((p) => p.id === post.id);
				state.posts[index] = post;
			});
		},
		setPostFavorite: (state, action: PayloadAction<{ index: number; favorite: 1 | 0 }>): void => {
			state.posts[action.payload.index].favorite = action.payload.favorite;
		},
		setPostIndexSelected: (state, action: PayloadAction<{ index: number; selected: boolean }>): void => {
			state.posts[action.payload.index].selected = action.payload.selected;
		},
		setPostSelected: (state, action: PayloadAction<{ post: Post; selected: boolean }>): void => {
			const post = state.posts.find((p) => p.id === action.payload.post.id);
			post && (post.selected = action.payload.selected);
		},
		setPostBlacklisted: (state, action: PayloadAction<{ index: number; blacklisted: 1 | 0 }>): void => {
			state.posts[action.payload.index].blacklisted = action.payload.blacklisted;
		},
	},
});

export default postsSlice.reducer;

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

const fetchFavorites = (): AppThunk => async (dispatch): Promise<void> => {
	try {
		dispatch(globalActions.onlineSearchForm.setLoading(true));
		const posts = await db.posts.getFavorites();
		dispatch(globalActions.posts.setActivePostIndex(undefined));
		dispatch(globalActions.posts.setPosts(posts));
		dispatch(globalActions.onlineSearchForm.setLoading(false));
	} catch (err) {
		console.error('Error while retrieving favorite posts from db', err);
	}
};

const fetchMostViewedPosts = (limit = 20): AppThunk => async (dispatch): Promise<void> => {
	try {
		const posts = await db.posts.getMostViewed(limit);
		dispatch(postsSlice.actions.setPosts(posts));
	} catch (err) {
		console.error('Error while fetching most viewed posts from db', err);
	}
};

const downloadPost = (post: Post): AppThunk => async (dispatch, getState): Promise<void> => {
	try {
		const saveImage = useSaveImage();
		const updatedPost = { ...post };
		saveImage(updatedPost);
		updatedPost.downloaded = 1;
		updatedPost.blacklisted = 0;
		db.posts.update(updatedPost);

		dispatch(postsSlice.actions.updatePost(updatedPost));
		const filteredTags = await deduplicateAndCheckTagsAgainstDb(updatedPost.tags);
		const tagsFromApi = await api.getTagsByNames(filteredTags, getState().settings.apiKey);
		db.tags.saveBulk(tagsFromApi);
	} catch (err) {
		console.error('Error while downloading post', err);
	}
};

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

				taskId && dispatch(globalActions.tasks.setProgress({ id: taskId, progress: (postsDone++ / (posts.length - 1)) * 100 }));

				updatedPosts.push(post);
				tagsToSave.push(...post.tags);
				return Promise.resolve();
			})();

			if (taskId && getState().tasks.tasks[taskId].isCanceled) {
				break;
			}
		}

		dispatch(globalActions.posts.updatePosts(updatedPosts));
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
		const options: api.PostApiOptions = {
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

const copyAndBlacklistPost = (p: Post): Post => {
	const post = { ...p };
	post.blacklisted = 1;
	post.downloaded = 0;
	post.favorite = 0;
	post.selected = false;
	return post;
};

const blacklistPost = (post: Post): AppThunk => async (dispatch): Promise<void> => {
	try {
		const deleteImage = useDeleteImage();
		const updatedPost = copyAndBlacklistPost(post);
		deleteImage(updatedPost);
		await db.posts.update(updatedPost);

		dispatch(globalActions.posts.removePost(updatedPost));
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
			dispatch(globalActions.posts.removePost(post));
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
			dispatch(globalActions.posts.removePost(post));
		});
	} catch (err) {
		console.error('Error occured while blacklisting all posts', err);
	}
};

const changePostProperties = (post: Post, options: PostPropertyOptions): AppThunk => async (dispatch): Promise<void> => {
	try {
		const clonedPost = { ...post };
		options.blacklisted !== undefined && (clonedPost.blacklisted = options.blacklisted);
		options.favorite !== undefined && (clonedPost.favorite = options.favorite);
		options.downloaded !== undefined && (clonedPost.downloaded = options.downloaded);
		options.blacklisted === 1 && dispatch(globalActions.posts.removePost(post));
		db.posts.update(clonedPost);
		dispatch(globalActions.posts.updatePost(clonedPost));
	} catch (err) {
		console.error('Error while changing post properties', err);
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
			dispatch(globalActions.posts.updatePost(post));
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
			dispatch(globalActions.posts.updatePost(post));
		});
	} catch (err) {
		console.error('Error occured while adding selected posts to favorites', err);
	}
};

const nextPost = (): AppThunk => async (dispatch, getState): Promise<void> => {
	const activePostIndex = getState().posts.activePostIndex;
	if (activePostIndex !== undefined) {
		const index = activePostIndex === getState().posts.posts.length - 1 ? 0 : activePostIndex + 1;
		dispatch(postsSlice.actions.setActivePostIndex(index));
	}
};
const previousPost = (): AppThunk => async (dispatch, getState): Promise<void> => {
	const activePostIndex = getState().posts.activePostIndex;
	if (activePostIndex !== undefined) {
		const index = activePostIndex === 0 ? getState().posts.posts.length - 1 : activePostIndex - 1;
		dispatch(postsSlice.actions.setActivePostIndex(index));
	}
};

const incrementViewCount = (post: Post): AppThunk => async (dispatch): Promise<void> => {
	try {
		const updatedPost = await db.posts.incrementviewcount(post);
		// dispatch(postsSlice.actions.updatePost(updatedPost));
	} catch (err) {
		console.error('Error while incrementing viewCount of post', err, post);
	}
};

export const actions = {
	...postsSlice.actions,
	downloadPosts,
	fetchFavorites,
	fetchMostViewedPosts,
	changePostProperties,
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
	previousPost,
	nextPost,
};
