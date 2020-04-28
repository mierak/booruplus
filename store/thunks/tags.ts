import { AppThunk, ThunkApi } from 'store/types';
import { db } from 'db';
import { Tag } from 'types/gelbooruTypes';
import * as api from 'service/apiService';
import { thunks } from '..';
import { createAsyncThunk } from '@reduxjs/toolkit';

const deduplicateAndCheckTagsAgainstDb = async (tags: string[]): Promise<string[]> => {
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

const loadAllTagsFromDb = createAsyncThunk<Tag[], void, ThunkApi>(
	'tags/loadAllTagsFromDb',
	async (): Promise<Tag[]> => {
		const tags = await db.tags.getAll();
		return tags ? tags : [];
	}
);

const loadAllTagsFromDbWithStats = createAsyncThunk<Tag[], void, ThunkApi>(
	'tags/loadAllTagsFromDbWithStats',
	async (): Promise<Tag[]> => {
		const tags = await db.tags.getAll();
		if (tags) {
			const tagsWithStats = await Promise.all(
				tags.map(async (tag) => {
					tag.blacklistedCount = await db.tags.getBlacklistedCount(tag.tag);
					tag.downloadedCount = await db.tags.getDownloadedCount(tag.tag);
					tag.favoriteCount = await db.tags.getFavoriteCount(tag.tag);
					return tag;
				})
			);
			console.log('tagsWithStats', tagsWithStats);
			return tagsWithStats;
		}
		return [];
	}
);

const loadByPatternFromDb = createAsyncThunk<Tag[], string, ThunkApi>(
	'tags/loadByPatternFromDb',
	async (pattern): Promise<Tag[]> => {
		return db.tags.getByPattern(pattern);
	}
);

const downloadTags = createAsyncThunk<Tag[], string[], ThunkApi>(
	'tags/download',
	/**
	 * @param tags tags to be downloaded, tags will be first checked against DB and deduplicated
	 * @returns an array of Tag objects containing tags that have been downloaded
	 */
	async (tags, thunkApi): Promise<Tag[]> => {
		const filteredTags = await deduplicateAndCheckTagsAgainstDb(tags);
		const tagsFromApi = await api.getTagsByNames(filteredTags, thunkApi.getState().settings.apiKey);
		db.tags.saveBulk(tagsFromApi);
		return tagsFromApi;
	}
);

const searchTagOnline = createAsyncThunk<Tag, Tag, ThunkApi>(
	'tags/searchOnline',
	async (tag, thunkApi): Promise<Tag> => {
		thunkApi.dispatch(thunks.onlineSearchForm.fetchPosts());
		return tag;
	}
);

const searchTagOffline = createAsyncThunk<Tag, Tag, ThunkApi>(
	'tags/searchOffline',
	async (tag, thunkApi): Promise<Tag> => {
		thunkApi.dispatch(thunks.downloadedSearchForm.fetchPosts());
		return tag;
	}
);

// TODO make into a proper Thunk - used only in TagsPopover
const fetchTags = (tags: string[]): AppThunk<Tag[]> => async (_, getState): Promise<Tag[]> => {
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

export const tagsThunk = {
	loadAllTagsFromDb,
	loadAllTagsFromDbWithStats,
	loadByPatternFromDb,
	downloadTags,
	searchTagOnline,
	searchTagOffline,
	fetchTags,
};
