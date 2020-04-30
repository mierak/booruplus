import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Settings } from './types';
import * as thunks from './thunks';

const initialState: Settings = {
	imagesFolderPath: '',
	theme: 'dark',
	mostViewedCount: 28,
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
			state.mostViewedCount = action.payload;
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
		builder.addCase(thunks.settings.updateApiKey.fulfilled, (state, action) => {
			state.apiKey = action.payload;
		});
		builder.addCase(thunks.settings.updateMostViewedCount.fulfilled, (state, action) => {
			state.mostViewedCount = action.payload;
		});
	},
});

export const actions = settingsSlice.actions;

export default settingsSlice.reducer;
