import { createAsyncThunk } from '@reduxjs/toolkit';

import { db } from '../../db';

import { Settings, ThunkApi } from '../../store/types';
import { IpcChannels, ExportDataDto } from '../../types/processDto';
import { ExportedData } from '../../db/types';
import { setFullscreenLoadingMaskMessage } from '../commonActions';
import * as Comlink from 'comlink';

import { thunkLoggerFactory } from '../../util/logger';

const thunkLogger = thunkLoggerFactory();

export const loadSettings = createAsyncThunk<Settings, string | undefined, ThunkApi>(
	'settings/load',
	async (name): Promise<Settings> => {
		const logger = thunkLogger.getActionLogger(loadSettings);
		logger.debug(`Loading settings with name: ${name}`);
		const settings = await db.settings.loadSettings(name);
		if (!settings) {
			const msg = 'Settings could not be loaded from database';
			logger.error(msg);
			throw new Error(msg);
		}
		return settings;
	}
);

export const updateImagePath = createAsyncThunk<string, string, ThunkApi>(
	'settings/update-image-path',
	async (path, thunkApi): Promise<string> => {
		const logger = thunkLogger.getActionLogger(updateImagePath);
		const settings = { ...thunkApi.getState().settings };
		settings.imagesFolderPath = path;
		logger.debug('Saving settins with name user', settings);
		await db.settings.saveSettings({ name: 'user', values: settings });
		return path;
	}
);

export const updateTheme = createAsyncThunk<'dark' | 'light', 'dark' | 'light', ThunkApi>(
	'settings/update-theme',
	async (theme, thunkApi): Promise<'dark' | 'light'> => {
		const logger = thunkLogger.getActionLogger(updateTheme);
		const settings = { ...thunkApi.getState().settings };
		settings.theme = theme;
		logger.debug('Saving settins with name user', settings);
		await db.settings.saveSettings({ name: 'user', values: settings });
		return theme;
	}
);

export const saveSettings = createAsyncThunk<void, void, ThunkApi>(
	'settings/save',
	async (_, thunkApi): Promise<void> => {
		const logger = thunkLogger.getActionLogger(saveSettings);
		const settings = thunkApi.getState().settings;
		logger.debug('Saving settins with name user', settings);
		await db.settings.saveSettings({ name: 'user', values: settings });
	}
);

export const exportDatabase = createAsyncThunk<boolean, void, ThunkApi>(
	'settings/export-data',
	async (_, thunkApi): Promise<boolean> => {
		const logger = thunkLogger.getActionLogger(exportDatabase);
		logger.debug('Opening data export dialog');
		const filePath = await window.api.invoke<string>(IpcChannels.OPEN_SELECT_EXPORTED_DATA_FILE_DIALOG);

		if (filePath) {
			logger.debug('Getting all data from database');
			const exportedData = await db.common.exportDb(
				Comlink.proxy((message: string) => {
					logger.debug(message);
					thunkApi.dispatch(setFullscreenLoadingMaskMessage(message));
				})
			);

			logger.debug('Sending exported data to main process to be saved');
			thunkApi.dispatch(setFullscreenLoadingMaskMessage('Saving file'));
			window.api.send<ExportDataDto>(IpcChannels.SAVE_EXPORTED_DATA, { data: JSON.stringify(exportedData), filePath });
			return true;
		} else {
			logger.debug('Data export dialog closed without selecting a file');
			return false;
		}
	}
);

export const importDatabase = createAsyncThunk<boolean, void, ThunkApi>(
	'settings/import-data',
	async (_, thunkApi): Promise<boolean> => {
		const logger = thunkLogger.getActionLogger(importDatabase);
		logger.debug('Opening data import dialog');
		thunkApi.dispatch(setFullscreenLoadingMaskMessage('Reading data from disk'));
		const loadedData = await window.api.invoke<string>(IpcChannels.OPEN_IMPORT_DATA_DIALOG);
		if (!loadedData) {
			logger.debug('Data import dialog closed without selecting a file');
			return false;
		}

		logger.debug('Parsing and checking data');
		thunkApi.dispatch(setFullscreenLoadingMaskMessage('Validating data'));
		const dataObj: ExportedData = JSON.parse(loadedData);
		const keys = Object.keys(dataObj);
		if (
			!keys.includes('posts') ||
			!keys.includes('favorites') ||
			!keys.includes('settings') ||
			!keys.includes('tags') ||
			!keys.includes('tagSearchHistory') ||
			!keys.includes('tasks') ||
			!keys.includes('savedSearches')
		) {
			logger.error(
				'Imported data missing one of required properties: ["posts","favorites","settings","tags","tagSearchHistory","tasks","savedSearches"]'
			);
			throw new Error('Imported data are not valid.');
		}

		logger.debug('Parsing and checking finished. Transforming base64 images to blobs.');
		thunkApi.dispatch(setFullscreenLoadingMaskMessage('Reconstructing preview images'));

		await db.common.clearAndRestoreDb(
			dataObj,
			Comlink.proxy((message: string) => {
				logger.debug(message);
				thunkApi.dispatch(setFullscreenLoadingMaskMessage(message));
			})
		);
		return true;
	}
);
