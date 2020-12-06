import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { View, SearchMode, PostsContext } from './types';
import * as thunks from './thunks';

export interface SystemState {
	activeView: View;
	imageViewContext: PostsContext;
	searchMode: SearchMode;
	isSearchFormDrawerVsibile: boolean;
	isDownloadedSearchFormDrawerVisible: boolean;
	isTasksDrawerVisible: boolean;
	isTagsPopoverVisible: boolean;
	isImageViewThumbnailsCollapsed: boolean;
	isFavoritesDirectoryTreeCollapsed: boolean;
	isTagOptionsLoading: boolean;
	isTagTableLoading: boolean;
}

export const initialState: SystemState = {
	activeView: 'dashboard',
	searchMode: 'online',
	imageViewContext: 'posts',
	isSearchFormDrawerVsibile: false,
	isDownloadedSearchFormDrawerVisible: false,
	isTasksDrawerVisible: false,
	isTagsPopoverVisible: false,
	isImageViewThumbnailsCollapsed: true,
	isFavoritesDirectoryTreeCollapsed: false,
	isTagOptionsLoading: false,
	isTagTableLoading: false,
};

const systemSlice = createSlice({
	name: 'system',
	initialState: initialState,
	reducers: {
		setActiveView: (state, action: PayloadAction<View | { view: View; context: PostsContext }>): void => {
			if (typeof action.payload === 'string') {
				state.activeView = action.payload;
			} else {
				state.activeView = action.payload.view;
				state.imageViewContext = action.payload.context;
			}
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
		toggleFavoritesDirectoryTreeCollapsed: (state): void => {
			state.isFavoritesDirectoryTreeCollapsed = !state.isFavoritesDirectoryTreeCollapsed;
		},
	},
	extraReducers: (builder) => {
		// Online Search Form
		builder.addCase(thunks.onlineSearchForm.fetchPosts.pending, (state) => {
			state.activeView = 'search-results';
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
			state.activeView = 'search-results';
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
			state.activeView = 'search-results';
		});
		builder.addCase(thunks.tags.searchTagOffline.pending, (state) => {
			state.searchMode = 'online';
			state.activeView = 'search-results';
		});
		// Saved Searches
		builder.addCase(thunks.savedSearches.searchOnline.pending, (state) => {
			state.searchMode = 'saved-search-online';
			state.activeView = 'search-results';
		});
		builder.addCase(thunks.savedSearches.searchOffline.pending, (state) => {
			state.searchMode = 'saved-search-offline';
			state.activeView = 'search-results';
		});
		builder.addCase(thunks.savedSearches.saveSearch.fulfilled, (state) => {
			if (state.searchMode === 'online') {
				state.searchMode = 'saved-search-online';
			} else if (state.searchMode === 'offline') {
				state.searchMode = 'saved-search-offline';
			}
		});
		builder.addCase(thunks.savedSearches.saveSearch.rejected, (state) => {
			if (state.searchMode === 'online') {
				state.searchMode = 'saved-search-online';
			} else if (state.searchMode === 'offline') {
				state.searchMode = 'saved-search-offline';
			}
		});
		// Posts
		builder.addCase(thunks.posts.downloadPosts.pending, (state) => {
			state.isTasksDrawerVisible = true;
		});
		builder.addCase(thunks.posts.fetchPostsByIds.pending, (state) => {
			state.isTasksDrawerVisible = false;
			state.activeView = 'search-results';
		});
	},
});

export const actions = systemSlice.actions;

export default systemSlice.reducer;
