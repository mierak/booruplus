import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as thunks from './thunks';

export interface LoadingStates {
	isMostFavoritedTagsLoading: boolean;
	isMostSearchedTagsLoading: boolean;
	isRatingDistributionChartLoading: boolean;
	isFullImageLoading: boolean;
}

export const initialState: LoadingStates = {
	isMostFavoritedTagsLoading: false,
	isMostSearchedTagsLoading: false,
	isRatingDistributionChartLoading: false,
	isFullImageLoading: false,
};

const loadingState = createSlice({
	name: 'loadingState',
	initialState: initialState,
	reducers: {
		setFullImageLoading: (state, action: PayloadAction<boolean>): void => {
			state.isFullImageLoading = action.payload;
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
	},
});

export const actions = loadingState.actions;

export default loadingState.reducer;
