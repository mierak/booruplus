import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import * as db from '../db';
import { AppThunk, TagHistory } from './types';
import { Tag, Post } from '../types/gelbooruTypes';

interface RatingCounts {
	[key: string]: number;
}

interface DashboardState {
	totalDownloadedPosts: number;
	totalFavoritesPosts: number;
	totalBlacklistedPosts: number;
	mostViewedPosts: Post[];
	totalTags: number;
	mostSearchedTags: TagHistory[];
	mostDownloadedTag: number;
	ratingCounts: RatingCounts | undefined;
	mostFavoritedTags: { tag: Tag | undefined; count: number }[];
}

const initialState: DashboardState = {
	totalDownloadedPosts: -1,
	totalFavoritesPosts: -1,
	totalBlacklistedPosts: -1,
	mostViewedPosts: [],
	totalTags: -1,
	mostDownloadedTag: -1,
	mostSearchedTags: [],
	ratingCounts: undefined,
	mostFavoritedTags: []
};

const dashboardSlice = createSlice({
	name: 'dashboard',
	initialState: initialState,
	reducers: {
		setTotalDownloadedPosts: (state, action: PayloadAction<number>): void => {
			state.totalDownloadedPosts = action.payload;
		},
		setTotalBlacklistedPosts: (state, action: PayloadAction<number>): void => {
			state.totalBlacklistedPosts = action.payload;
		},
		setTotalFavoritePosts: (state, action: PayloadAction<number>): void => {
			state.totalFavoritesPosts = action.payload;
		},
		setTotalTags: (state, action: PayloadAction<number>): void => {
			state.totalTags = action.payload;
		},
		setRatingCounts: (state, action: PayloadAction<RatingCounts>): void => {
			state.ratingCounts = action.payload;
		},
		setMostsearchedTags: (state, action: PayloadAction<TagHistory[]>): void => {
			state.mostSearchedTags = action.payload;
		},
		setMostViewedPosts: (state, action: PayloadAction<Post[]>): void => {
			state.mostViewedPosts = action.payload;
		},
		setMostFavoritedTags: (state, action: PayloadAction<{ tag: Tag | undefined; count: number }[]>): void => {
			state.mostFavoritedTags = action.payload;
		}
	}
});

const fetchDownloadedPostCount = (): AppThunk => async (dispatch): Promise<void> => {
	try {
		const count = await db.posts.getDownloadedCount();
		dispatch(dashboardSlice.actions.setTotalDownloadedPosts(count));
	} catch (err) {
		console.error('Error while fetching downloaded post count from db', err);
	}
};

const fetchBlacklistedPostCount = (): AppThunk => async (dispatch): Promise<void> => {
	try {
		const count = await db.posts.getBlacklistedCount();
		dispatch(dashboardSlice.actions.setTotalBlacklistedPosts(count));
	} catch (err) {
		console.error('Error while fetching blacklisted post count from db', err);
	}
};

const fetchFavoritePostCount = (): AppThunk => async (dispatch): Promise<void> => {
	try {
		const count = await db.posts.getFavoriteCount();
		dispatch(dashboardSlice.actions.setTotalFavoritePosts(count));
	} catch (err) {
		console.error('Error while fetching favorite post count from db', err);
	}
};

const fetchTagCount = (): AppThunk => async (dispatch): Promise<void> => {
	try {
		const count = await db.tags.getCount();
		dispatch(dashboardSlice.actions.setTotalTags(count));
	} catch (err) {
		console.error('Error while fetching tag count from db', err);
	}
};

const fetchRatingCounts = (): AppThunk => async (dispatch): Promise<void> => {
	try {
		const safeCount = await db.posts.getCountForRating('safe');
		const questionableCount = await db.posts.getCountForRating('questionable');
		const explicitCount = await db.posts.getCountForRating('explicit');
		dispatch(dashboardSlice.actions.setRatingCounts({ safe: safeCount, questionable: questionableCount, explicit: explicitCount }));
	} catch (err) {
		console.error('Error while fetching rating counts', err);
	}
};

const fetchMostSearchedTags = (): AppThunk => async (dispatch): Promise<void> => {
	try {
		const tags = await db.tagSearchHistory.getMostSearched();
		dispatch(dashboardSlice.actions.setMostsearchedTags(tags));
	} catch (err) {
		console.error('Error while fetching most searched tags from db', err);
	}
};

const fetchMostViewedPosts = (limit = 20): AppThunk => async (dispatch): Promise<void> => {
	try {
		const posts = await db.posts.getMostViewed(limit);
		dispatch(dashboardSlice.actions.setMostViewedPosts(posts));
	} catch (err) {
		console.error('Error while fetching most viewed posts from db', err);
	}
};

const fetchMostFavoritedTags = (limit = 20): AppThunk => async (dispatch): Promise<void> => {
	try {
		const tags = await db.tags.getMostFavorited(limit);
		dispatch(dashboardSlice.actions.setMostFavoritedTags(tags));
	} catch (err) {
		console.error('Error while fetching most favorited tags', err);
	}
};

export const actions = {
	...dashboardSlice.actions,
	fetchDownloadedPostCount,
	fetchBlacklistedPostCount,
	fetchFavoritePostCount,
	fetchTagCount,
	fetchRatingCounts,
	fetchMostSearchedTags,
	fetchMostViewedPosts,
	fetchMostFavoritedTags
};

export default dashboardSlice.reducer;
