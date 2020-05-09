import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Tag, Rating } from '../types/gelbooruTypes';
import * as thunks from './thunks';
import { Sort, SortOrder } from './types';

export interface DownloadedSearchFormState {
	selectedTags: Tag[];
	excludededTags: Tag[];
	tagOptions: Tag[];
	rating: Rating;
	postLimit: number;
	page: number;
	sort: Sort;
	sortOrder: SortOrder;
	showNonBlacklisted: boolean;
	showBlacklisted: boolean;
	showFavorites: boolean;
	showVideos: boolean;
	showImages: boolean;
	showGifs: boolean;
}

const initialState: DownloadedSearchFormState = {
	selectedTags: [],
	excludededTags: [],
	tagOptions: [],
	rating: 'any',
	postLimit: 100,
	page: 0,
	sort: 'date-downloaded',
	sortOrder: 'desc',
	showNonBlacklisted: true,
	showBlacklisted: false,
	showFavorites: true,
	showVideos: true,
	showImages: true,
	showGifs: true,
};

const downloadedSearchFormSlice = createSlice({
	name: 'downloadedSearchForm',
	initialState: initialState,
	reducers: {
		addTag: (state, action: PayloadAction<Tag>): void => {
			state.selectedTags.push(action.payload);
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
		setSelectedTags: (state, action: PayloadAction<Tag[]>): void => {
			state.selectedTags = action.payload;
		},
		setExcludedTags: (state, action: PayloadAction<Tag[]>): void => {
			state.excludededTags = action.payload;
		},
		setTagOptions: (state, action: PayloadAction<Tag[]>): void => {
			state.tagOptions = action.payload;
		},
		clearTagOptions: (state): void => {
			state.tagOptions = [];
		},
		setRating: (state, action: PayloadAction<Rating>): void => {
			state.rating = action.payload;
		},
		setPostLimit: (state, action: PayloadAction<number>): void => {
			state.postLimit = action.payload;
		},
		setPage: (state, action: PayloadAction<number>): void => {
			state.page = action.payload;
		},
		incrementPage: (state): void => {
			state.page = state.page + 1;
		},
		setSort: (state, action: PayloadAction<Sort>): void => {
			state.sort = action.payload;
		},
		setSortOrder: (state, action: PayloadAction<SortOrder>): void => {
			state.sortOrder = action.payload;
		},
		setShowNonBlacklisted: (state, action: PayloadAction<boolean>): void => {
			state.showNonBlacklisted = action.payload;
		},
		toggleShowNonBlacklisted: (state): void => {
			state.showNonBlacklisted = !state.showNonBlacklisted;
		},
		setShowBlacklisted: (state, action: PayloadAction<boolean>): void => {
			state.showBlacklisted = action.payload;
		},
		toggleShowBlacklisted: (state): void => {
			state.showBlacklisted = !state.showBlacklisted;
		},
		setShowFavorites: (state, action: PayloadAction<boolean>): void => {
			state.showFavorites = action.payload;
		},
		toggleShowFavorites: (state): void => {
			state.showFavorites = !state.showFavorites;
		},
		setShowVideos: (state, action: PayloadAction<boolean>): void => {
			state.showVideos = action.payload;
		},
		toggleShowVideos: (state): void => {
			state.showVideos = !state.showVideos;
		},
		setShowImages: (state, action: PayloadAction<boolean>): void => {
			state.showImages = action.payload;
		},
		toggleShowImages: (state): void => {
			state.showImages = !state.showImages;
		},
		setShowGifs: (state, action: PayloadAction<boolean>): void => {
			state.showGifs = action.payload;
		},
		toggleShowGifs: (state): void => {
			state.showGifs = !state.showGifs;
		},
		clear: (): DownloadedSearchFormState => {
			return initialState;
		},
	},
	extraReducers: (builder) => {
		builder.addCase(thunks.savedSearches.searchOffline.pending, (state, action) => {
			state.selectedTags = action.meta.arg.tags;
			state.excludededTags = action.meta.arg.excludedTags;
			state.page = 0;
		});
		builder.addCase(thunks.downloadedSearchForm.loadTagsByPattern.fulfilled, (state, action) => {
			state.tagOptions = action.payload;
		});
		builder.addCase(thunks.tags.searchTagOffline.pending, (state, action) => {
			state.page = 0;
			state.selectedTags = [action.meta.arg];
			state.excludededTags = [];
		});
		builder.addCase(thunks.downloadedSearchForm.fetchMorePosts.pending, (state) => {
			state.page = state.page + 1;
		});
	},
});

export const actions = { ...downloadedSearchFormSlice.actions };

export default downloadedSearchFormSlice.reducer;
