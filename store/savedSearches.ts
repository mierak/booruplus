import { SavedSearch } from '../types/gelbooruTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk } from './main';
import * as db from '../db';
import { setActiveView } from './system';
import { setSelectedTags, fetchPostsFromApi, setSearchMode, fetchPosts, setLoading } from './searchForm';

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
			db.deleteSavedSearch(action.payload);
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

export const { removeSavedSearch, setSavedSearches, updateLastSearched } = savedSearchesSlice.actions;

export default savedSearchesSlice.reducer;

export const searchSavedTagSearchOnline = (savedSearch: SavedSearch): AppThunk => async (dispatch): Promise<void> => {
	try {
		const search = Object.assign({}, savedSearch);
		search.lastSearched = new Date().toUTCString();
		dispatch(updateLastSearched(search));
		dispatch(setSearchMode('online'));
		dispatch(setSelectedTags(savedSearch.tags));
		dispatch(fetchPosts());
		db.saveSearch(search);
		dispatch(setActiveView('thumbnails'));
	} catch (err) {
		console.error('Error while searching online for SavedSearch', err, savedSearch);
	}
};

export const addSavedSearch = (savedSearch: SavedSearch): AppThunk => async (dispatch): Promise<void> => {
	try {
		db.saveSearch(savedSearch);
		dispatch(pushSavedSearch(savedSearch));
	} catch (err) {
		console.error('Error while adding saved search', err);
	}
};

export const saveCurrentSearch = (): AppThunk => async (dispatch, getState): Promise<void> => {
	try {
		const tags = getState().searchForm.selectedTags;
		const rating = getState().searchForm.rating;

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

export const loadSavedSearchesFromDb = (): AppThunk => async (dispatch): Promise<void> => {
	try {
		const savedSearches = await db.getSavedSearches();
		savedSearches && dispatch(setSavedSearches(savedSearches));
	} catch (err) {
		console.log('Error while loading SavedSearches from database', err);
	}
};
