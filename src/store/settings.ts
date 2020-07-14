import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Settings } from './types';
import * as thunks from './thunks';
import { openNotificationWithIcon } from '../types/components';

const log = window.log;

export const initialState: Settings = {
	imagesFolderPath: '',
	theme: 'dark',
	apiKey: undefined,
	dashboard: {
		mostViewedCount: 28,
		loadMostSearchedTags: true,
		loadMostFavoritedTags: true,
		loadMostViewedPosts: true,
		loadTagStatistics: true,
		loadRatingDistributionChart: true,
		saveTagsNotFoundInDb: true,
	},
};

const settingsSlice = createSlice({
	name: 'settings',
	initialState: initialState,
	reducers: {
		setApiKey: (state, action: PayloadAction<string>): void => {
			state.apiKey = action.payload;
		},
		setMostViewedCount: (state, action: PayloadAction<number>): void => {
			state.dashboard.mostViewedCount = action.payload;
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
		setSaveTagsNotFoundInDb: (state, action: PayloadAction<boolean>): void => {
			state.dashboard.saveTagsNotFoundInDb = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder.addCase(thunks.settings.loadSettings.fulfilled, (state, action) => {
			const settings = { ...action.payload };
			if (action.payload.dashboard === undefined) {
				settings.dashboard = initialState.dashboard;
			}
			return settings;
		});
		builder.addCase(thunks.settings.updateImagePath.fulfilled, (state, action) => {
			state.imagesFolderPath = action.payload;
		});
		builder.addCase(thunks.settings.updateTheme.fulfilled, (state, action) => {
			state.theme = action.payload;
		});
		builder.addCase(thunks.settings.saveSettings.rejected, (_, action) => {
			log.error('Error while saving settings to database', action.error.message);
		});

		// Export database
		builder.addCase(thunks.settings.exportDatabase.fulfilled, (_, action) => {
			if (action.payload) {
				openNotificationWithIcon('success', 'Export finished', 'Database was succesfully exported!');
			}
		});
		builder.addCase(thunks.settings.exportDatabase.rejected, (_, action) => {
			openNotificationWithIcon('error', 'Could not export database', 'Error occured while trying to create a database backup.', 5);
			log.error('Error occured while trying to create a database backup.', action.error.message);
		});
		// Import database
		builder.addCase(thunks.settings.importDatabase.fulfilled, (_, action) => {
			if (action.payload) {
				openNotificationWithIcon('success', 'Import finished', 'Database was succesfully restored!');
			}
		});
		builder.addCase(thunks.settings.importDatabase.rejected, (_, action) => {
			log.error('Database import failed.', action?.error?.message, action?.error?.stack);
			openNotificationWithIcon('error', 'Could not import database', 'Error occured while trying to restore backup.', 5);
		});
	},
});

export const actions = settingsSlice.actions;

export default settingsSlice.reducer;
