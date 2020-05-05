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
	isFetchingPosts: boolean;
	isTagOptionsLoading: boolean;
	isTagTableLoading: boolean;
	isSearchDisabled: boolean;
}

const initialState: SystemState = {
	activeView: 'dashboard',
	searchMode: 'online',
	isSearchFormDrawerVsibile: false,
	isDownloadedSearchFormDrawerVisible: false,
	isTasksDrawerVisible: false,
	isTagsPopoverVisible: false,
	isImageViewThumbnailsCollapsed: true,
	isFetchingPosts: false,
	isTagOptionsLoading: false,
	isTagTableLoading: false,
	isSearchDisabled: false,
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
		setFetchingPosts: (state, action: PayloadAction<boolean>): void => {
			state.isFetchingPosts = action.payload;
		},
		setTagOptionsLoading: (state, action: PayloadAction<boolean>): void => {
			state.isTagOptionsLoading = action.payload;
		},
		setTagTableLoading: (state, action: PayloadAction<boolean>): void => {
			state.isTagTableLoading = action.payload;
		},
		setSearchDisabled: (state, action: PayloadAction<boolean>): void => {
			state.isSearchDisabled = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder.addCase(thunks.onlineSearchForm.fetchPosts.pending, (state) => {
			state.activeView = 'thumbnails';
			state.isSearchFormDrawerVsibile = false;
			state.isDownloadedSearchFormDrawerVisible = false;
			state.isSearchDisabled = true;
			state.isFetchingPosts = true;
		});
		builder.addCase(thunks.onlineSearchForm.fetchMorePosts.pending, (state) => {
			state.isSearchDisabled = true;
		});
		builder.addCase(thunks.downloadedSearchForm.fetchPosts.pending, (state) => {
			state.isSearchDisabled = true;
			state.isFetchingPosts = true;
			state.activeView = 'thumbnails';
			state.isSearchFormDrawerVsibile = false;
			state.isDownloadedSearchFormDrawerVisible = false;
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
		builder.addCase(thunks.onlineSearchForm.checkPostsAgainstDb.fulfilled, (state) => {
			state.isSearchDisabled = false;
			state.isFetchingPosts = false;
		});
		builder.addCase(thunks.onlineSearchForm.getTagsByPatternFromApi.pending, (state) => {
			state.isTagOptionsLoading = true;
		});
		builder.addCase(thunks.onlineSearchForm.getTagsByPatternFromApi.fulfilled, (state) => {
			state.isTagOptionsLoading = false;
		});
		builder.addCase(thunks.tags.loadAllWithLimitAndOffset.pending, (state) => {
			state.isTagTableLoading = true;
		});
		builder.addCase(thunks.tags.loadAllWithLimitAndOffset.fulfilled, (state) => {
			state.isTagTableLoading = false;
		});
		builder.addCase(thunks.savedSearches.searchOnline.pending, (state) => {
			state.searchMode = 'saved-search-online';
			state.activeView = 'thumbnails';
		});
		builder.addCase(thunks.savedSearches.searchOffline.pending, (state) => {
			state.searchMode = 'saved-search-offline';
			state.activeView = 'thumbnails';
		});
		builder.addCase(thunks.tags.searchTagOnline.pending, (state) => {
			state.searchMode = 'online';
			state.activeView = 'thumbnails';
		});
		builder.addCase(thunks.tags.searchTagOffline.pending, (state) => {
			state.searchMode = 'online';
			state.activeView = 'thumbnails';
		});
		builder.addCase(thunks.posts.downloadPosts.pending, (state) => {
			state.isTasksDrawerVisible = true;
		});
		builder.addCase(thunks.posts.fetchPostsByIds.pending, (state) => {
			state.isTasksDrawerVisible = false;
			state.isSearchDisabled = true;
			state.isFetchingPosts = true;
			state.activeView = 'thumbnails';
			state.searchMode = 'open-download';
		});
		builder.addCase(thunks.posts.fetchPostsByIds.fulfilled, (state) => {
			state.isSearchDisabled = false;
			state.isFetchingPosts = false;
		});
	},
});

export const actions = systemSlice.actions;

export default systemSlice.reducer;
