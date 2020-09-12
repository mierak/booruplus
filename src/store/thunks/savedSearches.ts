import { createAsyncThunk } from '@reduxjs/toolkit';
import moment from 'moment';

import { db } from '@db';
import { ThunkApi, RejectWithValue } from '@store/types';
import { Rating, SavedSearch, Tag, Post } from '@appTypes/gelbooruTypes';
import { getThumbnailUrl } from '@service/webService';
import { thunkLoggerFactory } from '@util/logger';

import * as downloadedSearchFormThunk from './downloadedSearchForm';
import * as onlineSearchFormThunk from './onlineSearchForm';
import { NoActiveSavedSearchError, SavedSearchAlreadyExistsError } from '@errors/savedSearchError';

const thunkLogger = thunkLoggerFactory();

export const searchOnline = createAsyncThunk<SavedSearch, SavedSearch, ThunkApi>(
	'savedSearches/searchOnline',
	async (savedSearch, thunkApi): Promise<SavedSearch> => {
		const logger = thunkLogger.getActionLogger(searchOnline);
		const clone = { ...savedSearch };
		clone.lastSearched = moment().valueOf();
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
		clone.lastSearched = moment().valueOf();
		logger.debug('Updating last searched to', clone.lastSearched);
		db.savedSearches.save(clone);
		await thunkApi.dispatch(downloadedSearchFormThunk.fetchPosts());
		return clone;
	}
);

interface NewSearchParams {
	tags: Tag[];
	excludedTags: Tag[];
	rating: Rating;
}

export const saveSearch = createAsyncThunk<SavedSearch, NewSearchParams, ThunkApi<SavedSearchAlreadyExistsError>>(
	'savedSearches/save',
	async (params, { rejectWithValue }): Promise<SavedSearch | RejectWithValue<SavedSearchAlreadyExistsError>> => {
		const logger = thunkLogger.getActionLogger(saveSearch);
		const result = await db.savedSearches.createAndSave(params.rating, params.tags, params.excludedTags);

		if (typeof result !== 'number') {
			logger.warn(
				`Cannot save search with Rating: [${params.rating}] Tags: [${params.tags.join(' ')}] and Excluded Tags [${params.excludedTags.join(
					' '
				)}] because it already exists`
			);
			return rejectWithValue(new SavedSearchAlreadyExistsError(result));
		}

		return {
			id: result,
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

export const addPreviewsToActiveSavedSearch = createAsyncThunk<SavedSearch, Post[], ThunkApi<NoActiveSavedSearchError>>(
	'savedSearches/addPreviewsToActiveSavedSearch',
	async (posts, { rejectWithValue, getState }): Promise<SavedSearch | RejectWithValue<NoActiveSavedSearchError>> => {
		const logger = thunkLogger.getActionLogger(addPreviewsToActiveSavedSearch);
		const savedSearch = getState().savedSearches.activeSavedSearch;
		if (!savedSearch) {
			return rejectWithValue(new NoActiveSavedSearchError());
		}

		const promises = posts.map(async (post) => {
			const previewUrl = getThumbnailUrl(post.directory, post.hash);
			logger.debug('Creating blob from URL', previewUrl);
			const blob = await (await fetch(previewUrl)).blob();
			return { blob, post };
		});

		const previews = await Promise.all(promises);
		logger.debug(`Saving ${previews.length} previews to DB`);
		db.savedSearches.addPreviews(savedSearch.id, previews);
		return savedSearch;
	}
);

export const addPreviewToActiveSavedSearch = createAsyncThunk<SavedSearch | undefined, Post, ThunkApi>(
	'savedSearches/addPreviewToActiveSavedSearch',
	async (post, thunkApi): Promise<SavedSearch | undefined> => {
		thunkLogger.getActionLogger(addPreviewToActiveSavedSearch);
		const savedSearch = thunkApi.getState().savedSearches.activeSavedSearch;
		await thunkApi.dispatch(addPreviewsToActiveSavedSearch([post]));
		return savedSearch;
	}
);

export const addSelectedPreviewsToActiveSavedSearch = createAsyncThunk<SavedSearch | undefined, void, ThunkApi>(
	'savedSearches/addSelectedPreviewsToActiveSavedSearch',
	async (_, thunkApi): Promise<SavedSearch | undefined> => {
		thunkLogger.getActionLogger(addSelectedPreviewsToActiveSavedSearch);
		const savedSearch = thunkApi.getState().savedSearches.activeSavedSearch;
		const posts = thunkApi.getState().posts.posts.filter((post) => post.selected);
		await thunkApi.dispatch(addPreviewsToActiveSavedSearch(posts));
		return savedSearch;
	}
);

export const addAllPreviewsToActiveSavedSearch = createAsyncThunk<SavedSearch | undefined, void, ThunkApi>(
	'savedSearches/addAllPreviewsToActiveSavedSearch',
	async (_, thunkApi): Promise<SavedSearch | undefined> => {
		thunkLogger.getActionLogger(addAllPreviewsToActiveSavedSearch);
		const savedSearch = thunkApi.getState().savedSearches.activeSavedSearch;
		const posts = thunkApi.getState().posts.posts;
		await thunkApi.dispatch(addPreviewsToActiveSavedSearch(posts));
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
