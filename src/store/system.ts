import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { View, SearchMode } from './types';
import * as thunks from './thunks';

export interface SystemState {
	activeView: View;
	searchMode: SearchMode;
	isSearchFormDrawerVsibile: boolean;
	isDownloadedSearchFormDrawerVisible: boolean;
	isTasksDrawerVisible: boolean;
	isTagsPopoverVisible: boolean;
	isImageViewThumbnailsCollapsed: boolean;
	isTagOptionsLoading: boolean;
	isTagTableLoading: boolean;
}

export const initialState: SystemState = {
	activeView: 'dashboard',
	searchMode: 'online',
	isSearchFormDrawerVsibile: false,
	isDownloadedSearchFormDrawerVisible: false,
	isTasksDrawerVisible: false,
	isTagsPopoverVisible: false,
	isImageViewThumbnailsCollapsed: true,
	isTagOptionsLoading: false,
	isTagTableLoading: false,
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
		setTasksDrawerVisible: (state, action: PayloadAction<boolean>): void => {
			state.isTasksDrawerVisible = action.payload;
		},
		setTagsPopovervisible: (state, action: PayloadAction<boolean>): void => {
			state.isTagsPopoverVisible = action.payload;
		},
		setImageViewThumbnailsCollapsed: (state, action: PayloadAction<boolean>): void => {
			state.isImageViewThumbnailsCollapsed = action.payload;
		},
	},
	extraReducers: (builder) => {
		// Online Search Form
		builder.addCase(thunks.onlineSearchForm.fetchPosts.pending, (state) => {
			state.activeView = 'thumbnails';
			state.isSearchFormDrawerVsibile = false;
			state.isDownloadedSearchFormDrawerVisible = false;
		});
		builder.addCase(thunks.onlineSearchForm.getTagsByPatternFromApi.pending, (state) => {
			state.isTagOptionsLoading = true;
		});
		builder.addCase(thunks.onlineSearchForm.getTagsByPatternFromApi.fulfilled, (state) => {
			state.isTagOptionsLoading = false;
		});
		builder.addCase(thunks.onlineSearchForm.getTagsByPatternFromApi.rejected, (state) => {
			state.isTagOptionsLoading = false;
		});
		// Downloaded Search Form
		builder.addCase(thunks.downloadedSearchForm.fetchPosts.pending, (state) => {
			state.activeView = 'thumbnails';
			state.isSearchFormDrawerVsibile = false;
			state.isDownloadedSearchFormDrawerVisible = false;
		});
		// Tags
		builder.addCase(thunks.tags.loadAllWithLimitAndOffset.pending, (state) => {
			state.isTagTableLoading = true;
		});
		builder.addCase(thunks.tags.loadAllWithLimitAndOffset.fulfilled, (state) => {
			state.isTagTableLoading = false;
		});
		builder.addCase(thunks.tags.searchTagOnline.pending, (state) => {
			state.searchMode = 'online';
			state.activeView = 'thumbnails';
		});
		builder.addCase(thunks.tags.searchTagOffline.pending, (state) => {
			state.searchMode = 'online';
			state.activeView = 'thumbnails';
		});
		// Saved Searches
		builder.addCase(thunks.savedSearches.searchOnline.pending, (state) => {
			state.searchMode = 'saved-search-online';
			state.activeView = 'thumbnails';
		});
		builder.addCase(thunks.savedSearches.searchOffline.pending, (state) => {
			state.searchMode = 'saved-search-offline';
			state.activeView = 'thumbnails';
		});
		// Posts
		builder.addCase(thunks.posts.downloadPosts.pending, (state) => {
			state.isTasksDrawerVisible = true;
		});
		builder.addCase(thunks.posts.fetchPostsByIds.pending, (state) => {
			state.isTasksDrawerVisible = false;
			state.activeView = 'thumbnails';
			state.searchMode = 'open-download';
		});
	},
});

export const actions = systemSlice.actions;

export default systemSlice.reducer;
