import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { db } from '../db';

import { Settings, AppThunk } from './types';

const initialState: Settings = {
	imagesFolderPath: '',
	theme: 'dark',
	mostViewedCount: 28
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
		}
	}
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

const updateImagePath = (path: string): AppThunk<string> => async (dispatch, getState): Promise<string> => {
	try {
		const settings = { ...getState().settings };
		settings.imagesFolderPath = path;
		dispatch(settingsSlice.actions.setImagesFolderPath(path));
		return await db.settings.saveSettings({ name: 'user', values: settings });
	} catch (err) {
		console.error('Error while updating image path setting', err);
		return Promise.reject(err);
	}
};

const updateTheme = (theme: 'dark' | 'light'): AppThunk<string> => async (_, getState): Promise<string> => {
	try {
		const settings = { ...getState().settings };
		settings.theme = theme;
		return await db.settings.saveSettings({ name: 'user', values: settings });
	} catch (err) {
		console.error('Error while updating theme', err);
		return Promise.reject(err);
	}
};

const updateApiKey = (key: string): AppThunk<string> => async (dispatch, getState): Promise<string> => {
	try {
		const settings = { ...getState().settings };
		settings.apiKey = key;
		dispatch(settingsSlice.actions.setApiKey(key));
		return await db.settings.saveSettings({ name: 'user', values: settings });
	} catch (err) {
		console.error('Error while updating API key');
		return Promise.reject(err);
	}
};

const updateMostViewedCount = (count: number): AppThunk<string> => async (dispatch, getState): Promise<string> => {
	try {
		const settings = { ...getState().settings };
		settings.mostViewedCount = count;
		dispatch(settingsSlice.actions.setMostViewedCount(count));
		return await db.settings.saveSettings({ name: 'user', values: settings });
	} catch (err) {
		console.error('Error while updating most viewed count key');
		return Promise.reject(err);
	}
};

const updateGelbooruUsername = (username: string): AppThunk<string> => async (dispatch, getState): Promise<string> => {
	try {
		const settings = { ...getState().settings };
		settings.gelbooruUsername = username;
		dispatch(settingsSlice.actions.setGelbooruUsername(username));
		return await db.settings.saveSettings({ name: 'user', values: settings });
	} catch (err) {
		console.error('Error while updating username key');
		return Promise.reject(err);
	}
};

const saveSettings = (): AppThunk<string> => async (_, getState): Promise<string> => {
	try {
		const settings = { ...getState().settings };
		return await db.settings.saveSettings({ name: 'user', values: settings });
	} catch (err) {
		console.error('Error while updating username key');
		return Promise.reject(err);
	}
};

export const actions = {
	...settingsSlice.actions,
	loadSettings,
	updateImagePath,
	updateTheme,
	updateApiKey,
	updateGelbooruUsername,
	updateMostViewedCount,
	saveSettings
};

export default settingsSlice.reducer;
