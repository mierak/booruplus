import { createAsyncThunk } from '@reduxjs/toolkit';

import { db } from '../../db';

import { ThunkApi } from '../../store/types';

import { Rating, SavedSearch, Tag } from '../../types/gelbooruTypes';

import { notification } from 'antd';
import * as onlineSearchFormThunk from './onlineSearchForm';
import * as downloadedSearchFormThunk from './downloadedSearchForm';

import { thunkLoggerFactory } from '../../util/logger';

const thunkLogger = thunkLoggerFactory();

export const searchOnline = createAsyncThunk<SavedSearch, SavedSearch, ThunkApi>(
	'savedSearches/searchOnline',
	async (savedSearch, thunkApi): Promise<SavedSearch> => {
		const logger = thunkLogger.getActionLogger(searchOnline);
		const clone = { ...savedSearch };
		clone.lastSearched = new Date().toUTCString();
		logger.debug('Updating last searched to', clone.lastSearched);
		db.savedSearches.save(clone);
		await thunkApi.dispatch(onlineSearchFormThunk.fetchPosts());
		return clone;
	}
);

export const searchOffline = createAsyncThunk<SavedSearch, SavedSearch, ThunkApi>(
	'savedSearches/searchOffline',
	async (savedSearch, thunkApi): Promise<SavedSearch> => {
		const logger = thunkLogger.getActionLogger(searchOffline);
		const clone = { ...savedSearch };
		clone.lastSearched = new Date().toUTCString();
		logger.debug('Updating last searched to', clone.lastSearched);
		db.savedSearches.save(clone);
		await thunkApi.dispatch(downloadedSearchFormThunk.fetchPosts());
		return clone;
	}
);

export const saveSearch = createAsyncThunk<SavedSearch, { tags: Tag[]; excludedTags: Tag[]; rating: Rating }, ThunkApi>(
	'savedSearches/save',
	async (params): Promise<SavedSearch> => {
		const logger = thunkLogger.getActionLogger(saveSearch);
		const id = await db.savedSearches.createAndSave(params.rating, params.tags, params.excludedTags);

		if (id === 'already-exists') {
			notification.error({
				message: 'Saved Search already exists',
				description: 'Could not save search because it already exists in the database',
				duration: 2,
			});
			logger.warn(
				`Cannot save search with Rating: [${params.rating}] Tags: [${params.tags.join(' ')}] and Excluded Tags [${params.excludedTags.join(
					' '
				)}] because it already exists`
			);
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
		thunkLogger.getActionLogger(loadSavedSearchesFromDb);
		return db.savedSearches.getAll();
	}
);

export const addPreviewToActiveSavedSearch = createAsyncThunk<SavedSearch, string, ThunkApi>(
	'savedSearches/addPreviewToActive',
	async (previewUrl, thunkApi): Promise<SavedSearch> => {
		const logger = thunkLogger.getActionLogger(addPreviewToActiveSavedSearch);
		const savedSearch = thunkApi.getState().savedSearches.activeSavedSearch;
		if (!savedSearch) {
			const msg = 'Cannot add preview to Saved Search. No Saved Search is set as active.';
			logger.error(msg);
			throw new Error(msg);
		}
		logger.debug('Creating blob from URL', previewUrl);
		const blob = await (await fetch(previewUrl)).blob();
		logger.debug(`Adding preview to saved search id ${savedSearch.id}`);
		savedSearch.id && db.savedSearches.addPreview(savedSearch.id, blob);
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
		const logger = thunkLogger.getActionLogger(removePreview);
		logger.debug(`Removing preview id ${params.previewId} from saved search id ${params.savedSearch.id}`);
		db.savedSearches.removePreview(params.savedSearch, params.previewId);
		return { savedSearchId: params.savedSearch.id, previewId: params.previewId };
	}
);
