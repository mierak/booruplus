import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { db } from '../db';

import { Settings, AppThunk } from './types';

const initialState: Settings = {
	imagesFolderPath: '',
	theme: 'dark',
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
	},
});

const loadSettings = (name?: string): AppThunk<Settings> => async (dispatch): Promise<Settings> => {
	try {
		const settings = await db.settings.loadSettings(name);
		if (settings) {
			dispatch(settingsSlice.actions.setSettings(settings));
		} else {
			throw 'Settings could not be loaded from database';
		}
		return Promise.resolve(settings);
	} catch (err) {
		console.error(err);
		return Promise.reject(err);
	}
};

const updateImagePath = (path: string): AppThunk => async (dispatch, getState): Promise<void> => {
	try {
		const settings = { ...getState().settings };
		settings.imagesFolderPath = path;
		db.settings.saveSettings({ name: 'user', values: settings });
		dispatch(settingsSlice.actions.setImagesFolderPath(path));
	} catch (err) {
		console.error('Error while updating image path setting', err);
	}
};

const updateTheme = (theme: 'dark' | 'light'): AppThunk => async (_, getState): Promise<void> => {
	try {
		const settings = { ...getState().settings };
		settings.theme = theme;
		db.settings.saveSettings({ name: 'user', values: settings });
	} catch (err) {
		console.error('Error while updating theme', err);
	}
	return Promise.resolve();
};

export const actions = { ...settingsSlice.actions, loadSettings, updateImagePath, updateTheme };

export default settingsSlice.reducer;
