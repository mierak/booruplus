import { createAsyncThunk } from '@reduxjs/toolkit';
import moment from 'moment';

import type { PostsContext, DownloadedSearchFormState, ThunkApi, RejectWithValue } from '@store/types';
import type { Rating, SavedSearch, Tag, Post } from '@appTypes/gelbooruTypes';

import { db } from '@db';
import { getThumbnailUrl } from '@service/webService';
import { thunkLoggerFactory } from '@util/logger';
import { NoActiveSavedSearchError, SavedSearchAlreadyExistsError } from '@errors/savedSearchError';

import { initPostsContext } from '../commonActions';
import * as downloadedSearchFormThunk from './downloadedSearchForm';
import * as onlineSearchFormThunk from './onlineSearchForm';
import { generateTabContext } from '@util/utils';

const thunkLogger = thunkLoggerFactory();

export const searchOnline = createAsyncThunk<SavedSearch, SavedSearch, ThunkApi>(
	'savedSearches/searchOnline',
	async (savedSearch, { getState, dispatch }): Promise<SavedSearch> => {
		const logger = thunkLogger.getActionLogger(searchOnline);
		const clone = { ...savedSearch };
		clone.lastSearched = moment().valueOf();
		logger.debug('Updating last searched to', clone.lastSearched);
		db.savedSearches.save(clone);
		const context = generateTabContext(Object.keys(getState().onlineSearchForm));
		const data: Partial<DownloadedSearchFormState> = {
			mode: 'online',
			savedSearchId: savedSearch.id,
			selectedTags: savedSearch.tags,
			excludedTags: savedSearch.excludedTags,
			rating: savedSearch.rating,
		};
		dispatch(initPostsContext({ context, data }));
		await dispatch(onlineSearchFormThunk.fetchPosts({ context }));
		return clone;
	}
);

export const searchOffline = createAsyncThunk<SavedSearch, SavedSearch, ThunkApi>(
	'savedSearches/searchOffline',
	async (savedSearch, { getState, dispatch }): Promise<SavedSearch> => {
		const logger = thunkLogger.getActionLogger(searchOffline);
		const clone = { ...savedSearch };
		clone.lastSearched = moment().valueOf();
		logger.debug('Updating last searched to', clone.lastSearched);
		db.savedSearches.save(clone);
		const context = generateTabContext(Object.keys(getState().onlineSearchForm));
		const data: Partial<DownloadedSearchFormState> = {
			mode: 'offline',
			savedSearchId: savedSearch.id,
			selectedTags: savedSearch.tags,
			excludedTags: savedSearch.excludedTags,
			rating: savedSearch.rating,
		};
		dispatch(initPostsContext({ context, data }));
		await dispatch(downloadedSearchFormThunk.fetchPosts({ context }));
		return clone;
	}
);

type NewSearchParams = {
	tags: Tag[];
	excludedTags: Tag[];
	rating: Rating;
	context: PostsContext | string;
};

export const saveSearch = createAsyncThunk<SavedSearch, NewSearchParams, ThunkApi<SavedSearchAlreadyExistsError>>(
	'savedSearches/save',
	async (params, { rejectWithValue }): Promise<SavedSearch | RejectWithValue<SavedSearchAlreadyExistsError>> => {
		const logger = thunkLogger.getActionLogger(saveSearch);
		const result = await db.savedSearches.createAndSave(params.rating, params.tags, params.excludedTags);

		if (typeof result !== 'number') {
			logger.warn(
				`Cannot save search with Rating: [${params.rating}] Tags: [${params.tags.join(
					' '
				)}] and Excluded Tags [${params.excludedTags.join(' ')}] because it already exists`
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

export const remove = createAsyncThunk<number, SavedSearch, ThunkApi>(
	'savedSearches/remove',
	async (savedSearch): Promise<number> => {
		thunkLogger.getActionLogger(remove, { initialMessage: 'Deleting Saved Search' });
		await db.savedSearches.remove(savedSearch);
		return savedSearch.id;
	}
);

export const loadSavedSearchesFromDb = createAsyncThunk<SavedSearch[], void, ThunkApi>(
	'savedSearches/loadFromDb',
	async (): Promise<SavedSearch[]> => {
		thunkLogger.getActionLogger(loadSavedSearchesFromDb);
		return db.savedSearches.getAll();
	}
);

export const addPreviewsToSavedSearch = createAsyncThunk<
	number,
	{ posts: Post[]; savedSearchId?: number },
	ThunkApi<NoActiveSavedSearchError>
>(
	'savedSearches/addPreviewsToActiveSavedSearch',
	async ({ posts, savedSearchId }, { rejectWithValue }): Promise<number | RejectWithValue<NoActiveSavedSearchError>> => {
		const logger = thunkLogger.getActionLogger(addPreviewsToSavedSearch);
		if (savedSearchId === undefined) {
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
		db.savedSearches.addPreviews(savedSearchId, previews);
		return savedSearchId;
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
