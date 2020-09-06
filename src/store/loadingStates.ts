import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import * as thunks from './thunks';
import { setFullscreenLoadingMaskState } from './commonActions';

export interface LoadingStates {
	isMostFavoritedTagsLoading: boolean;
	isMostSearchedTagsLoading: boolean;
	isRatingDistributionChartLoading: boolean;
	isFullImageLoading: boolean;
	isFullscreenLoadingMaskVisible: boolean;
	fullscreenLoadingMaskMessage?: string;
	fullscreenLoadingMaskPercentProgress?: number;
	isScrolling: boolean;
	isFetchingPosts: boolean;
	isSearchDisabled: boolean;
}

export const initialState: LoadingStates = {
	isMostFavoritedTagsLoading: false,
	isMostSearchedTagsLoading: false,
	isRatingDistributionChartLoading: false,
	isFullImageLoading: false,
	isFullscreenLoadingMaskVisible: false,
	isScrolling: false,
	isSearchDisabled: false,
	isFetchingPosts: false,
};

const loadingState = createSlice({
	name: 'loadingState',
	initialState: initialState,
	reducers: {
		setFullImageLoading: (state, action: PayloadAction<boolean>): void => {
			state.isFullImageLoading = action.payload;
		},
		setScrolling: (state, action: PayloadAction<boolean>): void => {
			state.isScrolling = action.payload;
		},
	},
	extraReducers: (builder) => {
		// Dashboard
		builder.addCase(thunks.dashboard.fetchRatingCounts.pending, (state, _) => {
			state.isRatingDistributionChartLoading = true;
		});
		builder.addCase(thunks.dashboard.fetchMostSearchedTags.pending, (state, _) => {
			state.isMostSearchedTagsLoading = true;
		});
		builder.addCase(thunks.dashboard.fetchMostFavoritedTags.pending, (state, _) => {
			state.isMostFavoritedTagsLoading = true;
		});
		builder.addCase(thunks.dashboard.fetchRatingCounts.fulfilled, (state, _) => {
			state.isRatingDistributionChartLoading = false;
		});
		builder.addCase(thunks.dashboard.fetchMostSearchedTags.fulfilled, (state, _) => {
			state.isMostSearchedTagsLoading = false;
		});
		builder.addCase(thunks.dashboard.fetchMostFavoritedTags.fulfilled, (state, _) => {
			state.isMostFavoritedTagsLoading = false;
		});
		builder.addCase(thunks.dashboard.fetchRatingCounts.rejected, (state, _) => {
			state.isRatingDistributionChartLoading = false;
		});
		builder.addCase(thunks.dashboard.fetchMostSearchedTags.rejected, (state, _) => {
			state.isMostSearchedTagsLoading = false;
		});
		builder.addCase(thunks.dashboard.fetchMostFavoritedTags.rejected, (state, _) => {
			state.isMostFavoritedTagsLoading = false;
		});
		// Online Search Form
		builder.addCase(thunks.onlineSearchForm.fetchPosts.pending, (state) => {
			state.isSearchDisabled = true;
			state.isFetchingPosts = true;
		});
		builder.addCase(thunks.onlineSearchForm.fetchMorePosts.pending, (state) => {
			state.isSearchDisabled = true;
		});
		builder.addCase(thunks.onlineSearchForm.checkPostsAgainstDb.fulfilled, (state) => {
			state.isSearchDisabled = false;
			state.isFetchingPosts = false;
		});
		builder.addCase(thunks.onlineSearchForm.checkPostsAgainstDb.rejected, (state) => {
			state.isSearchDisabled = false;
			state.isFetchingPosts = false;
		});
		builder.addCase(thunks.onlineSearchForm.fetchPosts.rejected, (state) => {
			state.isSearchDisabled = false;
			state.isFetchingPosts = false;
		});
		builder.addCase(thunks.onlineSearchForm.fetchMorePosts.rejected, (state) => {
			state.isSearchDisabled = false;
		});
		// Downloaded Search Form
		builder.addCase(thunks.downloadedSearchForm.fetchPosts.pending, (state) => {
			state.isSearchDisabled = true;
			state.isFetchingPosts = true;
		});
		builder.addCase(thunks.downloadedSearchForm.fetchMorePosts.pending, (state) => {
			state.isSearchDisabled = true;
		});
		builder.addCase(thunks.downloadedSearchForm.fetchPosts.fulfilled, (state) => {
			state.isSearchDisabled = false;
			state.isFetchingPosts = false;
		});
		builder.addCase(thunks.downloadedSearchForm.fetchMorePosts.fulfilled, (state) => {
			state.isSearchDisabled = false;
			state.isFetchingPosts = false;
		});
		// Posts
		builder.addCase(thunks.posts.fetchPostsByIds.pending, (state) => {
			state.isSearchDisabled = true;
			state.isFetchingPosts = true;
		});
		builder.addCase(thunks.posts.fetchPostsByIds.fulfilled, (state) => {
			state.isSearchDisabled = false;
			state.isFetchingPosts = false;
		});
		// Import database
		builder.addCase(thunks.settings.importDatabase.pending, (state) => {
			state.fullscreenLoadingMaskMessage = 'Importing data...';
			state.isFullscreenLoadingMaskVisible = true;
		});
		builder.addCase(thunks.settings.importDatabase.fulfilled, (state) => {
			state.isFullscreenLoadingMaskVisible = false;
			state.fullscreenLoadingMaskMessage = undefined;
		});
		builder.addCase(thunks.settings.importDatabase.rejected, (state) => {
			state.isFullscreenLoadingMaskVisible = false;
			state.fullscreenLoadingMaskMessage = undefined;
		});
		// Export database
		builder.addCase(thunks.settings.exportDatabase.pending, (state) => {
			state.fullscreenLoadingMaskMessage = 'Exporting data...';
			state.isFullscreenLoadingMaskVisible = true;
		});
		builder.addCase(thunks.settings.exportDatabase.fulfilled, (state) => {
			state.isFullscreenLoadingMaskVisible = false;
			state.fullscreenLoadingMaskMessage = undefined;
		});
		builder.addCase(thunks.settings.exportDatabase.rejected, (state) => {
			state.isFullscreenLoadingMaskVisible = false;
			state.fullscreenLoadingMaskMessage = undefined;
		});
		// Export images
		builder.addCase(thunks.settings.exportImages.pending, (state) => {
			state.fullscreenLoadingMaskMessage = 'Preparing to export images...';
			state.isFullscreenLoadingMaskVisible = true;
		});
		builder.addCase(thunks.settings.exportImages.fulfilled, (state) => {
			state.isFullscreenLoadingMaskVisible = false;
			state.fullscreenLoadingMaskMessage = undefined;
			state.fullscreenLoadingMaskPercentProgress = undefined;
		});
		builder.addCase(thunks.settings.exportImages.rejected, (state) => {
			state.isFullscreenLoadingMaskVisible = false;
			state.fullscreenLoadingMaskMessage = undefined;
			state.fullscreenLoadingMaskPercentProgress = undefined;
		});
		//Import images
		builder.addCase(thunks.settings.importImages.pending, (state) => {
			state.fullscreenLoadingMaskMessage = 'Preparing to import images...';
			state.isFullscreenLoadingMaskVisible = true;
		});
		builder.addCase(thunks.settings.importImages.fulfilled, (state) => {
			state.isFullscreenLoadingMaskVisible = false;
			state.fullscreenLoadingMaskMessage = undefined;
			state.fullscreenLoadingMaskPercentProgress = undefined;
		});
		builder.addCase(thunks.settings.importImages.rejected, (state) => {
			state.isFullscreenLoadingMaskVisible = false;
			state.fullscreenLoadingMaskMessage = undefined;
			state.fullscreenLoadingMaskPercentProgress = undefined;
		});

		builder.addCase(setFullscreenLoadingMaskState, (state, action) => {
			if (typeof action.payload === 'string') {
				state.fullscreenLoadingMaskMessage = action.payload;
			} else {
				state.fullscreenLoadingMaskMessage = action.payload.message;
				state.fullscreenLoadingMaskPercentProgress = action.payload.progressPercent;
			}
		});
	},
});

export const actions = loadingState.actions;

export default loadingState.reducer;
