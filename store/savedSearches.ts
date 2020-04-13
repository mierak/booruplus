import { SavedSearch, Rating, Tag } from '../types/gelbooruTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { actions as globalActions } from '.';
import { AppThunk } from './types';

import { db } from 'db';
import { notification } from 'antd';

export interface SavedSearchesState {
	savedSearches: SavedSearch[];
	activeSavedSearch: SavedSearch | undefined;
}

const initialState: SavedSearchesState = {
	savedSearches: [],
	activeSavedSearch: undefined,
};

const savedSearchesSlice = createSlice({
	name: 'savedSearches',
	initialState: initialState,
	reducers: {
		pushSavedSearch: (state, action: PayloadAction<SavedSearch>): void => {
			state.savedSearches.push(action.payload);
		},
		removeSavedSearch: (state, action: PayloadAction<SavedSearch>): void => {
			const index = state.savedSearches.findIndex((s) => s.id === action.payload.id);
			state.savedSearches.splice(index, 1);
			db.savedSearches.remove(action.payload);
		},
		setSavedSearches: (state, action: PayloadAction<SavedSearch[]>): void => {
			state.savedSearches = action.payload;
		},
		updateLastSearched: (state, action: PayloadAction<SavedSearch>): void => {
			const index = state.savedSearches.findIndex((s) => s.id === action.payload.id);
			state.savedSearches[index] = action.payload;
		},
		updateSavedSearch: (state, action: PayloadAction<SavedSearch>): void => {
			const index = state.savedSearches.findIndex((savedSearch) => savedSearch.id === action.payload.id);
			state.savedSearches[index] = action.payload;
		},
		setActiveSaveSearch: (state, action: PayloadAction<SavedSearch>): void => {
			state.activeSavedSearch = action.payload;
		},
		removePreview: (state, action: PayloadAction<{ savedSearchId: number; previewId: number }>): void => {
			const index = state.savedSearches.findIndex((s) => s.id === action.payload.savedSearchId);
			if (index !== -1) {
				const search = state.savedSearches[index];
				search.previews = search.previews.filter((preview) => preview.id !== action.payload.previewId);
				state.savedSearches[index] = search;
			}
		},
	},
});

const { pushSavedSearch } = savedSearchesSlice.actions;

export default savedSearchesSlice.reducer;

const searchSavedTagSearchOnline = (savedSearch: SavedSearch): AppThunk => async (dispatch): Promise<void> => {
	try {
		const search = { ...savedSearch };
		search.lastSearched = new Date().toUTCString();
		dispatch(globalActions.savedSearches.updateLastSearched(search));
		dispatch(globalActions.onlineSearchForm.setSelectedTags(savedSearch.tags));
		dispatch(globalActions.onlineSearchForm.setExcludedTags(savedSearch.excludedTags));
		await dispatch(globalActions.onlineSearchForm.fetchPosts());
		db.savedSearches.save(search);
		return Promise.resolve();
	} catch (err) {
		console.error('Error while searching online for SavedSearch', err, savedSearch);
		return Promise.reject(err);
	}
};

const searchSavedTagSearchOffline = (savedSearch: SavedSearch): AppThunk => async (dispatch): Promise<void> => {
	try {
		const search = { ...savedSearch };
		search.lastSearched = new Date().toUTCString();
		dispatch(globalActions.downloadedSearchForm.setSelectedTags(search.tags));
		dispatch(globalActions.downloadedSearchForm.setExcludedTags(savedSearch.excludedTags));
		await dispatch(globalActions.downloadedSearchForm.fetchPosts());
		db.savedSearches.save(search);
		return Promise.resolve();
	} catch (err) {
		console.error('Error while searching offline for SavedSearch', err, savedSearch);
		return Promise.reject(err);
	}
};

const saveSearch = (tags: Tag[], excludedTags: Tag[], rating: Rating): AppThunk => async (dispatch): Promise<void> => {
	try {
		const id = await db.savedSearches.createAndSave(rating, tags, excludedTags);
		if (id && typeof id === 'number') {
			const savedSearch: SavedSearch = {
				id,
				tags,
				excludedTags,
				rating,
				lastSearched: undefined,
				previews: [],
			};
			dispatch(pushSavedSearch(savedSearch));
		} else if (id === 'already-exists') {
			notification.error({
				message: 'Saved Search already exists',
				description: 'Could not save search because it already exists in the database',
				duration: 2,
			});
		} else {
			throw new Error('Could not persist save search');
		}
	} catch (err) {
		console.error('Error while saving search', err);
	}
};

const loadSavedSearchesFromDb = (): AppThunk => async (dispatch): Promise<void> => {
	try {
		const savedSearches = await db.savedSearches.getAll();
		savedSearches && dispatch(globalActions.savedSearches.setSavedSearches(savedSearches));
	} catch (err) {
		console.error('Error while loading SavedSearches from database', err);
	}
};

const addPreviewToActiveSavedSearch = (previewUrl: string): AppThunk => async (dispatch, getState): Promise<void> => {
	try {
		const blob = await (await fetch(previewUrl)).blob();
		const savedSearch = getState().savedSearches.activeSavedSearch;
		if (savedSearch) {
			savedSearch.id && db.savedSearches.addPreview(savedSearch.id, blob);
		} else {
			throw new Error('Tried to add preview when no saved search is active!');
		}
	} catch (err) {
		console.error('Error while adding preview to savedSearch', err);
	}
};

const removePreview = (savedSearch: SavedSearch, previewId: number): AppThunk => async (dispatch): Promise<void> => {
	try {
		db.savedSearches.removePreview(savedSearch, previewId);
		dispatch(savedSearchesSlice.actions.removePreview({ savedSearchId: savedSearch.id, previewId }));
	} catch (err) {
		console.error('Error while removing preview from SavedSearch', err);
	}
};

export const actions = {
	...savedSearchesSlice.actions,
	searchSavedTagSearchOnline,
	searchSavedTagSearchOffline,
	saveSearch,
	loadSavedSearchesFromDb,
	addPreviewToActiveSavedSearch,
	removePreview,
};
