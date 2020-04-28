import { SavedSearch } from '../types/gelbooruTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { db } from 'db';
import { thunks } from './internal';

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
			db.savedSearches.remove(action.payload); // TODO the fuck is this doing here
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
	},
	extraReducers: (builder) => {
		builder.addCase(thunks.savedSearches.searchOnline.fulfilled, (state, action) => {
			const index = state.savedSearches.findIndex((savedSearch) => savedSearch.id === action.payload.id);
			state.savedSearches[index] = action.payload;
			state.activeSavedSearch = action.payload;
		});
		builder.addCase(thunks.savedSearches.saveSearch.fulfilled, (state, action) => {
			state.savedSearches.push(action.payload);
		});
		builder.addCase(thunks.savedSearches.loadSavedSearchesFromDb.fulfilled, (state, action) => {
			state.savedSearches = action.payload;
		});
		builder.addCase(thunks.savedSearches.removePreview.fulfilled, (state, action) => {
			const index = state.savedSearches.findIndex((s) => s.id === action.payload.savedSearchId);
			if (index !== -1) {
				const search = state.savedSearches[index];
				search.previews = search.previews.filter((preview) => preview.id !== action.payload.previewId);
				state.savedSearches[index] = search;
			}
		});
	},
});

export default savedSearchesSlice.reducer;

export const actions = savedSearchesSlice.actions;
