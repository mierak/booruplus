import { Tag, Rating } from '../types/gelbooruTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { actions as globalActions } from '.';
import { AppThunk, SearchMode, OfflineOptions } from './types';

import * as api from '../service/apiService';
import * as db from '../db';

export interface SearchFormState {
	selectedTags: Tag[];
	limit: number;
	rating: Rating;
	page: number;
	loading: boolean;
	searchMode: SearchMode;
	tagOptions: Tag[];
	offlineOptions: OfflineOptions;
}

export const initialState: SearchFormState = {
	selectedTags: [],
	limit: 100,
	rating: 'any',
	page: 0,
	loading: false,
	searchMode: 'online',
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
		setSearchMode: (state, action: PayloadAction<SearchMode>): void => {
			state.searchMode = action.payload;
		},
		setTagOptions: (state, action: PayloadAction<Tag[]>): void => {
			state.tagOptions = action.payload;
		},
		setOfflineOptions: (state, action: PayloadAction<OfflineOptions>): void => {
			state.offlineOptions = action.payload;
		}
	}
});

const getTagsByPatternFromApi = (value: string): AppThunk => async (dispatch): Promise<void> => {
	try {
		const tags = await api.getTagsByPattern(value);
		dispatch(searchFormSlice.actions.setTagOptions(tags));
	} catch (err) {
		console.error('Error occured while fetching posts from api by pattern', err);
	}
};
const fetchPostsFromApi = (): AppThunk => async (dispatch, getState): Promise<void> => {
	try {
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
		//validate posts against db - check favorite/blacklisted/downloaded state
		const validatedPosts = await Promise.all(posts.map((post) => db.posts.saveOrUpdateFromApi(post)));
		dispatch(globalActions.posts.setPosts(validatedPosts));
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

const fetchPosts = (): AppThunk => async (dispatch, getState): Promise<void> => {
	try {
		dispatch(globalActions.system.setFetchingPosts(true));
		if (getState().onlineSearchForm.searchMode === 'online') {
			dispatch(fetchPostsFromApi());
		} else {
			dispatch(fetchPostsFromDb());
		}
		dispatch(globalActions.posts.setActivePostIndex(undefined));
	} catch (err) {
		console.error('Error occured while trying to fetch posts', err);
	}
	dispatch(globalActions.system.setFetchingPosts(false));
};

const loadMorePosts = (): AppThunk => async (dispatch, getState): Promise<void> => {
	try {
		dispatch(searchFormSlice.actions.setLoading(true));
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
		dispatch(searchFormSlice.actions.setLoading(false));
	} catch (err) {
		console.error('Error while loading more posts', err);
	}
};

export const actions = {
	...searchFormSlice.actions,
	getTagsByPatternFromApi,
	fetchPostsFromApi,
	fetchPostsFromDb,
	fetchPosts,
	loadMorePosts
};

export default searchFormSlice.reducer;
