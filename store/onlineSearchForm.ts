import { Tag, Rating } from '../types/gelbooruTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { OfflineOptions } from './types';

import * as thunks from './thunks';

export interface SearchFormState {
	selectedTags: Tag[];
	excludededTags: Tag[];
	limit: number;
	rating: Rating;
	page: number;
	loading: boolean;
	tagOptions: Tag[];
	offlineOptions: OfflineOptions;
}

export const initialState: SearchFormState = {
	selectedTags: [],
	excludededTags: [],
	limit: 100,
	rating: 'any',
	page: 0,
	loading: false,
	tagOptions: [],
	offlineOptions: {
		blacklisted: false,
		favorite: false,
	},
};

const searchFormSlice = createSlice({
	name: 'searchForm',
	initialState: initialState,
	reducers: {
		addTag: (state, action: PayloadAction<Tag>): void => {
			!state.selectedTags.includes(action.payload) && state.selectedTags.push(action.payload);
		},
		addExcludedTag: (state, action: PayloadAction<Tag>): void => {
			!state.excludededTags.includes(action.payload) && state.excludededTags.push(action.payload);
		},
		removeTag: (state, action: PayloadAction<Tag>): void => {
			const index = state.selectedTags.findIndex((t) => t.id === action.payload.id);
			state.selectedTags.splice(index, 1);
		},
		removeExcludedTag: (state, action: PayloadAction<Tag>): void => {
			const index = state.excludededTags.findIndex((t) => t.id === action.payload.id);
			state.excludededTags.splice(index, 1);
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
		setExcludedTags: (state, action: PayloadAction<Tag[]>): void => {
			state.excludededTags = action.payload;
		},
		setTagOptions: (state, action: PayloadAction<Tag[]>): void => {
			state.tagOptions = action.payload;
		},
		setOfflineOptions: (state, action: PayloadAction<OfflineOptions>): void => {
			state.offlineOptions = action.payload;
		},
		clear: (): SearchFormState => {
			return initialState;
		},
	},
	extraReducers: (builder) => {
		console.log(thunks);
		builder.addCase(thunks.onlineSearchForm.getTagsByPatternFromApi.fulfilled, (state, action) => {
			state.tagOptions = action.payload;
		});
		builder.addCase(thunks.onlineSearchForm.fetchMorePosts.fulfilled, (state) => {
			state.page = state.page + 1;
		});
		builder.addCase(thunks.savedSearches.searchOnline.pending, (state, action) => {
			state.page = 0;
			state.selectedTags = action.meta.arg.tags;
			state.excludededTags = action.meta.arg.excludedTags;
		});
		builder.addCase(thunks.tags.searchTagOnline.pending, (state, action) => {
			state.page = 0;
			state.selectedTags = [action.meta.arg];
			state.excludededTags = [];
		});
	},
});

export const actions = searchFormSlice.actions;

export default searchFormSlice.reducer;
