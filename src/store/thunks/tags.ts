import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';

import type { AppThunk, SearchContext, ThunkApi } from '@store/types';
import type { Tag, TagType } from '@appTypes/gelbooruTypes';

import { db } from '@db';
import * as api from '@service/apiService';
import { getActionLogger } from '@util/logger';

import * as onlineSearchFormThunk from './onlineSearches';
import * as downloadedSearchFormThunk from './offlineSearches';
import * as searchContextsThunk from './searchContexts';
import { initPostsContext } from '../commonActions';

export const loadAllTagsFromDb = createAsyncThunk<Tag[], void, ThunkApi>(
	'tags/loadAllTagsFromDb',
	async (): Promise<Tag[]> => {
		return await db.tags.getAll();
	}
);

export const getCount = createAsyncThunk<number, { pattern?: string; types?: TagType[] } | undefined, ThunkApi>(
	'tags/getCount',
	async (params): Promise<number> => {
		const logger = getActionLogger(getCount);
		logger.debug(`Getting count for pattern: [${params?.pattern}] and tag types: [${params?.types?.join(' ')}]`);
		return db.tags.getCount(params);
	}
);

export const loadAllWithLimitAndOffset = createAsyncThunk<
	Tag[],
	{ pattern?: string; limit: number; offset: number; types?: TagType[] },
	ThunkApi
>(
	'tags/loadAllWithLimitAndOffset',
	async (params): Promise<Tag[]> => {
		const logger = getActionLogger(loadAllWithLimitAndOffset);
		logger.debug('Getting tags with options', JSON.stringify(params));

		const tags = await db.tags.getAllWithLimitAndOffset(params);
		const favoriteCounts = await db.favorites.getAllFavoriteTagsWithCounts();
		const { blacklistedCounts, downloadedCounts } = await db.tags.getBlacklistedAndDownloadedCounts();
		const tagsWithStats = tags.map((tag) => {
			tag.blacklistedCount = blacklistedCounts[tag.tag] ?? 0;
			tag.downloadedCount = downloadedCounts[tag.tag] ?? 0;
			tag.favoriteCount = favoriteCounts[tag.tag] ?? 0;
			return tag;
		});

		return tagsWithStats;
	}
);

export const loadByPatternFromDb = createAsyncThunk<Tag[], string, ThunkApi>(
	'tags/loadByPatternFromDb',
	async (pattern): Promise<Tag[]> => {
		const logger = getActionLogger(loadByPatternFromDb);
		logger.debug('Getting tags from DB with pattern', pattern);
		return db.tags.getByPattern(pattern);
	}
);

export const searchTagOnline = createAsyncThunk<Tag, Tag, ThunkApi>(
	'tags/searchOnline',
	async (tag, { dispatch }): Promise<Tag> => {
		const context = unwrapResult(await dispatch(searchContextsThunk.generateSearchContext()));
		const data: Partial<SearchContext> = {
			mode: 'online',
			selectedTags: [tag],
		};
		dispatch(initPostsContext({ context, data }));
		await dispatch(onlineSearchFormThunk.fetchPosts({ context }));
		return tag;
	}
);

export const searchTagOffline = createAsyncThunk<Tag, Tag, ThunkApi>(
	'tags/searchOffline',
	async (tag, { dispatch }): Promise<Tag> => {
		const context = unwrapResult(await dispatch(searchContextsThunk.generateSearchContext()));
		const data: Partial<SearchContext> = {
			mode: 'offline',
			selectedTags: [tag],
		};
		dispatch(initPostsContext({ context, data }));
		await dispatch(downloadedSearchFormThunk.fetchPosts({ context }));
		return tag;
	}
);

// TODO make into a proper Thunk - used only in TagsPopover
export const fetchTags = (tags: string[]): AppThunk<Tag[]> => async (_, getState): Promise<Tag[]> => {
	const logger = getActionLogger({ typePrefix: 'fetchTags' });
	logger.debug('Preparing to fetch', tags.length, 'tags');
	try {
		const tagsFromDb: Tag[] = [];
		const notFoundTags: string[] = [];
		for (const tag of tags) {
			const tagFromDb = await db.tags.getTag(tag);
			if (!tagFromDb) {
				notFoundTags.push(tag);
			} else {
				tagsFromDb.push(tagFromDb);
			}
		}
		logger.debug(
			`${tagsFromDb.length} were tags found in DB. ${notFoundTags.length} were not found in DB. Fetching not found tags from API`
		);
		const tagsFromApi = await api.getTagsByNames(notFoundTags, getState().settings.apiKey);
		return [...tagsFromDb, ...tagsFromApi];
	} catch (err) {
		logger.error('Error while loading multiple tags from DB', err);
		return Promise.reject(err);
	}
};
