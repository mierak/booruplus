import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { Tag, Rating } from '@appTypes/gelbooruTypes';
import type { DownloadedSearchFormState, SearchMode, Sort, SortOrder, WithContext } from './types';

import { onlineSearchForm, downloadedSearchForm, savedSearches } from './thunks';
import { deletePostsContext, initPostsContext } from './commonActions';

export type OnlineSearchFormState = { [key: string]: DownloadedSearchFormState };

const defaultValues: DownloadedSearchFormState = {
	mode: 'online',
	selectedTags: [],
	excludedTags: [],
	limit: 100,
	rating: 'any',
	page: 0,
	tagOptions: [],
	sort: 'date-uploaded', //! TODO default to date-downloaded for offline search
	sortOrder: 'desc',
	showBlacklisted: false,
	showFavorites: true,
	showGifs: true,
	showImages: true,
	showNonBlacklisted: true,
	showVideos: true,
};

export const initialState: OnlineSearchFormState = {
	default: defaultValues,
};

const searchFormSlice = createSlice({
	name: 'searchForm',
	initialState: initialState,
	reducers: {
		addTag: (state, action: PayloadAction<WithContext<Tag>>): void => {
			const ctx = action.payload.context;
			!state[ctx].selectedTags.includes(action.payload.data) && state[ctx].selectedTags.push(action.payload.data);
		},
		addExcludedTag: (state, action: PayloadAction<WithContext<Tag>>): void => {
			const ctx = action.payload.context;
			!state[ctx].excludedTags.includes(action.payload.data) && state[ctx].excludedTags.push(action.payload.data);
		},
		removeTag: (state, action: PayloadAction<WithContext<Tag>>): void => {
			const ctx = action.payload.context;
			const index = state[ctx].selectedTags.findIndex((t) => t.id === action.payload.data.id);
			state[ctx].selectedTags.splice(index, 1);
		},
		removeExcludedTag: (state, action: PayloadAction<WithContext<Tag>>): void => {
			const ctx = action.payload.context;
			const index = state[ctx].excludedTags.findIndex((t) => t.id === action.payload.data.id);
			state[ctx].excludedTags.splice(index, 1);
		},
		setLimit: (state, action: PayloadAction<WithContext<number>>): void => {
			state[action.payload.context].limit = action.payload.data;
		},
		setRating: (state, action: PayloadAction<WithContext<Rating>>): void => {
			state[action.payload.context].rating = action.payload.data;
		},
		setPage: (state, action: PayloadAction<WithContext<number>>): void => {
			state[action.payload.context].page = action.payload.data;
		},
		setSelectedTags: (state, action: PayloadAction<WithContext<Tag[]>>): void => {
			state[action.payload.context].selectedTags = action.payload.data;
		},
		setSort: (state, action: PayloadAction<WithContext<Sort>>): void => {
			state[action.payload.context].sort = action.payload.data;
		},
		setSortOrder: (state, action: PayloadAction<WithContext<SortOrder>>): void => {
			state[action.payload.context].sortOrder = action.payload.data;
		},
		clearTagOptions: (state, action: PayloadAction<WithContext>): void => {
			state[action.payload.context].tagOptions = [];
		},
		clear: (state, action: PayloadAction<WithContext>): { [key: string]: DownloadedSearchFormState } => {
			return { ...state, [action.payload.context]: defaultValues };
		},
		updateContext: (state, action: PayloadAction<WithContext<Partial<DownloadedSearchFormState>>>): void => {
			state[action.payload.context] = { ...state[action.payload.context], ...action.payload.data };
		},
		setContextMode: (state, action: PayloadAction<WithContext<SearchMode>>): void => {
			state[action.payload.context].mode = action.payload.data;
		},
		toggleShowNonBlacklisted: (state, action: PayloadAction<WithContext>): void => {
			const currentState = state[action.payload.context];
			if ('showNonBlacklisted' in currentState) {
				currentState.showNonBlacklisted = !currentState.showNonBlacklisted;
			}
		},
		toggleShowBlacklisted: (state, action: PayloadAction<WithContext>): void => {
			const currentState = state[action.payload.context];
			if ('showBlacklisted' in currentState) {
				currentState.showBlacklisted = !currentState.showBlacklisted;
			}
		},
		toggleShowFavorites: (state, action: PayloadAction<WithContext>): void => {
			const currentState = state[action.payload.context];
			if ('showFavorites' in currentState) {
				currentState.showFavorites = !currentState.showFavorites;
			}
		},
		toggleShowVideos: (state, action: PayloadAction<WithContext>): void => {
			const currentState = state[action.payload.context];
			if ('showVideos' in currentState) {
				currentState.showVideos = !currentState.showVideos;
			}
		},
		toggleShowImages: (state, action: PayloadAction<WithContext>): void => {
			const currentState = state[action.payload.context];
			if ('showImages' in currentState) {
				currentState.showImages = !currentState.showImages;
			}
		},
		toggleShowGifs: (state, action: PayloadAction<WithContext>): void => {
			const currentState = state[action.payload.context];
			if ('showGifs' in currentState) {
				currentState.showGifs = !currentState.showGifs;
			}
		},
	},
	extraReducers: (builder) => {
		builder.addCase(initPostsContext, (state, action) => {
			state[action.payload.context] = { ...defaultValues, ...action.payload.data };
		});
		builder.addCase(deletePostsContext, (state, action) => {
			delete state[action.payload.context];
		});
		builder.addCase(onlineSearchForm.getTagsByPatternFromApi.fulfilled, (state, action) => {
			state[action.meta.arg.context].tagOptions = action.payload;
		});
		builder.addCase(onlineSearchForm.fetchMorePosts.fulfilled, (state, action) => {
			state[action.meta.arg.context].page = state[action.meta.arg.context].page + 1;
		});
		builder.addCase(downloadedSearchForm.loadTagsByPattern.fulfilled, (state, action) => {
			state[action.meta.arg.context].tagOptions = action.payload;
		});
		builder.addCase(downloadedSearchForm.fetchMorePosts.pending, (state, action) => {
			state[action.meta.arg.context].page = state[action.meta.arg.context].page + 1;
		});
		builder.addCase(savedSearches.saveSearch.fulfilled, (state, action) => {
			state[action.meta.arg.context].savedSearchId = action.payload.id;
		});
	},
});

export const actions = searchFormSlice.actions;

export default searchFormSlice.reducer;
