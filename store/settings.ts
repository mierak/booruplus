import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import * as db from '../db';

import { Settings, AppThunk } from './types';

const initialState: Settings = {
	imagesFolderPath: ''
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
		}
	}
});

const loadSettings = (name?: string): AppThunk => async (dispatch): Promise<void> => {
	try {
		const settings = await db.settings.loadSettings(name);
		if (settings) {
			dispatch(settingsSlice.actions.setSettings(settings));
		} else {
			throw 'Settings could not be loaded from database';
		}
	} catch (err) {
		console.error(err);
	}
};

const updateImagePath = (path: string): AppThunk => async (dispatch, getState): Promise<void> => {
	try {
		const settings = Object.assign({}, getState().settings);
		settings.imagesFolderPath = path;
		settings.imagesFolderPath = await db.settings.saveSettings({ name: 'user', values: settings });
		dispatch(settingsSlice.actions.setImagesFolderPath(path));
	} catch (err) {
		console.error('Error while updating image path setting', err);
	}
};

export const actions = { ...settingsSlice.actions, loadSettings, updateImagePath };

export default settingsSlice.reducer;
