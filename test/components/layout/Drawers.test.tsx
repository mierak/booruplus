import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { actions } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../helpers/store.helper';

import Drawers from '../../../src/components/layout/Drawers';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('layout/Drawers', () => {
	it('Renders Downloads drawer', () => {
		// given
		const store = mockStore(
			mState({
				system: {
					isTasksDrawerVisible: true,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<Drawers />
			</Provider>
		);

		// then
		expect(screen.getByText('Downloads')).not.toBeNull();
	});
	it('Closes Tasks Drawer when drawer Close button is clicked', () => {
		// given
		const store = mockStore(
			mState({
				system: {
					isTasksDrawerVisible: true,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<Drawers />
			</Provider>
		);
		fireEvent.click(screen.getAllByRole('button', { name: 'Close' })[0]);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.system.setTasksDrawerVisible.type,
			payload: false,
		});
	});
});
