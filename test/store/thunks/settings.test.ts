import { doDatabaseMock, mockedDb } from '../../helpers/database.mock';
doDatabaseMock();

import { AppDispatch } from 'store/types';
import { RootState } from '../../../src/store/types';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import * as thunks from '../../../src/store/thunks/settings';
import { initialState } from '../../../src/store';
import { mSettings } from '../../helpers/test.helper';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('thunks/settings', () => {
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
			expect(dispatchedActions[0]).toMatchObject({ type: 'settings/load/pending', payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: 'settings/load/fulfilled', payload: settings });
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
			expect(dispatchedActions[0]).toMatchObject({ type: 'settings/load/pending', payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({
				type: 'settings/load/rejected',
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
			expect(dispatchedActions[0]).toMatchObject({ type: 'settings/save/pending', payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: 'settings/save/fulfilled', payload: undefined });
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
			expect(dispatchedActions[0]).toMatchObject({ type: 'settings/updateTheme/pending', payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: 'settings/updateTheme/fulfilled', payload: theme });
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
			expect(dispatchedActions[0]).toMatchObject({ type: 'settings/updateImagePath/pending', payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: 'settings/updateImagePath/fulfilled', payload: path });
		});
	});
});
