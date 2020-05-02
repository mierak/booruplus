import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Settings, DashboardSettings } from './types';
import * as thunks from './thunks';

const initialState: Settings = {
	imagesFolderPath: '',
	theme: 'dark',
	dashboard: {
		mostViewedCount: 28,
		loadMostSearchedTags: true,
		loadMostFavoritedTags: true,
		loadMostViewedPosts: true,
		loadTagStatistics: true,
		loadRatingDistributionChart: true,
	},
};

const settingsSlice = createSlice({
	name: 'settings',
	initialState: initialState,
	reducers: {
		setSettings: (state, action: PayloadAction<Settings>): Settings => {
			return action.payload;
		},
		setImagesFolderPath: (state, action: PayloadAction<string>): void => {
			state.imagesFolderPath = action.payload;
		},
		setGelbooruUsername: (state, action: PayloadAction<string>): void => {
			state.gelbooruUsername = action.payload;
		},
		setApiKey: (state, action: PayloadAction<string>): void => {
			state.apiKey = action.payload;
		},
		setMostViewedCount: (state, action: PayloadAction<number>): void => {
			state.dashboard.mostViewedCount = action.payload;
		},
		setDashboardSettings: (state, action: PayloadAction<DashboardSettings>): void => {
			state.dashboard = action.payload;
		},
		setLoadMostSearchedTags: (state, action: PayloadAction<boolean>): void => {
			state.dashboard.loadMostSearchedTags = action.payload;
		},
		setLoadMostFavoritedTags: (state, action: PayloadAction<boolean>): void => {
			state.dashboard.loadMostFavoritedTags = action.payload;
		},
		setLoadMostViewedPosts: (state, action: PayloadAction<boolean>): void => {
			state.dashboard.loadMostViewedPosts = action.payload;
		},
		setLoadTagStatistics: (state, action: PayloadAction<boolean>): void => {
			state.dashboard.loadTagStatistics = action.payload;
		},
		setLoadRatingDistribution: (state, action: PayloadAction<boolean>): void => {
			state.dashboard.loadRatingDistributionChart = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder.addCase(thunks.settings.loadSettings.fulfilled, (state, action) => {
			return action.payload;
		});
		builder.addCase(thunks.settings.updateImagePath.fulfilled, (state, action) => {
			state.imagesFolderPath = action.payload;
		});
		builder.addCase(thunks.settings.updateTheme.fulfilled, (state, action) => {
			state.theme = action.payload;
		});
		builder.addCase(thunks.settings.saveSettings.rejected, (state, action) => {
			console.error(action.error.message);
		});
	},
});

export const actions = settingsSlice.actions;

export default settingsSlice.reducer;
