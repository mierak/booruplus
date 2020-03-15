import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Post } from '../types/gelbooruTypes';
import { AppThunk } from './main';
import { getPostsForTags, PostApiOptions } from '../service/apiService';
import { updatePostInDb, getFavoritePosts, saveOrUpdatePostFromApi } from '../db';
import { setLoading, setPage } from './searchForm';
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
			if (state.activePostIndex) {
				const index = state.activePostIndex === state.posts.length - 1 ? 0 : state.activePostIndex + 1;
				state.activePostIndex = index;
			}
		},
		previousPost: (state): void => {
			if (state.activePostIndex) {
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
	updatePost
} = postsSlice.actions;

export default postsSlice.reducer;

export const fetchPostsFromApi = (): AppThunk => async (dispatch, getState): Promise<void> => {
	try {
		dispatch(setLoading(true));
		//construct string of tags
		const tags = getState().searchForm.selectedTags;
		const tagsString = tags.map((tag) => tag.tag);
		const options: PostApiOptions = {
			limit: getState().searchForm.limit,
			page: getState().searchForm.page,
			rating: getState().searchForm.rating
		};
		//get posts from api
		const posts = await getPostsForTags(tagsString, options);
		//validate posts against db - check favorite/blacklisted/downloaded state
		const validatedPosts = await Promise.all(posts.map((post) => saveOrUpdatePostFromApi(post)));
		dispatch(setPosts(validatedPosts));
		dispatch(setLoading(false));
	} catch (err) {
		console.error('Error while fetching from api', err);
	}
};

export const loadMorePosts = (): AppThunk => async (dispatch, getState): Promise<void> => {
	try {
		dispatch(setLoading(true));
		const page = getState().searchForm.page;
		const tags = getState().searchForm.selectedTags;
		const tagsString = tags.map((tag) => tag.tag);
		const options: PostApiOptions = {
			limit: getState().searchForm.limit,
			page: page + 1,
			rating: getState().searchForm.rating
		};
		dispatch(setPage(page + 1));
		const posts = await getPostsForTags(tagsString, options);
		dispatch(addPosts(posts));
		dispatch(setLoading(false));
	} catch (err) {
		console.error('Error while loading more posts', err);
	}
};

export const loadFavoritePostsFromDb = (): AppThunk => async (dispatch): Promise<void> => {
	try {
		dispatch(setLoading(true));
		const posts = await getFavoritePosts();
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
		updatePostInDb(clonedPost);
		dispatch(updatePost(clonedPost));
	} catch (err) {
		console.error('Error while changing post properties', err);
	}
};

export const downloadSelectedPosts = (): AppThunk => async (dispatch, getState): Promise<void> => {
	try {
		const saveImage = useSaveImage();
		const posts = getState().posts.posts.filter((p) => p.selected);
		posts.forEach((p) => {
			const post = Object.assign({}, p);
			saveImage(post);
			post.downloaded = 1;
			post.blacklisted = 0;
			post.selected = false;
			updatePostInDb(post);
			dispatch(updatePost(post));
		});
	} catch (err) {
		console.error('Error while downloading favorite posts', err);
	}
};

export const downloadAllPosts = (): AppThunk => async (dispatch, getState): Promise<void> => {
	try {
		const saveImage = useSaveImage();
		getState().posts.posts.forEach((p) => {
			const post = Object.assign([], p);
			saveImage(post);
			post.downloaded = 1;
			post.blacklisted = 0;
			post.selected = false;
			updatePostInDb(post);
			dispatch(updatePost(post));
		});
	} catch (err) {
		console.error('Error while downloading all posts', err);
	}
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
			updatePostInDb(post);
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
			updatePostInDb(post);
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
			updatePostInDb(post);
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
			updatePostInDb(post);
			dispatch(removePost(post));
		});
	} catch (err) {
		console.error('Erroroccured while adding selected posts to favorites', err);
	}
};
