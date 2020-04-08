import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { View, SearchMode, AppThunk } from './types';
import { useProgress } from '../src/hooks/useProgress';

export interface SystemState {
	activeView: View;
	searchMode: SearchMode;
	isSearchFormDrawerVsibile: boolean;
	isDownloadedSearchFormDrawerVisible: boolean;
	isImageViewThumbnailsCollapsed: boolean;
	isFetchingPosts: boolean;
	isLoadingImage: boolean;
	isTagOptionsLoading: boolean;
	isTagTableLoading: boolean;
	isLoadingMore: boolean;
}

const initialState: SystemState = {
	activeView: 'dashboard',
	searchMode: 'online',
	isSearchFormDrawerVsibile: false,
	isDownloadedSearchFormDrawerVisible: false,
	isImageViewThumbnailsCollapsed: true,
	isFetchingPosts: false,
	isLoadingImage: false,
	isTagOptionsLoading: false,
	isTagTableLoading: false,
	isLoadingMore: false
};

const systemSlice = createSlice({
	name: 'system',
	initialState: initialState,
	reducers: {
		setActiveView: (state, action: PayloadAction<View>): void => {
			state.activeView = action.payload;
		},
		setSearchMode: (state, action: PayloadAction<SearchMode>): void => {
			state.searchMode = action.payload;
		},
		setSearchFormDrawerVisible: (state, action: PayloadAction<boolean>): void => {
			state.isSearchFormDrawerVsibile = action.payload;
		},
		setDownloadedSearchFormDrawerVisible: (state, action: PayloadAction<boolean>): void => {
			state.isDownloadedSearchFormDrawerVisible = action.payload;
		},
		setImageViewThumbnailsCollapsed: (state, action: PayloadAction<boolean>): void => {
			state.isImageViewThumbnailsCollapsed = action.payload;
		},
		setFetchingPosts: (state, action: PayloadAction<boolean>): void => {
			state.isFetchingPosts = action.payload;
		},
		setIsLoadingImage: (state, action: PayloadAction<boolean>): void => {
			state.isLoadingImage = action.payload;
		},
		setTagOptionsLoading: (state, action: PayloadAction<boolean>): void => {
			state.isTagOptionsLoading = action.payload;
		},
		setTagTableLoading: (state, action: PayloadAction<boolean>): void => {
			state.isTagTableLoading = action.payload;
		},
		setLoadingMore: (state, action: PayloadAction<boolean>): void => {
			state.isLoadingMore = action.payload;
		}
	}
});

const withProgressBar = (actionCallback: (taskId: number) => Promise<void>): AppThunk<void> => async (dispatch): Promise<void> => {
	const [id, close] = await useProgress(dispatch);
	await actionCallback(id);
	close();
};

export const actions = { ...systemSlice.actions, withProgressBar };

export default systemSlice.reducer;
