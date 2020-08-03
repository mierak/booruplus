import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { TagHistory, RatingCounts } from './types';
import { Tag, Post } from '../types/gelbooruTypes';
import * as thunks from './thunks';

const log = window.log;

export interface DashboardState {
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

export const initialState: DashboardState = {
	totalDownloadedPosts: -1,
	totalFavoritesPosts: -1,
	totalBlacklistedPosts: -1,
	mostViewedPosts: [],
	totalTags: -1,
	mostDownloadedTag: -1,
	mostSearchedTags: [],
	ratingCounts: undefined,
	mostFavoritedTags: [],
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
		},
	},
	extraReducers: (builder) => {
		builder.addCase(thunks.dashboard.fetchDownloadedPostCount.fulfilled, (state, action) => {
			state.totalDownloadedPosts = action.payload;
		});
		builder.addCase(thunks.dashboard.fetchBlacklistedPostCount.fulfilled, (state, action) => {
			state.totalBlacklistedPosts = action.payload;
		});
		builder.addCase(thunks.dashboard.fetchFavoritePostCount.fulfilled, (state, action) => {
			state.totalFavoritesPosts = action.payload;
		});
		builder.addCase(thunks.dashboard.fetchTagCount.fulfilled, (state, action) => {
			state.totalTags = action.payload;
		});
		builder.addCase(thunks.dashboard.fetchRatingCounts.fulfilled, (state, action) => {
			state.ratingCounts = action.payload;
		});
		builder.addCase(thunks.dashboard.fetchMostSearchedTags.fulfilled, (state, action) => {
			state.mostSearchedTags = action.payload;
		});
		builder.addCase(thunks.dashboard.fetchMostSearchedTags.rejected, (_, action) => {
			log.error('Error occured while fetching most searched tags', action.error.message);
		});
		builder.addCase(thunks.dashboard.fetchMostFavoritedTags.rejected, (_, action) => {
			log.error('Error occured while fetching most favorited tags', action.error.message);
		});
		builder.addCase(thunks.dashboard.fetchMostFavoritedTags.fulfilled, (state, action) => {
			state.mostFavoritedTags = action.payload;
		});
		builder.addCase(thunks.dashboard.fetchMostViewedPosts.fulfilled, (state, action) => {
			state.mostViewedPosts = action.payload;
		});
	},
});

export const actions = {
	...dashboardSlice.actions,
};

export default dashboardSlice.reducer;
