import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { actions } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import '@testing-library/jest-dom';
import { mState } from '../../helpers/store.helper';

import Gelbooru from '../../../src/components/settings/Gelbooru';
import * as utils from '../../../src/util/utils';
import { OPTIONS_URL } from 'service/webService';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('settings/Dashboard', () => {
	it('Renders correctly', () => {
		// given
		const store = mockStore(
			mState({
				settings: {
					apiKey: '&api_key=bfa4dc4a96d3ckb2hccf39be27fg9s74409cf50a9529696g85e7b18106as1fa0&user_id=120',
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<Gelbooru />
			</Provider>
		);

		// then
		expect(screen.getByDisplayValue(store.getState().settings.apiKey ?? 'test')).not.toBeNull();
	});
	it('Validates correct api key', () => {
		// given
		const apiKey = '&api_key=bfa4dc4a96d3ckb2hccf39be27fg9s74409cf50a9529696g85e7b18106as1fa0&user_id=120';
		const store = mockStore(
			mState({
				settings: {
					apiKey: '',
				},
			})
		);
		const validateSpy = jest.spyOn(utils, 'validateApiKey');

		// when
		render(
			<Provider store={store}>
				<Gelbooru />
			</Provider>
		);
		fireEvent.change(screen.getByRole('textbox'), {
			target: { value: apiKey },
		});

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: actions.settings.setApiKey.type, payload: apiKey });
		expect(screen.getByRole('img', { name: 'check-circle' })).not.toBeNull();
		expect(validateSpy).toBeCalledWith(apiKey);
	});
	it('Validates incorrect api key', () => {
		// given
		const apiKey = '&api_key=bfa4dc4a96d3ckb2hccf39be274409cf50a9529696g85e7b18106as1fa0&user_id=120';
		const store = mockStore(
			mState({
				settings: {
					apiKey: '',
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<Gelbooru />
			</Provider>
		);
		fireEvent.change(screen.getByRole('textbox'), {
			target: { value: apiKey },
		});

		// then
		const dispatchedActions = store.getActions();
		expect(screen.getByRole('img', { name: 'close-circle' })).not.toBeNull();
		expect(dispatchedActions).toHaveLength(0);
	});
	it('Sends open in browser message to IPC when Options link is clicked', () => {
		// given
		const store = mockStore(mState());
		const ipcSendSpy = jest.fn();
		(global as any).api = {
			send: ipcSendSpy,
		};

		// when
		render(
			<Provider store={store}>
				<Gelbooru />
			</Provider>
		);
		fireEvent.click(screen.getByText('Options'));

		// then
		expect(ipcSendSpy).toBeCalledWith('open-in-browser', OPTIONS_URL);
	});
});
