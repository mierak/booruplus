import { Tag, Rating } from '../types/gelbooruTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk } from './main';
import * as api from '../service/apiService';
import * as db from '../db';
import { setPosts, addPosts, setActivePostIndex } from './posts';

export type SearchMode = 'online' | 'offline';

interface OfflineOptions {
	blacklisted: boolean;
	favorite: boolean;
}

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

export const {
	addTag,
	removeTag,
	clearTags,
	setLimit,
	setRating,
	setPage,
	setLoading,
	setSelectedTags,
	setSearchMode,
	setTagOptions,
	setOfflineOptions
} = searchFormSlice.actions;

export const getTagsByPatternFromApi = (value: string): AppThunk => async (dispatch): Promise<void> => {
	try {
		const tags = await api.getTagsByPattern(value);
		dispatch(setTagOptions(tags));
	} catch (err) {
		console.error('Error occured while fetching posts from api by pattern', err);
	}
};

export const fetchPostsFromApi = (): AppThunk => async (dispatch, getState): Promise<void> => {
	try {
		//construct string of tags
		const tags = getState().searchForm.selectedTags;
		const tagsString = tags.map((tag) => tag.tag);
		const options: api.PostApiOptions = {
			limit: getState().searchForm.limit,
			page: getState().searchForm.page,
			rating: getState().searchForm.rating
		};
		//get posts from api
		const posts = await api.getPostsForTags(tagsString, options);
		//validate posts against db - check favorite/blacklisted/downloaded state
		const validatedPosts = await Promise.all(posts.map((post) => db.saveOrUpdatePostFromApi(post)));
		dispatch(setPosts(validatedPosts));
	} catch (err) {
		console.error('Error while fetching from api', err);
	}
};

export const fetchPostsFromDb = (): AppThunk => async (dispatch, getState): Promise<void> => {
	try {
		const tagsString = getState().searchForm.selectedTags.map((tag) => tag.tag);
		const posts = await db.getPostsForTags(...tagsString);
		dispatch(setPosts(posts));
	} catch (err) {
		console.error('Erroru occured while fetching posts from db', err);
	}
};

export const fetchPosts = (): AppThunk => async (dispatch, getState): Promise<void> => {
	try {
		dispatch(setLoading(true));
		if (getState().searchForm.searchMode === 'online') {
			dispatch(fetchPostsFromApi());
		} else {
			dispatch(fetchPostsFromDb());
		}
		dispatch(setActivePostIndex(undefined));
		dispatch(setLoading(false));
	} catch (err) {
		console.error('Error occured while trying to fetch posts', err);
	}
};

export const loadMorePosts = (): AppThunk => async (dispatch, getState): Promise<void> => {
	try {
		dispatch(setLoading(true));
		const page = getState().searchForm.page;
		const tags = getState().searchForm.selectedTags;
		const tagsString = tags.map((tag) => tag.tag);
		const options: api.PostApiOptions = {
			limit: getState().searchForm.limit,
			page: page + 1,
			rating: getState().searchForm.rating
		};
		dispatch(setPage(page + 1));
		const posts = await api.getPostsForTags(tagsString, options);
		dispatch(addPosts(posts));
		dispatch(setLoading(false));
	} catch (err) {
		console.error('Error while loading more posts', err);
	}
};

export default searchFormSlice.reducer;
