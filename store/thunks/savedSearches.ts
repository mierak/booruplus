import { createAsyncThunk } from '@reduxjs/toolkit';

import { db } from 'db';

import { ThunkApi } from 'store/types';

import { Rating, SavedSearch, Tag } from 'types/gelbooruTypes';

import { notification } from 'antd';
import * as onlineSearchFormThunk from './onlineSearchForm';
import * as downloadedSearchFormThunk from './downloadedSearchForm';

export const searchOnline = createAsyncThunk<SavedSearch, SavedSearch, ThunkApi>(
	'savedSearches/searchOnline',
	async (savedSearch, thunkApi): Promise<SavedSearch> => {
		const clone = { ...savedSearch };
		clone.lastSearched = new Date().toUTCString();
		db.savedSearches.save(clone);
		thunkApi.dispatch(onlineSearchFormThunk.fetchPosts());
		return clone;
	}
);

export const searchOffline = createAsyncThunk<SavedSearch, SavedSearch, ThunkApi>(
	'savedSearches/searchOffline',
	async (savedSearch, thunkApi): Promise<SavedSearch> => {
		const clone = { ...savedSearch };
		clone.lastSearched = new Date().toUTCString();
		db.savedSearches.save(clone);
		thunkApi.dispatch(downloadedSearchFormThunk.fetchPosts());
		return clone;
	}
);

export const saveSearch = createAsyncThunk<SavedSearch, { tags: Tag[]; excludedTags: Tag[]; rating: Rating }, ThunkApi>(
	'savedSearches/save',
	async (params): Promise<SavedSearch> => {
		const id = await db.savedSearches.createAndSave(params.rating, params.tags, params.excludedTags);

		if (id === 'already-exists') {
			notification.error({
				message: 'Saved Search already exists',
				description: 'Could not save search because it already exists in the database',
				duration: 2,
			});
			throw new Error('Saved search already exists');
		}

		return {
			id,
			tags: params.tags,
			excludedTags: params.excludedTags,
			rating: params.rating,
			lastSearched: undefined,
			previews: [],
		};
	}
);

export const loadSavedSearchesFromDb = createAsyncThunk<SavedSearch[], void, ThunkApi>(
	'savedSearches/loadFromDb',
	async (): Promise<SavedSearch[]> => {
		return db.savedSearches.getAll();
	}
);

export const addPreviewToActiveSavedSearch = createAsyncThunk<SavedSearch | undefined, string, ThunkApi>(
	'savedSearches/addPreviewToActive',
	async (previewUrl, thunkApi): Promise<SavedSearch | undefined> => {
		const blob = await (await fetch(previewUrl)).blob();
		const savedSearch = thunkApi.getState().savedSearches.activeSavedSearch;
		if (savedSearch) {
			savedSearch.id && db.savedSearches.addPreview(savedSearch.id, blob);
		}
		return savedSearch;
	}
);

export const removePreview = createAsyncThunk<
	{ savedSearchId: number; previewId: number },
	{ savedSearch: SavedSearch; previewId: number },
	ThunkApi
>(
	'savedSearches/removePreview',
	async (params): Promise<{ savedSearchId: number; previewId: number }> => {
		db.savedSearches.removePreview(params.savedSearch, params.previewId);
		return { savedSearchId: params.savedSearch.id, previewId: params.previewId };
	}
);
