import { AppThunk, ThunkApi } from '../../store/types';
import { db } from '../../db';
import { Tag, TagType } from '../../types/gelbooruTypes';
import * as api from '../../service/apiService';
import { createAsyncThunk } from '@reduxjs/toolkit';
import * as onlineSearchFormThunk from './onlineSearchForm';
import * as downloadedSearchFormThunk from './downloadedSearchForm';
import { thunkLoggerFactory } from '../../util/logger';

const thunkLogger = thunkLoggerFactory();

export const loadAllTagsFromDb = createAsyncThunk<Tag[], void, ThunkApi>(
	'tags/loadAllTagsFromDb',
	async (): Promise<Tag[]> => {
		thunkLogger.getActionLogger(loadAllTagsFromDb);
		return await db.tags.getAll();
	}
);

export const getCount = createAsyncThunk<number, { pattern?: string; types?: TagType[] } | undefined, ThunkApi>(
	'tags/getCount',
	async (params): Promise<number> => {
		const logger = thunkLogger.getActionLogger(getCount);
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
		const logger = thunkLogger.getActionLogger(loadAllWithLimitAndOffset);
		logger.debug('Getting tags with options', JSON.stringify(params));
		const tags = await db.tags.getAllWithLimitAndOffset(params);
		const tagsWithStats = await Promise.all(
			tags.map(async (tag) => {
				tag.blacklistedCount = await db.tags.getBlacklistedCount(tag.tag);
				tag.downloadedCount = await db.tags.getDownloadedCount(tag.tag);
				tag.favoriteCount = 0; //TODO
				return tag;
			})
		);
		return tagsWithStats;
	}
);

export const loadByPatternFromDb = createAsyncThunk<Tag[], string, ThunkApi>(
	'tags/loadByPatternFromDb',
	async (pattern): Promise<Tag[]> => {
		const logger = thunkLogger.getActionLogger(loadByPatternFromDb);
		logger.debug('Getting tags from DB with pattern', pattern);
		return db.tags.getByPattern(pattern);
	}
);

export const searchTagOnline = createAsyncThunk<Tag, Tag, ThunkApi>(
	'tags/searchOnline',
	async (tag, thunkApi): Promise<Tag> => {
		thunkLogger.getActionLogger(searchTagOnline);
		await thunkApi.dispatch(onlineSearchFormThunk.fetchPosts());
		return tag;
	}
);

export const searchTagOffline = createAsyncThunk<Tag, Tag, ThunkApi>(
	'tags/searchOffline',
	async (tag, thunkApi): Promise<Tag> => {
		thunkLogger.getActionLogger(searchTagOffline);
		await thunkApi.dispatch(downloadedSearchFormThunk.fetchPosts());
		return tag;
	}
);

// TODO make into a proper Thunk - used only in TagsPopover
export const fetchTags = (tags: string[]): AppThunk<Tag[]> => async (_, getState): Promise<Tag[]> => {
	const logger = thunkLogger.getActionLogger({ typePrefix: 'fetchTags' });
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
