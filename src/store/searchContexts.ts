import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { Tag } from '@appTypes/gelbooruTypes';
import type { SearchContext as SearchContext, PostsContext, WithContext } from './types';

import * as thunks from './thunks';
import { deletePostsContext, initPostsContext } from './commonActions';

export type SearchContextsState = {
	[K in PostsContext]: SearchContext;
} & {
	[key: string]: SearchContext;
};

const defaultValues: SearchContext = {
	tabName: '',
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

export const initialState: SearchContextsState = {
	default: defaultValues,
	checkLaterQueue: { ...defaultValues, mode: 'other' },
	favorites: { ...defaultValues, mode: 'other' },
	mostViewed: { ...defaultValues, mode: 'other' },
};

const searchContextsSlice = createSlice({
	name: 'searchContexts',
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
		clearTagOptions: (state, action: PayloadAction<WithContext>): void => {
			state[action.payload.context].tagOptions = [];
		},
		clear: (state, action: PayloadAction<WithContext>): SearchContextsState => {
			return { ...state, [action.payload.context]: defaultValues };
		},
		updateContext: (state, action: PayloadAction<WithContext<Partial<SearchContext>>>): void => {
			state[action.payload.context] = { ...state[action.payload.context], ...action.payload.data };
		},
	},
	extraReducers: (builder) => {
		builder.addCase(initPostsContext, (state, action) => {
			state[action.payload.context] = { ...defaultValues, ...action.payload.data };
		});
		builder.addCase(deletePostsContext, (state, action) => {
			delete state[action.payload.context];
		});
		builder.addCase(thunks.onlineSearches.getTagsByPatternFromApi.fulfilled, (state, action) => {
			state[action.meta.arg.context].tagOptions = action.payload;
		});
		builder.addCase(thunks.onlineSearches.fetchMorePosts.fulfilled, (state, action) => {
			state[action.meta.arg.context].page = state[action.meta.arg.context].page + 1;
		});
		builder.addCase(thunks.offlineSearches.loadTagsByPattern.fulfilled, (state, action) => {
			state[action.meta.arg.context].tagOptions = action.payload;
		});
		builder.addCase(thunks.offlineSearches.fetchMorePosts.fulfilled, (state, action) => {
			state[action.meta.arg.context].page = state[action.meta.arg.context].page + 1;
		});
		builder.addCase(thunks.savedSearches.saveSearch.fulfilled, (state, action) => {
			state[action.meta.arg.context].savedSearchId = action.payload.id;
		});
	},
});

export const actions = searchContextsSlice.actions;

export default searchContextsSlice.reducer;
