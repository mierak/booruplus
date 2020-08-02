import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as thunks from './thunks';
import { setFullscreenLoadingMaskMessage } from './commonActions';

export interface LoadingStates {
	isMostFavoritedTagsLoading: boolean;
	isMostSearchedTagsLoading: boolean;
	isRatingDistributionChartLoading: boolean;
	isFullImageLoading: boolean;
	isFullscreenLoadingMaskVisible: boolean;
	fullscreenLoadingMaskMessage?: string;
	isScrolling: boolean;
}

export const initialState: LoadingStates = {
	isMostFavoritedTagsLoading: false,
	isMostSearchedTagsLoading: false,
	isRatingDistributionChartLoading: false,
	isFullImageLoading: false,
	isFullscreenLoadingMaskVisible: false,
	isScrolling: false,
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

		builder.addCase(setFullscreenLoadingMaskMessage, (state, action) => {
			state.fullscreenLoadingMaskMessage = action.payload;
		});
	},
});

export const actions = loadingState.actions;

export default loadingState.reducer;
