import { createAsyncThunk } from '@reduxjs/toolkit';

import { db } from '../../db';
import * as api from 'service/apiService';

import { ThunkApi, RatingCounts, TagHistory, FoundTags, NotFoundTags } from 'store/types';
import { Tag, Post } from 'types/gelbooruTypes';

export const fetchDownloadedPostCount = createAsyncThunk<number, void, ThunkApi>(
	'dashboard/fetchDownloadedPostCount',
	async (): Promise<number> => {
		return db.posts.getDownloadedCount();
	}
);

export const fetchBlacklistedPostCount = createAsyncThunk<number, void, ThunkApi>(
	'dashboard/fetchBlacklistedPostCount',
	async (): Promise<number> => {
		return db.posts.getBlacklistedCount();
	}
);

export const fetchFavoritePostCount = createAsyncThunk<number, void, ThunkApi>(
	'dashboard/fetchFavoritePostCount',
	async (): Promise<number> => {
		const postIds = await db.favoritesTree.getlAllPostIds();
		return postIds.length;
	}
);

export const fetchTagCount = createAsyncThunk<number, void, ThunkApi>(
	'dashboard/fetchTagCount',
	async (): Promise<number> => {
		return db.tags.getCount();
	}
);

export const fetchRatingCounts = createAsyncThunk<RatingCounts, void, ThunkApi>(
	'dashboard/fetchRatingCounts',
	async (): Promise<RatingCounts> => {
		const safe = await db.posts.getCountForRating('safe');
		const questionable = await db.posts.getCountForRating('questionable');
		const explicit = await db.posts.getCountForRating('explicit');
		return { safe, questionable, explicit };
	}
);

export const fetchMostSearchedTags = createAsyncThunk<TagHistory[], void, ThunkApi>(
	'dashboard/fetchMostSearchedTags',
	async (): Promise<TagHistory[]> => {
		return db.tagSearchHistory.getMostSearched();
	}
);

export const fetchMostFavoritedTags = createAsyncThunk<{ tag: Tag; count: number }[], number | undefined, ThunkApi>(
	'dashboard/fetchMostFavoritedTags',
	async (limit = 20, thunkApi): Promise<{ tag: Tag; count: number }[]> => {
		const tags = await db.favoritesTree.getAllFavoriteTagsWithCounts();
		const sorted = tags.sort((a, b) => b.count - a.count).slice(0, limit < 100 ? limit : 100);

		const notFoundTags: NotFoundTags[] = [];
		const foundTags: FoundTags[] = [];

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

		const tagsFromApi = await api.getTagsByNames(
			notFoundTags.map((tag) => tag.tag),
			thunkApi.getState().settings.apiKey
		);
		tagsFromApi.forEach((tag) => {
			const notFoundTag = notFoundTags.find((nf) => nf.tag === tag.tag);
			if (!notFoundTag) throw new Error('Error while fetching most favorited tags while joining tags from api with counts.');
			thunkApi.getState().settings.dashboard.saveTagsNotFoundInDb && db.tags.save(tag);
			foundTags.push({ tag, count: notFoundTag.count });
		});
		return foundTags.sort((a, b) => b.count - a.count);
	}
);

export const fetchMostViewedPosts = createAsyncThunk<Post[], number | undefined, ThunkApi>(
	'dashboard/fetchMostViewedPosts',
	async (limit = 20): Promise<Post[]> => {
		return db.posts.getMostViewed(limit);
	}
);
