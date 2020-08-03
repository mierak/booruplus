import { createAsyncThunk } from '@reduxjs/toolkit';

import { db } from '../../db';
import * as api from '../../service/apiService';

import { ThunkApi, RatingCounts, TagHistory, FoundTags, NotFoundTags } from '../types';
import { Tag, Post } from '../../types/gelbooruTypes';
import { thunkLoggerFactory } from '../../util/logger';

const thunkLogger = thunkLoggerFactory('dashboard');

export const fetchDownloadedPostCount = createAsyncThunk<number, void, ThunkApi>(
	'dashboard/fetchDownloadedPostCount',
	async (): Promise<number> => {
		thunkLogger.getActionLogger(fetchDownloadedPostCount);
		return db.posts.getDownloadedCount();
	}
);

export const fetchBlacklistedPostCount = createAsyncThunk<number, void, ThunkApi>(
	'dashboard/fetchBlacklistedPostCount',
	async (): Promise<number> => {
		thunkLogger.getActionLogger(fetchBlacklistedPostCount);
		return db.posts.getBlacklistedCount();
	}
);

export const fetchFavoritePostCount = createAsyncThunk<number, void, ThunkApi>(
	'dashboard/fetchFavoritePostCount',
	async (): Promise<number> => {
		thunkLogger.getActionLogger(fetchFavoritePostCount);
		const postIds = await db.favorites.getlAllPostIds();
		return postIds.length;
	}
);

export const fetchTagCount = createAsyncThunk<number, void, ThunkApi>(
	'dashboard/fetchTagCount',
	async (): Promise<number> => {
		thunkLogger.getActionLogger(fetchTagCount);
		return db.tags.getCount();
	}
);

export const fetchRatingCounts = createAsyncThunk<RatingCounts, void, ThunkApi>(
	'dashboard/fetchRatingCounts',
	async (): Promise<RatingCounts> => {
		const logger = thunkLogger.getActionLogger(fetchRatingCounts);
		logger.debug('fetching safe count');
		const safe = await db.posts.getCountForRating('safe');
		logger.debug('fetching questionable count');
		const questionable = await db.posts.getCountForRating('questionable');
		logger.debug('fetching explicit count');
		const explicit = await db.posts.getCountForRating('explicit');
		return { safe, questionable, explicit };
	}
);

export const fetchMostSearchedTags = createAsyncThunk<TagHistory[], void, ThunkApi>(
	'dashboard/fetchMostSearchedTags',
	async (): Promise<TagHistory[]> => {
		thunkLogger.getActionLogger(fetchMostSearchedTags);
		return db.tagSearchHistory.getMostSearched();
	}
);

export const fetchMostFavoritedTags = createAsyncThunk<{ tag: Tag; count: number }[], number | undefined, ThunkApi>(
	'dashboard/fetchMostFavoritedTags',
	async (limit = 20, thunkApi): Promise<{ tag: Tag; count: number }[]> => {
		const logger = thunkLogger.getActionLogger(fetchMostFavoritedTags);
		logger.debug('Fetching all favorite tags with counts');
		const tags = await db.favorites.getAllFavoriteTagsWithCounts();
		const sorted = tags.sort((a, b) => b.count - a.count).slice(0, limit < 100 ? limit : 100);

		const notFoundTags: NotFoundTags[] = [];
		const foundTags: FoundTags[] = [];

		logger.debug('Fetching tags from DB');
		await Promise.all(
			sorted.map(async (tag) => {
				const tagFromDb = await db.tags.getTag(tag.tag);
				if (tagFromDb) {
					foundTags.push({ tag: tagFromDb, count: tag.count });
				} else {
					notFoundTags.push({ tag: tag.tag, count: tag.count });
				}
			})
		);

		logger.debug(
			`${foundTags.length} tags were found in DB. ${notFoundTags.length} were not found in DB. Fetching tags not found in DB from API`
		);
		const tagsFromApi = await api.getTagsByNames(
			notFoundTags.map((tag) => tag.tag),
			thunkApi.getState().settings.apiKey
		);
		if (notFoundTags.length > 0 && tagsFromApi.length === 0) {
			const msg = `Could not download tags not found in DB, because they were not returned from API. Tags in question: ${notFoundTags.join(
				' '
			)}`;
			logger.error(msg);
			throw new Error(msg);
		}

		logger.debug('fetchMostFavoritedTags', 'Joining tags from API with tags from DB');
		tagsFromApi.forEach((tag) => {
			const notFoundTag = notFoundTags.find((nf) => nf.tag === tag.tag);
			if (!notFoundTag) {
				const msg = `Tag ${tag} was not found in tags returned from API`;
				logger.error(msg);
				throw new Error(msg);
			}
			thunkApi.getState().settings.dashboard.saveTagsNotFoundInDb && db.tags.save(tag);
			foundTags.push({ tag, count: notFoundTag.count });
		});
		return foundTags.sort((a, b) => b.count - a.count);
	}
);

export const fetchMostViewedPosts = createAsyncThunk<Post[], number | undefined, ThunkApi>(
	'dashboard/fetchMostViewedPosts',
	async (limit = 20): Promise<Post[]> => {
		const logger = thunkLogger.getActionLogger(fetchMostViewedPosts);
		logger.debug(`Fetching ${limit} most viewed posts from DB`);
		return db.posts.getMostViewed(limit);
	}
);
