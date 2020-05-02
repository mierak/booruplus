import { createAsyncThunk } from '@reduxjs/toolkit';

import { db } from 'db';

import { Settings, ThunkApi } from 'store/types';

export const loadSettings = createAsyncThunk<Settings, string | undefined, ThunkApi>(
	'settings/load',
	async (name): Promise<Settings> => {
		const settings = await db.settings.loadSettings(name);
		if (!settings) {
			throw new Error('Settings could not be loaded from database');
		}
		return settings;
	}
);

export const updateImagePath = createAsyncThunk<string, string, ThunkApi>(
	'settings/updateImagePath',
	async (path, thunkApi): Promise<string> => {
		const settings = { ...thunkApi.getState().settings };
		settings.imagesFolderPath = path;
		await db.settings.saveSettings({ name: 'user', values: settings });
		return path;
	}
);

export const updateTheme = createAsyncThunk<'dark' | 'light', 'dark' | 'light', ThunkApi>(
	'settings/updateTheme',
	async (theme, thunkApi): Promise<'dark' | 'light'> => {
		const settings = { ...thunkApi.getState().settings };
		settings.theme = theme;
		await db.settings.saveSettings({ name: 'user', values: settings });
		return theme;
	}
);

export const updateApiKey = createAsyncThunk<string, string, ThunkApi>(
	'settings/updateApiKey',
	async (key, thunkApi): Promise<string> => {
		const settings = { ...thunkApi.getState().settings };
		settings.apiKey = key;
		await db.settings.saveSettings({ name: 'user', values: settings });
		return key;
	}
);

export const updateMostViewedCount = createAsyncThunk<number, number, ThunkApi>(
	'settings/updateMostviewedCount',
	async (count, thunkApi): Promise<number> => {
		const settings = { ...thunkApi.getState().settings };
		settings.dashboard.mostViewedCount = count;
		await db.settings.saveSettings({ name: 'user', values: settings });
		return count;
	}
);

export const saveSettings = createAsyncThunk<void, void, ThunkApi>(
	'settings/saveSettings',
	async (_, thunkApi): Promise<void> => {
		const settings = thunkApi.getState().settings;
		await db.settings.saveSettings({ name: 'user', values: settings });
	}
);
