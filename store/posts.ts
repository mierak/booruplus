import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { actions as globalActions } from '.';
import { AppThunk } from './types';

import { useSaveImage, useDeleteImage } from '../src/hooks/useImageBus';
import { Post } from '../types/gelbooruTypes';
import * as api from '../service/apiService';
import * as db from '../db';
import { PostPropertyOptions } from './types';

export interface PostsState {
	activePostIndex: number | undefined;
	posts: Post[];
}

const initialState: PostsState = {
	activePostIndex: 0,
	posts: []
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
		}
		// nextPost: (state): void => {
		// 	if (state.activePostIndex !== undefined) {
		// 		const index = state.activePostIndex === state.posts.length - 1 ? 0 : state.activePostIndex + 1;
		// 		state.activePostIndex = index;
		// 	}
		// },
		// previousPost: (state): void => {
		// 	if (state.activePostIndex !== undefined) {
		// 		const index = state.activePostIndex === 0 ? state.posts.length - 1 : state.activePostIndex - 1;
		// 		state.activePostIndex = index;
		// 	}
		// }
	}
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

const downloadPosts = (posts: Post[]): AppThunk => async (dispatch): Promise<void> => {
	try {
		const saveImage = useSaveImage();
		const tagsToSave: string[] = [];
		const updatedPosts = posts.map((p) => {
			const post = Object.assign({}, p);
			saveImage(post);
			tagsToSave.push(...post.tags);
			post.downloaded = 1;
			post.blacklisted = 0;
			post.selected = false;
			db.posts.update(post);
			return post;
		});
		dispatch(globalActions.posts.updatePosts(updatedPosts));
		const filteredTags = await deduplicateAndCheckTagsAgainstDb(tagsToSave);
		const tagsFromApi = await api.getTagsByNames(...filteredTags);
		db.tags.saveBulk(tagsFromApi);
	} catch (err) {
		console.error('Error while downloading all posts', err);
	}
};

const downloadPost = (post: Post): AppThunk => async (dispatch): Promise<void> => {
	try {
		const saveImage = useSaveImage();
		const updatedPost = Object.assign({}, post);
		saveImage(updatedPost);
		updatedPost.downloaded = 1;
		updatedPost.blacklisted = 0;
		db.posts.update(updatedPost);

		dispatch(postsSlice.actions.updatePost(updatedPost));
		const filteredTags = await deduplicateAndCheckTagsAgainstDb(updatedPost.tags);
		const tagsFromApi = await api.getTagsByNames(...filteredTags);
		db.tags.saveBulk(tagsFromApi);
	} catch (err) {
		console.error('Error while downloading post', err);
	}
};

const loadFavoritePostsFromDb = (): AppThunk => async (dispatch): Promise<void> => {
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

const downloadSelectedPosts = (): AppThunk => async (dispatch, getState): Promise<void> => {
	const posts = getState().posts.posts.filter((p) => p.selected);
	dispatch(downloadPosts(posts));
};
const downloadAllPosts = (): AppThunk => async (dispatch, getState): Promise<void> => {
	const posts = getState().posts.posts;
	dispatch(downloadPosts(posts));
};

const copyAndBlacklistPost = (p: Post): Post => {
	const post = Object.assign({}, p);
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
		console.log('updatedPost', updatedPost);
		deleteImage(updatedPost);
		await db.posts.update(updatedPost);
		const p = await db.posts.getById(updatedPost);
		console.log('p', p);

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
		const clonedPost = Object.assign({}, post);
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
			const post = Object.assign({}, p);
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
			const post = Object.assign({}, p);
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

export const actions = {
	...postsSlice.actions,
	downloadPosts,
	loadFavoritePostsFromDb,
	changePostProperties,
	downloadSelectedPosts,
	downloadAllPosts,
	downloadPost,
	blacklistPost,
	blacklistSelectedPosts,
	blackListAllPosts,
	addSelectedPostsToFavorites,
	addAllPostsToFavorites,
	previousPost,
	nextPost
};
