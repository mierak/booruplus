import { SavedSearch } from '../types/gelbooruTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk } from './main';
import { getPostsForTags } from '../service/apiService';
import { setPosts, setActivePostIndex } from './posts';
import { saveSearch, deleteSavedSearch, getSavedSearches } from '../db/database';
import { setActiveView } from './system';
import { setLoading } from './searchForm';

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
		addSavedSearch: (state, action: PayloadAction<SavedSearch>): void => {
			state.savedSearches.push(action.payload);
		},
		removeSavedSearch: (state, action: PayloadAction<SavedSearch>): void => {
			const index = state.savedSearches.findIndex((s) => s.id === action.payload.id);
			state.savedSearches.splice(index, 1);
			deleteSavedSearch(action.payload);
		},
		setSavedSearches: (state, action: PayloadAction<SavedSearch[]>): void => {
			state.savedSearches = action.payload;
		},
		updateLastSearched: (state, action: PayloadAction<SavedSearch>): void => {
			const index = state.savedSearches.findIndex((s) => s.id === action.payload.id);
			state.savedSearches[index].lastSearched = new Date().toUTCString();
		}
	}
});

export const { addSavedSearch, removeSavedSearch, setSavedSearches, updateLastSearched } = savedSearchesSlice.actions;

export default savedSearchesSlice.reducer;

export const searchSavedTagSearchOnline = (savedSearch: SavedSearch): AppThunk => async (dispatch): Promise<void> => {
	try {
		dispatch(setLoading(true));
		dispatch(updateLastSearched(savedSearch));
		const tags = savedSearch.tags.map((tag) => tag.tag);
		const posts = await getPostsForTags(tags);
		saveSearch(savedSearch);
		dispatch(setActiveView('thumbnails'));
		dispatch(setActivePostIndex(undefined));
		dispatch(setPosts(posts));
		dispatch(setLoading(false));
	} catch (err) {
		console.error('Error while searching online for SavedSearch', err, savedSearch);
	}
};

export const loadSavedSearchesFromDb = (): AppThunk => async (dispatch): Promise<void> => {
	try {
		const savedSearches = await getSavedSearches();
		savedSearches && dispatch(setSavedSearches(savedSearches));
	} catch (err) {
		console.log('Error while loading SavedSearches from database', err);
	}
};
