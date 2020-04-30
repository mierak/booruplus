import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as thunks from './thunks';

interface LoadingStates {
	isMostFavoritedTagsLoading: boolean;
	isMostSearchedTagsLoading: boolean;
	isRatingDistributionChartLoading: boolean;
}

const initialState: LoadingStates = {
	isMostFavoritedTagsLoading: false,
	isMostSearchedTagsLoading: false,
	isRatingDistributionChartLoading: false,
};

const loadingState = createSlice({
	name: 'loadingState',
	initialState: initialState,
	reducers: {
		setMostFavoritedTagsLoading: (state, action: PayloadAction<boolean>): void => {
			state.isMostFavoritedTagsLoading = action.payload;
		},
		setMostSearchedTagsLoading: (state, action: PayloadAction<boolean>): void => {
			state.isMostSearchedTagsLoading = action.payload;
		},
		setRatingDistributionChartLoading: (state, action: PayloadAction<boolean>): void => {
			state.isRatingDistributionChartLoading = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder.addCase(thunks.dashboard.fetchRatingCounts.pending, (state, _) => {
			state.isRatingDistributionChartLoading = true;
		});
		builder.addCase(thunks.dashboard.fetchRatingCounts.fulfilled, (state, _) => {
			state.isRatingDistributionChartLoading = false;
		});
		builder.addCase(thunks.dashboard.fetchMostSearchedTags.pending, (state, _) => {
			state.isMostSearchedTagsLoading = true;
		});
		builder.addCase(thunks.dashboard.fetchMostSearchedTags.fulfilled, (state, _) => {
			state.isMostSearchedTagsLoading = false;
		});
		builder.addCase(thunks.dashboard.fetchMostFavoritedTags.pending, (state, _) => {
			state.isMostFavoritedTagsLoading = true;
		});
		builder.addCase(thunks.dashboard.fetchMostFavoritedTags.fulfilled, (state, _) => {
			state.isMostFavoritedTagsLoading = false;
		});
	},
});

export const actions = loadingState.actions;

export default loadingState.reducer;
