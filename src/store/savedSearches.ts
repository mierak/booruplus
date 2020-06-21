import { SavedSearch } from '../types/gelbooruTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { db } from '../db';
import * as thunks from './thunks';

export interface SavedSearchesState {
	savedSearches: SavedSearch[];
	activeSavedSearch: SavedSearch | undefined;
}

export const initialState: SavedSearchesState = {
	savedSearches: [],
	activeSavedSearch: undefined,
};

const savedSearchesSlice = createSlice({
	name: 'savedSearches',
	initialState: initialState,
	reducers: {
		removeSavedSearch: (state, action: PayloadAction<SavedSearch>): void => {
			const index = state.savedSearches.findIndex((s) => s.id === action.payload.id);
			state.savedSearches.splice(index, 1);
			db.savedSearches.remove(action.payload); // TODO the fuck is this doing here
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
