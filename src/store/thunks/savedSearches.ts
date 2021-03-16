import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import moment from 'moment';

import type { PostsContext, SearchContext, ThunkApi } from '@store/types';
import type { Rating, SavedSearch, Tag, Post } from '@appTypes/gelbooruTypes';

import { db } from '@db';
import { getThumbnailUrl } from '@service/webService';
import { getActionLogger } from '@util/logger';
import { saveThumbnail } from '@util/imageIpcUtils';
import { NoActiveSavedSearchError, SavedSearchAlreadyExistsError } from '@errors/savedSearchError';

import { initPostsContext } from '../commonActions';
import * as downloadedSearchFormThunk from './offlineSearches';
import * as onlineSearchFormThunk from './onlineSearches';
import * as searchContextsThunk from './searchContexts';

export const searchOnline = createAsyncThunk<SavedSearch, SavedSearch, ThunkApi>(
	'savedSearches/searchOnline',
	async (savedSearch, { dispatch }): Promise<SavedSearch> => {
		const logger = getActionLogger(searchOnline);
		const clone = { ...savedSearch };
		clone.lastSearched = moment().valueOf();
		logger.debug('Updating last searched to', clone.lastSearched);
		db.savedSearches.save(clone);
		const context = unwrapResult(await dispatch(searchContextsThunk.generateSearchContext()));
		const data: Partial<SearchContext> = {
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
	async (savedSearch, { dispatch }): Promise<SavedSearch> => {
		const logger = getActionLogger(searchOffline);
		const clone = { ...savedSearch };
		clone.lastSearched = moment().valueOf();
		logger.debug('Updating last searched to', clone.lastSearched);
		db.savedSearches.save(clone);
		const context = unwrapResult(await dispatch(searchContextsThunk.generateSearchContext()));
		const data: Partial<SearchContext> = {
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
	async (params, { rejectWithValue }) => {
		const logger = getActionLogger(saveSearch);
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
		await db.savedSearches.remove(savedSearch);
		return savedSearch.id;
	}
);

export const loadSavedSearchesFromDb = createAsyncThunk<SavedSearch[], void, ThunkApi>(
	'savedSearches/loadFromDb',
	async (): Promise<SavedSearch[]> => {
		return db.savedSearches.getAll();
	}
);

export const addPreviewsToSavedSearch = createAsyncThunk<
	number,
	{ posts: Post[]; savedSearchId?: number },
	ThunkApi<NoActiveSavedSearchError>
>(
	'savedSearches/addPreviewsToActiveSavedSearch',
	async ({ posts, savedSearchId }, { rejectWithValue }) => {
		const logger = getActionLogger(addPreviewsToSavedSearch);
		if (savedSearchId === undefined) {
			return rejectWithValue(new NoActiveSavedSearchError());
		}

		const promises = posts.map(async (post) => {
			const previewUrl = getThumbnailUrl(post.directory, post.hash);
			logger.debug('Creating blob from URL', previewUrl);
			const blob = await (await fetch(previewUrl)).blob();
			await saveThumbnail(post);
			await db.posts.put(post);
			return { blob, postId: post.id };
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
		const logger = getActionLogger(removePreview);
		logger.debug(`Removing preview id ${params.previewId} from saved search id ${params.savedSearch.id}`);
		db.savedSearches.removePreview(params.savedSearch, params.previewId);
		return { savedSearchId: params.savedSearch.id, previewId: params.previewId };
	}
);
