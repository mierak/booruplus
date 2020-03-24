import { SavedSearch } from '../types/gelbooruTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { actions as globalActions } from '.';
import { AppThunk } from './types';

import * as db from '../db';

export interface SavedSearchesState {
	savedSearches: SavedSearch[];
}

const initialState: SavedSearchesState = {
	savedSearches: []
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
			db.savedSearches.deleteSavedSearch(action.payload);
		},
		setSavedSearches: (state, action: PayloadAction<SavedSearch[]>): void => {
			state.savedSearches = action.payload;
		},
		updateLastSearched: (state, action: PayloadAction<SavedSearch>): void => {
			const index = state.savedSearches.findIndex((s) => s.id === action.payload.id);
			state.savedSearches[index] = action.payload;
		}
	}
});

const { pushSavedSearch } = savedSearchesSlice.actions;

export default savedSearchesSlice.reducer;

const searchSavedTagSearchOnline = (savedSearch: SavedSearch): AppThunk => async (dispatch): Promise<void> => {
	try {
		const search = Object.assign({}, savedSearch);
		search.lastSearched = new Date().toUTCString();
		dispatch(globalActions.savedSearches.updateLastSearched(search));
		dispatch(globalActions.onlineSearchForm.setSearchMode('online'));
		dispatch(globalActions.onlineSearchForm.setSelectedTags(savedSearch.tags));
		dispatch(globalActions.onlineSearchForm.fetchPosts());
		db.savedSearches.saveSearch(search);
		dispatch(globalActions.system.setActiveView('thumbnails'));
	} catch (err) {
		console.error('Error while searching online for SavedSearch', err, savedSearch);
	}
};

const addSavedSearch = (savedSearch: SavedSearch): AppThunk => async (dispatch): Promise<void> => {
	try {
		db.savedSearches.saveSearch(savedSearch);
		dispatch(pushSavedSearch(savedSearch));
	} catch (err) {
		console.error('Error while adding saved search', err);
	}
};

const saveCurrentSearch = (): AppThunk => async (dispatch, getState): Promise<void> => {
	try {
		const tags = getState().onlineSearchForm.selectedTags;
		const rating = getState().onlineSearchForm.rating;

		const savedSearch: SavedSearch = {
			tags,
			rating,
			lastSearched: new Date().toUTCString()
		};

		dispatch(addSavedSearch(savedSearch));
	} catch (err) {
		console.error('Error while adding saved search', err);
	}
};

const loadSavedSearchesFromDb = (): AppThunk => async (dispatch): Promise<void> => {
	try {
		const savedSearches = await db.savedSearches.getSavedSearches();
		savedSearches && dispatch(globalActions.savedSearches.setSavedSearches(savedSearches));
	} catch (err) {
		console.log('Error while loading SavedSearches from database', err);
	}
};

export const actions = {
	...savedSearchesSlice.actions,
	searchSavedTagSearchOnline,
	addSavedSearch,
	saveCurrentSearch,
	loadSavedSearchesFromDb
};
