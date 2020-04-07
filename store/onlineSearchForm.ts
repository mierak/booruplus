import { Tag, Rating } from '../types/gelbooruTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { actions as globalActions } from '.';
import { AppThunk, OfflineOptions } from './types';

import * as api from '../service/apiService';
import * as db from '../db';

export interface SearchFormState {
	selectedTags: Tag[];
	limit: number;
	rating: Rating;
	page: number;
	loading: boolean;
	tagOptions: Tag[];
	offlineOptions: OfflineOptions;
}

export const initialState: SearchFormState = {
	selectedTags: [],
	limit: 100,
	rating: 'any',
	page: 0,
	loading: false,
	tagOptions: [],
	offlineOptions: {
		blacklisted: false,
		favorite: false
	}
};

const searchFormSlice = createSlice({
	name: 'searchForm',
	initialState: initialState,
	reducers: {
		addTag: (state, action: PayloadAction<Tag>): void => {
			!state.selectedTags.includes(action.payload) && state.selectedTags.push(action.payload);
		},
		removeTag: (state, action: PayloadAction<Tag>): void => {
			const index = state.selectedTags.findIndex((t) => t.id === action.payload.id);
			state.selectedTags.splice(index, 1);
		},
		clearTags: (state): void => {
			state.selectedTags = [];
		},
		setLimit: (state, action: PayloadAction<number>): void => {
			state.limit = action.payload;
		},
		setRating: (state, action: PayloadAction<Rating>): void => {
			state.rating = action.payload;
		},
		setPage: (state, action: PayloadAction<number>): void => {
			state.page = action.payload;
		},
		setLoading: (state, action: PayloadAction<boolean>): void => {
			state.loading = action.payload;
		},
		setSelectedTags: (state, action: PayloadAction<Tag[]>): void => {
			state.selectedTags = action.payload;
		},
		setTagOptions: (state, action: PayloadAction<Tag[]>): void => {
			state.tagOptions = action.payload;
		},
		setOfflineOptions: (state, action: PayloadAction<OfflineOptions>): void => {
			state.offlineOptions = action.payload;
		},
		clear: (): SearchFormState => {
			return initialState;
		}
	}
});

const getTagsByPatternFromApi = (value: string): AppThunk => async (dispatch): Promise<void> => {
	try {
		dispatch(globalActions.system.setTagOptionsLoading(true));
		const tags = await api.getTagsByPattern(value);
		dispatch(searchFormSlice.actions.setTagOptions(tags));
	} catch (err) {
		console.error('Error occured while fetching posts from api by pattern', err);
	}
	dispatch(globalActions.system.setTagOptionsLoading(false));
};
const fetchPostsFromApi = (): AppThunk => async (dispatch, getState): Promise<void> => {
	try {
		dispatch(globalActions.system.setFetchingPosts(true));
		dispatch(globalActions.posts.setPosts([]));
		//construct string of tags
		const tags = getState().onlineSearchForm.selectedTags;
		const tagsString = tags.map((tag) => tag.tag);
		const options: api.PostApiOptions = {
			limit: getState().onlineSearchForm.limit,
			page: getState().onlineSearchForm.page,
			rating: getState().onlineSearchForm.rating
		};
		//get posts from api
		const posts = await api.getPostsForTags(tagsString, options);
		dispatch(globalActions.system.setFetchingPosts(false));
		//validate posts against db - check favorite/blacklisted/downloaded state

		posts.forEach(async (post) => {
			dispatch(globalActions.posts.addPosts([await db.posts.saveOrUpdateFromApi(post)]));
		});
		// dispatch(globalActions.posts.setPosts(validatedPosts));
		db.tagSearchHistory.saveSearch(tags);
	} catch (err) {
		console.error('Error while fetching from api', err);
	}
};

const fetchPostsFromDb = (): AppThunk => async (dispatch, getState): Promise<void> => {
	try {
		const tagsString = getState().onlineSearchForm.selectedTags.map((tag) => tag.tag);
		const posts = await db.posts.getForTags(...tagsString);
		dispatch(globalActions.posts.setPosts(posts));
	} catch (err) {
		console.error('Erroru occured while fetching posts from db', err);
	}
};

const fetchPosts = (): AppThunk<void> => async (dispatch): Promise<void> => {
	try {
		await dispatch(fetchPostsFromApi());
		return Promise.resolve();
	} catch (err) {
		console.error('Error occured while trying to fetch posts', err);
		return Promise.reject(err);
	}
};

const fetchMorePosts = (): AppThunk<void> => async (dispatch, getState): Promise<void> => {
	try {
		const page = getState().onlineSearchForm.page;
		const tags = getState().onlineSearchForm.selectedTags;
		const tagsString = tags.map((tag) => tag.tag);
		const options: api.PostApiOptions = {
			limit: getState().onlineSearchForm.limit,
			page: page + 1,
			rating: getState().onlineSearchForm.rating
		};
		dispatch(searchFormSlice.actions.setPage(page + 1));
		const posts = await api.getPostsForTags(tagsString, options);
		dispatch(globalActions.posts.addPosts(posts));
		return Promise.resolve();
	} catch (err) {
		console.error('Error while loading more posts', err);
		return Promise.reject(err);
	}
};

export const actions = {
	...searchFormSlice.actions,
	getTagsByPatternFromApi,
	fetchPostsFromApi,
	fetchPostsFromDb,
	fetchPosts,
	fetchMorePosts
};

export default searchFormSlice.reducer;
