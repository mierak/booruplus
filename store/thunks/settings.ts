import { createAsyncThunk } from '@reduxjs/toolkit';

import { db } from 'db';

import { Settings, ThunkApi } from 'store/types';

const loadSettings = createAsyncThunk<Settings, string | undefined, ThunkApi>(
	'settings/load',
	async (name): Promise<Settings> => {
		const settings = await db.settings.loadSettings(name);
		if (!settings) {
			throw new Error('Settings could not be loaded from database');
		}
		return settings;
	}
);

const updateImagePath = createAsyncThunk<string, string, ThunkApi>(
	'settings/updateImagePath',
	async (path, thunkApi): Promise<string> => {
		const settings = { ...thunkApi.getState().settings };
		settings.imagesFolderPath = path;
		await db.settings.saveSettings({ name: 'user', values: settings });
		return path;
	}
);

const updateTheme = createAsyncThunk<'dark' | 'light', 'dark' | 'light', ThunkApi>(
	'settings/updateTheme',
	async (theme, thunkApi): Promise<'dark' | 'light'> => {
		const settings = { ...thunkApi.getState().settings };
		settings.theme = theme;
		await db.settings.saveSettings({ name: 'user', values: settings });
		return theme;
	}
);

const updateApiKey = createAsyncThunk<string, string, ThunkApi>(
	'settings/updateApiKey',
	async (key, thunkApi): Promise<string> => {
		const settings = { ...thunkApi.getState().settings };
		settings.apiKey = key;
		await db.settings.saveSettings({ name: 'user', values: settings });
		return key;
	}
);

const updateMostViewedCount = createAsyncThunk<number, number, ThunkApi>(
	'settings/updateMostviewedCount',
	async (count, thunkApi): Promise<number> => {
		const settings = { ...thunkApi.getState().settings };
		settings.mostViewedCount = count;
		await db.settings.saveSettings({ name: 'user', values: settings });
		return count;
	}
);

const saveSettings = createAsyncThunk<void, void, ThunkApi>(
	'settings/saveSettings',
	async (_, thunkApi): Promise<void> => {
		const settings = { ...thunkApi.getState().settings };
		await db.settings.saveSettings({ name: 'user', values: settings });
	}
);

export const settingsThunk = {
	loadSettings,
	updateImagePath,
	updateTheme,
	updateApiKey,
	updateMostViewedCount,
	saveSettings,
};
