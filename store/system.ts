import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { View } from './types';

export interface SystemState {
	activeView: View;
	searchFormDrawerVsibile: boolean;
	downloadedSearchFormDrawerVisible: boolean;
	imageViewThumbnailsCollapsed: boolean;
}

const initialState: SystemState = {
	activeView: 'thumbnails',
	searchFormDrawerVsibile: false,
	downloadedSearchFormDrawerVisible: false,
	imageViewThumbnailsCollapsed: true
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
		}
	}
});

export const actions = systemSlice.actions;

export default systemSlice.reducer;
