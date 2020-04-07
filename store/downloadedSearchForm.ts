import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import * as db from '../db';

import { AppThunk } from './types';
import { actions as globalActions } from '.';

import { Tag, Rating } from '../types/gelbooruTypes';
import { FilterOptions } from 'db/types';

export interface DownloadedSearchFormState {
	selectedTags: Tag[];
	tagOptions: Tag[];
	rating: Rating;
	postLimit: number;
	page: number;
	showNonBlacklisted: boolean;
	showBlacklisted: boolean;
	showFavorites: boolean;
	showVideos: boolean;
	showImages: boolean;
	showGifs: boolean;
}

const initialState: DownloadedSearchFormState = {
	selectedTags: [],
	tagOptions: [],
	rating: 'any',
	postLimit: 100,
	page: 0,
	showNonBlacklisted: true,
	showBlacklisted: false,
	showFavorites: true,
	showVideos: true,
	showImages: true,
	showGifs: true
};

const downloadedSearchFormSlice = createSlice({
	name: 'downloadedSearchForm',
	initialState: initialState,
	reducers: {
		addTag: (state, action: PayloadAction<Tag>): void => {
			state.selectedTags.push(action.payload);
		},
		removeTag: (state, action: PayloadAction<Tag>): void => {
			const index = state.selectedTags.findIndex((t) => t.id === action.payload.id);
			state.selectedTags.splice(index, 1);
		},
		setSelectedTags: (state, action: PayloadAction<Tag[]>): void => {
			state.selectedTags = action.payload;
		},
		setTagOptions: (state, action: PayloadAction<Tag[]>): void => {
			state.tagOptions = action.payload;
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
		clearForm: (): DownloadedSearchFormState => {
			return initialState;
		}
	}
});

const getFilterOptions = (state: DownloadedSearchFormState): FilterOptions => {
	return {
		blacklisted: state.showBlacklisted,
		nonBlacklisted: state.showNonBlacklisted,
		limit: state.postLimit,
		offset: state.postLimit * state.page,
		rating: state.rating,
		showGifs: state.showGifs,
		showImages: state.showImages,
		showVideos: state.showVideos,
		showFavorites: state.showFavorites
	};
};

const loadByPatternFromDb = (pattern: string): AppThunk => async (dispatch): Promise<void> => {
	try {
		const tags = await db.tags.getByPattern(pattern);
		dispatch(globalActions.downloadedSearchForm.setTagOptions(tags));
	} catch (err) {
		console.error('Error while loading tags by pattern from db', err);
	}
};

const fetchPosts = (): AppThunk => async (dispatch, getState): Promise<void> => {
	try {
		dispatch(globalActions.system.setFetchingPosts(true));
		dispatch(globalActions.posts.setPosts([]));
		const state = getState().downloadedSearchForm;
		const tags = state.selectedTags.map((tag) => tag.tag);

		const options = getFilterOptions(state);
		const posts = tags.length !== 0 ? await db.posts.getForTagsWithOptions(options, ...tags) : await db.posts.getAllWithOptions(options);
		dispatch(globalActions.system.setFetchingPosts(false));

		posts.forEach(async (post) => {
			dispatch(globalActions.posts.addPosts([post]));
		});

		dispatch(globalActions.posts.setPosts(posts));
		db.tagSearchHistory.saveSearch(state.selectedTags);
	} catch (err) {
		console.error('Error while fetching posts from db', err);
	}
};

export const fetchMorePosts = (): AppThunk => async (dispatch, getState): Promise<void> => {
	try {
		dispatch(downloadedSearchFormSlice.actions.incrementPage());
		const state = getState().downloadedSearchForm;
		const tags = state.selectedTags.map((tag) => tag.tag);

		const options = getFilterOptions(state);
		const posts = tags.length !== 0 ? await db.posts.getForTagsWithOptions(options, ...tags) : await db.posts.getAllWithOptions(options);
		dispatch(globalActions.posts.addPosts(posts));
	} catch (err) {
		console.error('Error while fetching more posts from db', err);
	}
};

export const actions = { ...downloadedSearchFormSlice.actions, loadByPatternFromDb, fetchPosts, fetchMorePosts };

export default downloadedSearchFormSlice.reducer;
