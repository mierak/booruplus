import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { thunks, actions } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../helpers/store.helper';

import SettingsModal from '../../../src/components/settings/SettingsModal';
import * as utils from '../../../src/util/utils';
import * as componentTypes from '../../../src/types/components';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('settings/SettingsModal', () => {
	beforeEach(() => {
		jest.restoreAllMocks();
	});
	it('Renders correctly on General tab', () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<SettingsModal />
			</Provider>
		);

		// then
		expect(screen.getByText('Settings')).not.toBeNull();
		expect(screen.getByText('General')).not.toBeNull();
		expect(screen.getByText('Dashboard')).not.toBeNull();
		expect(screen.getByText('Gelbooru')).not.toBeNull();
	});
	it('Switches to Dashboard tab', () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<SettingsModal />
			</Provider>
		);
		fireEvent.click(screen.getByText('Dashboard'));

		// then
		expect(screen.getByText('Load on app start')).not.toBeNull();
	});
	it('Switches to Gelbooru tab', () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<SettingsModal />
			</Provider>
		);
		fireEvent.click(screen.getByText('Gelbooru'));

		// then
		expect(screen.getByText('API key')).not.toBeNull();
	});
	it('Switches back to General tab', () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<SettingsModal />
			</Provider>
		);
		fireEvent.click(screen.getByText('Dashboard'));
		fireEvent.click(screen.getByText('General'));

		// then
		expect(screen.getByText('Load on app start')).not.toBeNull();
	});
	it('Reloads settings from DB when Cancel is pressed', () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<SettingsModal />
			</Provider>
		);
		fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: actions.modals.setVisible.type, payload: false });
		expect(dispatchedActions).toContainMatchingAction({ type: thunks.settings.loadSettings.pending.type, meta: { arg: 'user' } });
	});
	it('Validates API key on save and dispatches saveSettings() when it is valid', async () => {
		// given
		const apiKey = '&api_key=bfa4dc4a96d3ckb2hccf39be27fg9s74409cf50a9529696g85e7b18106as1fa0&user_id=120';
		const store = mockStore(
			mState({
				settings: {
					apiKey,
				},
			})
		);
		const validateSpy = jest.spyOn(utils, 'validateApiKey');
		const notificationSpy = jest.spyOn(componentTypes, 'openNotificationWithIcon').mockImplementation();

		// when
		render(
			<Provider store={store}>
				<SettingsModal />
			</Provider>
		);
		fireEvent.click(screen.getByRole('button', { name: 'Save' }));

		// then
		const dispatchedActions = store.getActions();
		await waitFor(() => expect(dispatchedActions).toContainMatchingAction({ type: actions.modals.setVisible.type, payload: false }));
		await waitFor(() => expect(dispatchedActions).toContainMatchingAction({ type: thunks.settings.saveSettings.pending.type }));
		expect(validateSpy).toBeCalledTimes(1);
		expect(notificationSpy).toBeCalledWith('success', 'Settings saved', expect.anything(), expect.anything());
	});
	it('Shows error notification with invalid api key', async () => {
		// given
		const apiKey = '&api_key=bfa4dc4a96d3ckb2hccf39be27fg9s74405e7b18106as1fa0&user_id=120';
		const store = mockStore(
			mState({
				settings: {
					apiKey,
				},
			})
		);
		const validateSpy = jest.spyOn(utils, 'validateApiKey');
		const notificationSpy = jest.spyOn(componentTypes, 'openNotificationWithIcon').mockImplementation();
		const setVisibleSpy = jest.spyOn(actions.modals, 'setVisible').mockImplementation();
		const saveSpy = jest.spyOn(thunks.settings, 'saveSettings').mockImplementation();
		notificationSpy.mockClear();

		// when
		render(
			<Provider store={store}>
				<SettingsModal />
			</Provider>
		);
		fireEvent.click(screen.getByRole('button', { name: 'Save' }));

		// then
		expect(notificationSpy).toBeCalledWith('error', 'Invalid API key', expect.anything(), 5);
		expect(setVisibleSpy).toBeCalledTimes(0);
		expect(saveSpy).toBeCalledTimes(0);
		expect(validateSpy).toBeCalledTimes(1);
	});
});
