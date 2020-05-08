import { AppThunk, ThunkApi } from 'store/types';
import { db } from 'db';
import { Tag, TagType } from 'types/gelbooruTypes';
import * as api from 'service/apiService';
import { createAsyncThunk } from '@reduxjs/toolkit';
import * as onlineSearchFormThunk from './onlineSearchForm';
import * as downloadedSearchFormThunk from './downloadedSearchForm';

export const deduplicateAndCheckTagsAgainstDb = async (tags: string[]): Promise<string[]> => {
	const deduplicated = Array.from(new Set(tags));
	const checked = await Promise.all(
		deduplicated.map(async (tag) => {
			const exists = await db.tags.checkIfExists(tag);
			if (!exists) return tag;
		})
	);
	const checkedAndFiltered: string[] = [];
	checked.forEach((val) => val !== undefined && checkedAndFiltered.push(val));
	return checkedAndFiltered;
};

export const loadAllTagsFromDb = createAsyncThunk<Tag[], void, ThunkApi>(
	'tags/loadAllTagsFromDb',
	async (): Promise<Tag[]> => {
		const tags = await db.tags.getAll();
		return tags ? tags : [];
	}
);

export const getCount = createAsyncThunk<number, { pattern?: string; types?: TagType[] } | undefined, ThunkApi>(
	'tags/getCount',
	async (params): Promise<number> => {
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
		const tags = await db.tags.getAllWithLimitAndOffset(params);
		if (tags) {
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
		return [];
	}
);

export const loadByPatternFromDb = createAsyncThunk<Tag[], string, ThunkApi>(
	'tags/loadByPatternFromDb',
	async (pattern): Promise<Tag[]> => {
		return db.tags.getByPattern(pattern);
	}
);

export const searchTagOnline = createAsyncThunk<Tag, Tag, ThunkApi>(
	'tags/searchOnline',
	async (tag, thunkApi): Promise<Tag> => {
		thunkApi.dispatch(onlineSearchFormThunk.fetchPosts());
		return tag;
	}
);

export const searchTagOffline = createAsyncThunk<Tag, Tag, ThunkApi>(
	'tags/searchOffline',
	async (tag, thunkApi): Promise<Tag> => {
		thunkApi.dispatch(downloadedSearchFormThunk.fetchPosts());
		return tag;
	}
);

// TODO make into a proper Thunk - used only in TagsPopover
export const fetchTags = (tags: string[]): AppThunk<Tag[]> => async (_, getState): Promise<Tag[]> => {
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
		const tagsFromApi = await api.getTagsByNames(notFoundTags, getState().settings.apiKey);
		return [...tagsFromDb, ...tagsFromApi];
	} catch (err) {
		console.error('Error while loading multiple tags from DB', err);
		return Promise.reject(err);
	}
};
