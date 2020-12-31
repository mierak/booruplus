import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { SavedSearch } from '@appTypes/gelbooruTypes';

import {savedSearches} from './thunks';

export type SavedSearchesState = {
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
		setActiveSavedSearch: (state, action: PayloadAction<SavedSearch | number>): void => {
			const payload = action.payload;
			if (typeof payload === 'number') {
				const savedSearch = state.savedSearches.find((ss) => (ss.id = payload));
				state.activeSavedSearch = savedSearch;
			} else {
				state.activeSavedSearch = payload;
			}
		},
	},
	extraReducers: (builder) => {
		builder.addCase(savedSearches.searchOnline.fulfilled, (state, action) => {
			const index = state.savedSearches.findIndex((savedSearch) => savedSearch.id === action.payload.id);
			state.savedSearches[index] = action.payload;
			state.activeSavedSearch = action.payload;
		});
		builder.addCase(savedSearches.searchOffline.fulfilled, (state, action) => {
			const index = state.savedSearches.findIndex((savedSearch) => savedSearch.id === action.payload.id);
			state.savedSearches[index] = action.payload;
			state.activeSavedSearch = action.payload;
		});
		// Save Search
		builder.addCase(savedSearches.saveSearch.fulfilled, (state, action) => {
			state.savedSearches.push(action.payload);
			state.activeSavedSearch = action.payload;
		});
		builder.addCase(savedSearches.saveSearch.rejected, (state, action) => {
			if (action.payload) {
				action.payload.showNotification();
				state.activeSavedSearch = action.payload.savedSearch;
			}
		});
		builder.addCase(savedSearches.remove.fulfilled, (state, action) => {
			const index = state.savedSearches.findIndex((s) => s.id === action.payload);
			state.savedSearches.splice(index, 1);
		});
		builder.addCase(savedSearches.loadSavedSearchesFromDb.fulfilled, (state, action) => {
			state.savedSearches = action.payload;
		});
		builder.addCase(savedSearches.removePreview.fulfilled, (state, action) => {
			const index = state.savedSearches.findIndex((s) => s.id === action.payload.savedSearchId);
			if (index !== -1) {
				const search = state.savedSearches[index];
				search.previews = search.previews.filter((preview) => preview.id !== action.payload.previewId);
				state.savedSearches[index] = search;
			}
		});
		builder.addCase(savedSearches.addPreviewsToSavedSearch.rejected, (_, action) => {
			action.payload?.showNotification();
		});
	},
});

export default savedSearchesSlice.reducer;

export const actions = savedSearchesSlice.actions;
