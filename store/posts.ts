import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Post } from '../types/gelbooruTypes';
import { AppThunk } from './main';
import * as api from '../service/apiService';
import * as db from '../db';
import { setLoading } from './searchForm';
import { useSaveImage, useDeleteImage } from '../src/hooks/useImageBus';

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
		},
		nextPost: (state): void => {
			if (state.activePostIndex !== undefined) {
				const index = state.activePostIndex === state.posts.length - 1 ? 0 : state.activePostIndex + 1;
				state.activePostIndex = index;
			}
		},
		previousPost: (state): void => {
			if (state.activePostIndex !== undefined) {
				const index = state.activePostIndex === 0 ? state.posts.length - 1 : state.activePostIndex - 1;
				state.activePostIndex = index;
			}
		}
	}
});

export const {
	setActivePostIndex,
	removePost,
	setPosts,
	addPosts,
	setPostFavorite,
	setPostSelected,
	setPostIndexSelected,
	setPostBlacklisted,
	nextPost,
	previousPost,
	updatePost,
	updatePosts
} = postsSlice.actions;

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

export const downloadPosts = (posts: Post[]): AppThunk => async (dispatch): Promise<void> => {
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
		dispatch(updatePosts(updatedPosts));
		const filteredTags = await deduplicateAndCheckTagsAgainstDb(tagsToSave);
		const tagsFromApi = await api.getTagsByNames(...filteredTags);
		db.tags.saveBulk(tagsFromApi);
	} catch (err) {
		console.error('Error while downloading all posts', err);
	}
};

export const loadFavoritePostsFromDb = (): AppThunk => async (dispatch): Promise<void> => {
	try {
		dispatch(setLoading(true));
		const posts = await db.posts.getFavorites();
		dispatch(setActivePostIndex(undefined));
		dispatch(setPosts(posts));
		dispatch(setLoading(false));
	} catch (err) {
		console.error('Error while retrieving favorite posts from db', err);
	}
};

interface PostPropertyOptions {
	blacklisted?: 0 | 1;
	favorite?: 0 | 1;
	downloaded?: 0 | 1;
}

export const changePostProperties = (post: Post, options: PostPropertyOptions): AppThunk => async (dispatch): Promise<void> => {
	try {
		const clonedPost = Object.assign({}, post);
		options.blacklisted !== undefined && (clonedPost.blacklisted = options.blacklisted);
		options.favorite !== undefined && (clonedPost.favorite = options.favorite);
		options.downloaded !== undefined && (clonedPost.downloaded = options.downloaded);
		options.blacklisted === 1 && dispatch(removePost(post));
		db.posts.update(clonedPost);
		dispatch(updatePost(clonedPost));
	} catch (err) {
		console.error('Error while changing post properties', err);
	}
};

export const downloadSelectedPosts = (): AppThunk => async (dispatch, getState): Promise<void> => {
	const posts = getState().posts.posts.filter((p) => p.selected);
	dispatch(downloadPosts(posts));
};

export const downloadAllPosts = (): AppThunk => async (dispatch, getState): Promise<void> => {
	const posts = getState().posts.posts;
	dispatch(downloadPosts(posts));
};

const blackListPost = (p: Post): Post => {
	const post = Object.assign({}, p);
	post.blacklisted = 1;
	post.downloaded = 0;
	post.favorite = 0;
	post.selected = false;
	return post;
};

export const blacklistSelectedPosts = (): AppThunk => async (dispatch, getState): Promise<void> => {
	try {
		const deleteImage = useDeleteImage();
		const posts = getState().posts.posts.filter((p) => p.selected);
		posts.forEach((p) => {
			const post = blackListPost(p);
			deleteImage(post);
			db.posts.update(post);
			dispatch(removePost(post));
		});
	} catch (err) {
		console.error('Error occured while blacklisting selected posts', err);
	}
};

export const blackListAllPosts = (): AppThunk => async (dispatch, getStsate): Promise<void> => {
	try {
		const deleteImage = useDeleteImage();
		const posts = getStsate().posts.posts;
		posts.forEach((p) => {
			const post = blackListPost(p);
			deleteImage(post);
			db.posts.update(post);
			dispatch(removePost(post));
		});
	} catch (err) {
		console.error('Error occured while blacklisting all posts', err);
	}
};

export const addSelectedPostsToFavorites = (): AppThunk => async (dispatch, getState): Promise<void> => {
	try {
		const posts = getState().posts.posts.filter((p) => p.selected);
		posts.forEach((p) => {
			const post = Object.assign({}, p);
			p.favorite = 1;
			p.blacklisted = 0;
			post.selected = false;
			db.posts.update(post);
			dispatch(removePost(post));
		});
	} catch (err) {
		console.error('Erroroccured while adding selected posts to favorites', err);
	}
};

export const addAllPostsToFavorites = (): AppThunk => async (dispatch, getState): Promise<void> => {
	try {
		const posts = getState().posts.posts;
		posts.forEach((p) => {
			const post = Object.assign({}, p);
			p.favorite = 1;
			p.blacklisted = 0;
			post.selected = false;
			db.posts.update(post);
			dispatch(removePost(post));
		});
	} catch (err) {
		console.error('Erroroccured while adding selected posts to favorites', err);
	}
};
