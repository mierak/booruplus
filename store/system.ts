import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { View } from './types';

export interface SystemState {
	activeView: View;
	searchFormDrawerVsibile: boolean;
	downloadedSearchFormDrawerVisible: boolean;
	imageViewThumbnailsCollapsed: boolean;
	isFetchingPosts: boolean;
	isLoadingImage: boolean;
	tagOptionsLoading: boolean;
	tagTableLoading: boolean;
}

const initialState: SystemState = {
	activeView: 'dashboard',
	searchFormDrawerVsibile: false,
	downloadedSearchFormDrawerVisible: false,
	imageViewThumbnailsCollapsed: true,
	isFetchingPosts: false,
	isLoadingImage: false,
	tagOptionsLoading: false,
	tagTableLoading: false
};

const systemSlice = createSlice({
	name: 'system',
	initialState: initialState,
	reducers: {
		setActiveView: (state, action: PayloadAction<View>): void => {
			state.activeView = action.payload;
		},
		setSearchFormDrawerVisible: (state, action: PayloadAction<boolean>): void => {
			state.searchFormDrawerVsibile = action.payload;
		},
		setDownloadedSearchFormDrawerVisible: (state, action: PayloadAction<boolean>): void => {
			state.downloadedSearchFormDrawerVisible = action.payload;
		},
		setImageViewThumbnailsCollapsed: (state, action: PayloadAction<boolean>): void => {
			state.imageViewThumbnailsCollapsed = action.payload;
		},
		setFetchingPosts: (state, action: PayloadAction<boolean>): void => {
			state.isFetchingPosts = action.payload;
		},
		setIsLoadingImage: (state, action: PayloadAction<boolean>): void => {
			state.isLoadingImage = action.payload;
		},
		setTagOptionsLoading: (state, action: PayloadAction<boolean>): void => {
			state.tagOptionsLoading = action.payload;
		},
		setTagTableLoading: (state, action: PayloadAction<boolean>): void => {
			state.tagTableLoading = action.payload;
		}
	}
});

export const actions = systemSlice.actions;

export default systemSlice.reducer;
