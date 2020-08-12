import { Tag, Rating } from '../types/gelbooruTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Sort, SortOrder } from './types';

import * as thunks from './thunks';

export interface SearchFormState {
	selectedTags: Tag[];
	excludedTags: Tag[];
	limit: number;
	rating: Rating;
	page: number;
	tagOptions: Tag[];
	sort: Sort;
	sortOrder: SortOrder;
}

export const initialState: SearchFormState = {
	selectedTags: [],
	excludedTags: [],
	limit: 100,
	rating: 'any',
	page: 0,
	tagOptions: [],
	sort: 'date-uploaded',
	sortOrder: 'desc',
};

const searchFormSlice = createSlice({
	name: 'searchForm',
	initialState: initialState,
	reducers: {
		addTag: (state, action: PayloadAction<Tag>): void => {
			!state.selectedTags.includes(action.payload) && state.selectedTags.push(action.payload);
		},
		addExcludedTag: (state, action: PayloadAction<Tag>): void => {
			!state.excludedTags.includes(action.payload) && state.excludedTags.push(action.payload);
		},
		removeTag: (state, action: PayloadAction<Tag>): void => {
			const index = state.selectedTags.findIndex((t) => t.id === action.payload.id);
			state.selectedTags.splice(index, 1);
		},
		removeExcludedTag: (state, action: PayloadAction<Tag>): void => {
			const index = state.excludedTags.findIndex((t) => t.id === action.payload.id);
			state.excludedTags.splice(index, 1);
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
		setSelectedTags: (state, action: PayloadAction<Tag[]>): void => {
			state.selectedTags = action.payload;
		},
		setSort: (state, action: PayloadAction<Sort>): void => {
			state.sort = action.payload;
		},
		setSortOrder: (state, action: PayloadAction<SortOrder>): void => {
			state.sortOrder = action.payload;
		},
		clearTagOptions: (state): void => {
			state.tagOptions = [];
		},
		clear: (): SearchFormState => {
			return initialState;
		},
	},
	extraReducers: (builder) => {
		builder.addCase(thunks.onlineSearchForm.getTagsByPatternFromApi.fulfilled, (state, action) => {
			state.tagOptions = action.payload;
		});
		builder.addCase(thunks.onlineSearchForm.fetchMorePosts.fulfilled, (state) => {
			state.page = state.page + 1;
		});
		builder.addCase(thunks.savedSearches.searchOnline.pending, (state, action) => {
			state.page = 0;
			state.selectedTags = action.meta.arg.tags;
			state.excludedTags = action.meta.arg.excludedTags;
		});
		builder.addCase(thunks.tags.searchTagOnline.pending, (state, action) => {
			state.page = 0;
			state.selectedTags = [action.meta.arg];
			state.excludedTags = [];
		});
	},
});

export const actions = searchFormSlice.actions;

export default searchFormSlice.reducer;
