import { createAsyncThunk } from '@reduxjs/toolkit';

import { db } from '../../db';

import { ThunkApi, RatingCounts, TagHistory } from 'store/types';
import { Tag, Post } from 'types/gelbooruTypes';

const fetchDownloadedPostCount = createAsyncThunk<number, void, ThunkApi>(
	'dashboard/fetchDownloadedPostCount',
	async (): Promise<number> => {
		return db.posts.getDownloadedCount();
	}
);

const fetchBlacklistedPostCount = createAsyncThunk<number, void, ThunkApi>(
	'dashboard/fetchBlacklistedPostCount',
	async (): Promise<number> => {
		return db.posts.getBlacklistedCount();
	}
);

const fetchFavoritePostCount = createAsyncThunk<number, void, ThunkApi>(
	'dashboard/fetchFavoritePostCount',
	async (): Promise<number> => {
		return db.posts.getFavoriteCount();
	}
);

const fetchTagCount = createAsyncThunk<number, void, ThunkApi>(
	'dashboard/fetchTagCount',
	async (): Promise<number> => {
		return db.tags.getCount();
	}
);

const fetchRatingCounts = createAsyncThunk<RatingCounts, void, ThunkApi>(
	'dashboard/fetchRatingCounts',
	async (): Promise<RatingCounts> => {
		const safe = await db.posts.getCountForRating('safe');
		const questionable = await db.posts.getCountForRating('questionable');
		const explicit = await db.posts.getCountForRating('explicit');
		return { safe, questionable, explicit };
	}
);

const fetchMostSearchedTags = createAsyncThunk<TagHistory[], void, ThunkApi>(
	'dashboard/fetchMostSearchedTags',
	async (): Promise<TagHistory[]> => {
		return db.tagSearchHistory.getMostSearched();
	}
);

const fetchMostFavoritedTags = createAsyncThunk<{ tag: Tag | undefined; count: number }[], number | undefined, ThunkApi>(
	'dashboard/fetchMostFavoritedTags',
	async (limit = 20): Promise<{ tag: Tag | undefined; count: number }[]> => {
		return db.tags.getMostFavorited(limit);
	}
);

const fetchMostViewedPosts = createAsyncThunk<Post[], number | undefined, ThunkApi>(
	'dashboard/fetchMostViewedPosts',
	async (limit = 20): Promise<Post[]> => {
		return db.posts.getMostViewed(limit);
	}
);

export const dashboardThunk = {
	fetchDownloadedPostCount,
	fetchBlacklistedPostCount,
	fetchFavoritePostCount,
	fetchTagCount,
	fetchRatingCounts,
	fetchMostSearchedTags,
	fetchMostViewedPosts,
	fetchMostFavoritedTags,
};
