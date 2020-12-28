import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { View, PostsContext } from './types';
import { initPostsContext } from './commonActions';
import * as thunks from './thunks';

export type SystemState = {
	activeView: View;
	imageViewContext: PostsContext | string;
	activeSearchTab: PostsContext | string;
	isTasksDrawerVisible: boolean;
	isTagsPopoverVisible: boolean;
	isImageViewThumbnailsCollapsed: boolean;
	isFavoritesDirectoryTreeCollapsed: boolean;
	isTagOptionsLoading: boolean;
	isTagTableLoading: boolean;
};

export const initialState: SystemState = {
	activeView: 'dashboard',
	imageViewContext: 'default',
	activeSearchTab: 'default',
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
		setActiveView: (state, action: PayloadAction<View | { view: View; context: PostsContext | string }>): void => {
			if (typeof action.payload === 'string') {
				state.activeView = action.payload;
			} else {
				state.activeView = action.payload.view;
				state.imageViewContext = action.payload.context;
			}
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
		setActiveSearchTab: (state, action: PayloadAction<string>): void => {
			state.activeSearchTab = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder.addCase(initPostsContext, (state, action) => {
			state.activeSearchTab = action.payload.context;
		});
		// Online Search Form
		builder.addCase(thunks.onlineSearchForm.fetchPosts.pending, (state) => {
			state.activeView = 'searches';
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
			state.activeView = 'searches';
		});
		// Tags
		builder.addCase(thunks.tags.loadAllWithLimitAndOffset.pending, (state) => {
			state.isTagTableLoading = true;
		});
		builder.addCase(thunks.tags.loadAllWithLimitAndOffset.fulfilled, (state) => {
			state.isTagTableLoading = false;
		});
		builder.addCase(thunks.tags.searchTagOnline.pending, (state) => {
			state.activeView = 'searches';
		});
		builder.addCase(thunks.tags.searchTagOffline.pending, (state) => {
			state.activeView = 'searches';
		});
		// Saved Searches
		builder.addCase(thunks.savedSearches.searchOnline.pending, (state) => {
			state.activeView = 'searches';
		});
		builder.addCase(thunks.savedSearches.searchOffline.pending, (state) => {
			state.activeView = 'searches';
		});
		// Posts
		builder.addCase(thunks.posts.downloadPosts.pending, (state) => {
			state.isTasksDrawerVisible = true;
		});
		builder.addCase(thunks.posts.fetchPostsByIds.pending, (state) => {
			state.isTasksDrawerVisible = false;
			state.activeView = 'searches';
		});
	},
});

export const actions = systemSlice.actions;

export default systemSlice.reducer;
