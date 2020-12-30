import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { Tag } from '@appTypes/gelbooruTypes';
import type { DownloadedSearchFormState, PostsContext, WithContext } from './types';

import * as thunks from './thunks';
import { deletePostsContext, initPostsContext } from './commonActions';

export type OnlineSearchFormState = {
	[K in PostsContext]: DownloadedSearchFormState;
} & {
	[key: string]: DownloadedSearchFormState;
};

const defaultValues: DownloadedSearchFormState = {
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

export const initialState: OnlineSearchFormState = {
	default: defaultValues,
	checkLaterQueue: { ...defaultValues, mode: 'other' },
	favorites: { ...defaultValues, mode: 'other' },
	mostViewed: { ...defaultValues, mode: 'other' },
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
		clearTagOptions: (state, action: PayloadAction<WithContext>): void => {
			state[action.payload.context].tagOptions = [];
		},
		clear: (state, action: PayloadAction<WithContext>): OnlineSearchFormState => {
			return { ...state, [action.payload.context]: defaultValues };
		},
		updateContext: (state, action: PayloadAction<WithContext<Partial<DownloadedSearchFormState>>>): void => {
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
		builder.addCase(thunks.onlineSearchForm.getTagsByPatternFromApi.fulfilled, (state, action) => {
			state[action.meta.arg.context].tagOptions = action.payload;
		});
		builder.addCase(thunks.onlineSearchForm.fetchMorePosts.fulfilled, (state, action) => {
			state[action.meta.arg.context].page = state[action.meta.arg.context].page + 1;
		});
		builder.addCase(thunks.downloadedSearchForm.loadTagsByPattern.fulfilled, (state, action) => {
			state[action.meta.arg.context].tagOptions = action.payload;
		});
		builder.addCase(thunks.downloadedSearchForm.fetchMorePosts.fulfilled, (state, action) => {
			state[action.meta.arg.context].page = state[action.meta.arg.context].page + 1;
		});
		builder.addCase(thunks.savedSearches.saveSearch.fulfilled, (state, action) => {
			state[action.meta.arg.context].savedSearchId = action.payload.id;
		});
	},
});

export const actions = searchFormSlice.actions;

export default searchFormSlice.reducer;
