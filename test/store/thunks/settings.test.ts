import { doDatabaseMock, mockedDb } from '../../helpers/database.mock';
doDatabaseMock();

import { AppDispatch } from 'store/types';
import { RootState } from '../../../src/store/types';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import * as thunks from '../../../src/store/thunks/settings';
import { initialState } from '../../../src/store';
import { mSettings, mFavoritesTreeNode, mTagHistory, mPost, mTag, mTask } from '../../helpers/test.helper';
import { IpcChannels } from '../../../src/types/processDto';
import { ExportedData } from '../../../src/db/types';
import { waitFor } from '@testing-library/react';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('thunks/settings', () => {
	const data: ExportedData = {
		favorites: [mFavoritesTreeNode()],
		posts: [mPost()],
		settings: [{ name: 'name', values: mSettings() }],
		tagSearchHistory: [mTagHistory()],
		tags: [mTag()],
		tasks: [mTask()],
		savedSearches: [],
	};
	describe('loadSettings()', () => {
		it('Loads settings properly', async () => {
			// given
			const settings = mSettings();
			const store = mockStore(initialState);
			mockedDb.settings.loadSettings.mockResolvedValue(settings);

			// when
			await store.dispatch(thunks.loadSettings());

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.settings.loadSettings).toBeCalledTimes(1);
			expect(dispatchedActions[0]).toMatchObject({ type: thunks.loadSettings.pending.type, payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: thunks.loadSettings.fulfilled.type, payload: settings });
		});
		it('Dispatches rejected action when settings are not found', async () => {
			// given
			const store = mockStore(initialState);
			const settingsName = 'user';
			mockedDb.settings.loadSettings.mockResolvedValue(undefined);

			// when
			await store.dispatch(thunks.loadSettings(settingsName));

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.settings.loadSettings).toHaveBeenCalledWith(settingsName);
			expect(dispatchedActions[0]).toMatchObject({ type: thunks.loadSettings.pending.type, payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({
				type: thunks.loadSettings.rejected.type,
				payload: undefined,
				error: { message: 'Settings could not be loaded from database' },
			});
		});
	});
	describe('saveSettings()', () => {
		it('Saves settings properly', async () => {
			// given
			const settings = mSettings();
			const store = mockStore({ ...initialState, settings });
			mockedDb.settings.saveSettings.mockResolvedValue('user');

			// when
			await store.dispatch(thunks.saveSettings());

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.settings.saveSettings).toHaveBeenCalledWith({ name: 'user', values: settings });
			expect(dispatchedActions[0]).toMatchObject({ type: thunks.saveSettings.pending.type, payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: thunks.saveSettings.fulfilled.type, payload: undefined });
		});
	});
	describe('updateTheme()', () => {
		it('Updates theme properly', async () => {
			// given
			const settings = mSettings();
			const store = mockStore({ ...initialState, settings });
			const theme = 'light';
			mockedDb.settings.saveSettings.mockResolvedValue('user');

			// when
			await store.dispatch(thunks.updateTheme(theme));

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.settings.saveSettings).toHaveBeenCalledWith({ name: 'user', values: { ...settings, theme } });
			expect(dispatchedActions[0]).toMatchObject({ type: thunks.updateTheme.pending.type, payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: thunks.updateTheme.fulfilled.type, payload: theme });
		});
	});
	describe('updateImagesPath()', () => {
		it('Updates images path properly', async () => {
			// given
			const settings = mSettings();
			const store = mockStore({ ...initialState, settings });
			const path = '/new/images/path';
			mockedDb.settings.saveSettings.mockResolvedValue('user');

			// when
			await store.dispatch(thunks.updateImagePath(path));

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.settings.saveSettings).toHaveBeenCalledWith({ name: 'user', values: { ...settings, imagesFolderPath: path } });
			expect(dispatchedActions[0]).toMatchObject({ type: thunks.updateImagePath.pending.type, payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: thunks.updateImagePath.fulfilled.type, payload: path });
		});
	});
	describe('exportDatabase()', () => {
		it('Sends open select file dialog ipc message and returns false if closed without selecting a file', async () => {
			// given
			const store = mockStore(initialState);
			const ipcInvokeSpy = jest.fn().mockResolvedValue('');
			(global as any).api = {
				invoke: ipcInvokeSpy,
			};

			// when
			await store.dispatch(thunks.exportDatabase());

			// then
			const dispatchedActions = store.getActions();
			expect(ipcInvokeSpy).toBeCalledWith(IpcChannels.OPEN_SELECT_EXPORTED_DATA_FILE_DIALOG);
			expect(dispatchedActions).toContainMatchingAction({ type: thunks.exportDatabase.fulfilled.type, payload: false });
		});
		it('Calls exportDb() and sends message to Ipc with exported data', async () => {
			// given
			const store = mockStore(initialState);
			const filePath = 'testpath';
			const ipcSendSpy = jest.fn();
			(global as any).api = {
				send: ipcSendSpy,
				invoke: jest.fn().mockResolvedValue(filePath),
			};
			mockedDb.common.exportDb.mockResolvedValue(data);

			// when
			await store.dispatch(thunks.exportDatabase());

			// then
			const dispatchedActions = store.getActions();
			expect(ipcSendSpy).toBeCalledWith(IpcChannels.SAVE_EXPORTED_DATA, { data: JSON.stringify(data), filePath });
			expect(dispatchedActions).toContainMatchingAction({ type: thunks.exportDatabase.fulfilled.type, payload: true });
		});
	});
	describe('importDatabase()', () => {
		it('Sends Open import data dialog message and returns false if closed without selecting a file', async () => {
			// given
			const store = mockStore(initialState);
			const ipcInvokeSpy = jest.fn().mockResolvedValue('');
			(global as any).api = {
				invoke: ipcInvokeSpy,
			};

			// when
			await store.dispatch(thunks.importDatabase());

			// then
			const dispatchedActions = store.getActions();
			expect(ipcInvokeSpy).toBeCalledWith(IpcChannels.OPEN_IMPORT_DATA_DIALOG);
			expect(dispatchedActions).toContainMatchingAction({ type: thunks.importDatabase.fulfilled.type, payload: false });
		});
		it('Validates data and does not call importDb when data is missing any key', async () => {
			// given
			const store = mockStore(initialState);
			const ipcSendSpy = jest.fn();
			const ipcInvokeSpy = jest.fn().mockResolvedValue({ test: 'test' });
			(global as any).api = {
				send: ipcSendSpy,
				invoke: ipcInvokeSpy,
			};

			// when
			await store.dispatch(thunks.importDatabase());

			// then
			const dispatchedActions = store.getActions();
			expect(ipcInvokeSpy).toBeCalledWith(IpcChannels.OPEN_IMPORT_DATA_DIALOG);
			expect(dispatchedActions).toContainMatchingAction({ type: thunks.importDatabase.rejected.type });
			expect(mockedDb.common.clearAndRestoreDb).toBeCalledTimes(0);
		});
		it('Calls clearAndRestoreDb if data contains all keys', async () => {
			// given
			const store = mockStore(initialState);
			const ipcSendSpy = jest.fn();
			const ipcInvokeSpy = jest.fn().mockResolvedValue(JSON.stringify(data));
			(global as any).api = {
				send: ipcSendSpy,
				invoke: ipcInvokeSpy,
			};

			// when
			await store.dispatch(thunks.importDatabase());

			// then
			const dispatchedActions = store.getActions();
			expect(ipcInvokeSpy).toBeCalledWith(IpcChannels.OPEN_IMPORT_DATA_DIALOG);
			await waitFor(() => expect(dispatchedActions).toContainMatchingAction({ type: thunks.importDatabase.fulfilled.type, payload: true }));
			expect(mockedDb.common.clearAndRestoreDb).toBeCalledWith(data, expect.anything());
		});
	});
});
