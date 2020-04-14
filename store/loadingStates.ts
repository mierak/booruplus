import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LoadingStates {
	isMostFavoritedTagsLoading: boolean;
	isMostSearchedTagsLoading: boolean;
	isRatingDistributionChartLoading: boolean;
}

const initialState: LoadingStates = {
	isMostFavoritedTagsLoading: false,
	isMostSearchedTagsLoading: false,
	isRatingDistributionChartLoading: false
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
		}
	}
});

export const actions = { ...loadingState.actions };

export default loadingState.reducer;
