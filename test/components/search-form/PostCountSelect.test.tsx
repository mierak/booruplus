import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { actions } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../helpers/store.helper';

import PostCountSelect from '../../../src/components/search-form/PostCountSelect';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('search-form/PostCountSelect', () => {
	it('Renders correctly for online mode', () => {
		// given
		const store = mockStore(
			mState({
				onlineSearchForm: {
					limit: 50,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<PostCountSelect mode="online" />
			</Provider>
		);

		// then
		expect(screen.getByDisplayValue('50')).not.toBeNull();
	});
	it('Renders correctly for offline mode', () => {
		// given
		const store = mockStore(
			mState({
				downloadedSearchForm: {
					postLimit: 50,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<PostCountSelect mode="offline" />
			</Provider>
		);

		// then
		expect(screen.getByDisplayValue('50')).not.toBeNull();
	});
	it('Changes value on spinner button press for online mode', async () => {
		// given
		const store = mockStore(
			mState({
				onlineSearchForm: {
					limit: 50,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<PostCountSelect mode="online" />
			</Provider>
		);
		fireEvent.mouseDown(screen.getByRole('button', { name: 'Increase Value' }));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: actions.onlineSearchForm.setLimit.type, payload: 51 });
	});
	it('Changes value on spinner button press for offline mode', async () => {
		// given
		const store = mockStore(
			mState({
				downloadedSearchForm: {
					postLimit: 50,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<PostCountSelect mode="offline" />
			</Provider>
		);
		fireEvent.mouseDown(screen.getByRole('button', { name: 'Increase Value' }));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: actions.downloadedSearchForm.setPostLimit.type, payload: 51 });
	});
});
