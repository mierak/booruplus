import { createAsyncThunk } from '@reduxjs/toolkit';
import { Modal } from 'antd';
import * as Comlink from 'comlink';

import { db } from '@db';
import { ExportedData } from '@db/types';
import { Settings, ThunkApi } from '@store/types';
import { IpcInvokeChannels, IpcListeners, IpcSendChannels } from '@appTypes/processDto';
import { thunkLoggerFactory } from '@util/logger';
import { formatPercentProgress } from '@util/utils';
import { openNotificationWithIcon } from '@appTypes/components';

import { setFullscreenLoadingMaskState } from '../commonActions';

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

		const newSettings = { ...settings };
		if (settings.imagesFolderPath === 'null') {
			Modal.info({
				title: 'Hi there!',
				content:
					'It looks like this is your first time. Before you do anything you should consider changing path to application data in settings. Happy fapping!',
			});
			newSettings.imagesFolderPath = await window.api.invoke(IpcInvokeChannels.GET_PICTURES_PATH);
			db.settings.saveSettings({ name: 'user', values: newSettings });
		}
		window.api.send(IpcSendChannels.SETTINGS_CHANGED, newSettings);

		return newSettings;
	}
);

export const updateTheme = createAsyncThunk<'dark' | 'light', 'dark' | 'light', ThunkApi>(
	'settings/update-theme',
	async (theme, { getState }): Promise<'dark' | 'light'> => {
		const logger = thunkLogger.getActionLogger(updateTheme);
		const settings = { ...getState().settings };
		settings.theme = theme;
		logger.debug('Saving settings with name user', settings);
		await db.settings.saveSettings({ name: 'user', values: settings });
		return theme;
	}
);

export const saveSettings = createAsyncThunk<void, void, ThunkApi>(
	'settings/save',
	async (_, thunkApi): Promise<void> => {
		const logger = thunkLogger.getActionLogger(saveSettings);
		const settings = thunkApi.getState().settings;
		logger.debug('Saving settings with name user', settings);
		window.api.send(IpcSendChannels.SETTINGS_CHANGED, settings);
		await db.settings.saveSettings({ name: 'user', values: settings });
	}
);

export const exportDatabase = createAsyncThunk<boolean, void, ThunkApi>(
	'settings/export-data',
	async (_, { dispatch }): Promise<boolean> => {
		const logger = thunkLogger.getActionLogger(exportDatabase);
		logger.debug('Opening data export dialog');
		const filePath = await window.api.invoke(IpcInvokeChannels.OPEN_SELECT_EXPORT_FILE_LOCATION_DIALOG, 'data');

		if (filePath) {
			logger.debug('Getting all data from database');
			const exportedData = await db.common.exportDb(
				Comlink.proxy((message: string) => {
					logger.debug(message);
					dispatch(setFullscreenLoadingMaskState(message));
				})
			);

			logger.debug('Sending exported data to main process to be saved');
			dispatch(setFullscreenLoadingMaskState('Saving file'));
			await window.api.invoke(IpcInvokeChannels.SAVE_EXPORTED_DATA, { data: JSON.stringify(exportedData), filePath });
			return true;
		} else {
			logger.debug('Data export dialog closed without selecting a file');
			return false;
		}
	}
);

export const exportImages = createAsyncThunk<boolean, void, ThunkApi>(
	'settings/exportImages',
	async (_, { dispatch }): Promise<boolean> => {
		const logger = thunkLogger.getActionLogger(exportImages);
		logger.debug('Opening data export dialog');
		const filePath = await window.api.invoke(IpcInvokeChannels.OPEN_SELECT_EXPORT_FILE_LOCATION_DIALOG, 'images');

		if (!filePath) {
			logger.debug('Data export dialog closed without selecting a file');
			return false;
		}

		const progressUpdate = (__: unknown, { done, total }: { done: number; total: number }): void => {
			const percent = Math.floor((done / total) * 100);
			dispatch(
				setFullscreenLoadingMaskState({
					message: `Exporting images - ${formatPercentProgress(done, total)}`,
					progressPercent: percent,
				})
			);
		};

		window.api.on(IpcListeners.EXPORT_PROGRESS, progressUpdate);

		logger.debug('Sending EXPORT_IMAGES to main process');
		await window.api.invoke(IpcInvokeChannels.EXPORT_IMAGES, filePath);

		window.api.removeListener(IpcListeners.EXPORT_PROGRESS, progressUpdate);
		openNotificationWithIcon('success', 'Export finished', `Images successfuly exported to ${filePath}`);
		return true;
	}
);

export const importImages = createAsyncThunk<boolean, void, ThunkApi>(
	'settings/importImages',
	async (_, { dispatch }): Promise<boolean> => {
		const logger = thunkLogger.getActionLogger(importImages);

		const progressUpdate = (__: unknown, { done, total }: { done: number; total: number }): void => {
			const percent = Math.floor((done / total) * 100);
			dispatch(
				setFullscreenLoadingMaskState({
					message: `Importing images - ${formatPercentProgress(done, total)}`,
					progressPercent: percent,
				})
			);
		};
		window.api.on(IpcListeners.IMPORT_PROGRESS, progressUpdate);

		logger.debug('Sending IMPORT_IMAGES to main process');
		await window.api.invoke(IpcInvokeChannels.IMPORT_IMAGES);

		window.api.removeListener(IpcListeners.IMPORT_PROGRESS, progressUpdate);
		openNotificationWithIcon(
			'success',
			'Import finished',
			'Images successfuly were successfuly imported to current data path'
		);
		return true;
	}
);

export const importDatabase = createAsyncThunk<boolean, void, ThunkApi>(
	'settings/import-data',
	async (_, { dispatch }): Promise<boolean> => {
		const logger = thunkLogger.getActionLogger(importDatabase);
		logger.debug('Opening data import dialog');
		dispatch(setFullscreenLoadingMaskState('Reading data from disk'));
		const loadedData = await window.api.invoke(IpcInvokeChannels.OPEN_IMPORT_DATA_DIALOG);
		if (!loadedData) {
			logger.debug('Data import dialog closed without selecting a file');
			return false;
		}

		logger.debug('Parsing and checking data');
		dispatch(setFullscreenLoadingMaskState('Validating data'));
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
		dispatch(setFullscreenLoadingMaskState('Reconstructing preview images'));

		await db.common.clearAndRestoreDb(
			dataObj,
			Comlink.proxy((message: string) => {
				logger.debug(message);
				dispatch(setFullscreenLoadingMaskState(message));
			})
		);
		return true;
	}
);
