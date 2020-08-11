import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../helpers/store.helper';

import Tasks from '../../../src/pages/Tasks';
import '@testing-library/jest-dom';
import { mTask } from '../../helpers/test.helper';
import { thunks } from '../../../src/store/';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('pages/Tasks', () => {
	it('Renders correctly', () => {
		// given
		const store = mockStore(
			mState({
				tasks: {
					lastId: 3,
					tasks: {
						1: mTask({ id: 1, items: 10, itemsDone: 10, state: 'completed' }),
						2: mTask({ id: 2, items: 20, itemsDone: 6, state: 'canceled' }),
						3: mTask({ id: 3, items: 30, itemsDone: 9, state: 'preparing' }),
					},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<Tasks />
			</Provider>
		);

		// then
		expect(screen.getByText('Completed')).not.toBeNull();
		expect(screen.getByText('Canceled')).not.toBeNull();
		expect(screen.getByText('Preparing to download')).not.toBeNull();
	});
	it('Dispatches removeTask on close button click', () => {
		// given
		const store = mockStore(
			mState({
				tasks: {
					lastId: 3,
					tasks: {
						1: mTask({ id: 1, items: 10, itemsDone: 10, state: 'completed' }),
						2: mTask({ id: 2, items: 20, itemsDone: 6, state: 'canceled' }),
						3: mTask({ id: 3, items: 30, itemsDone: 9, state: 'preparing' }),
					},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<Tasks />
			</Provider>
		);
		fireEvent.click(screen.getAllByRole('button', { name: 'close' })[1]);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: thunks.tasks.removeTask.pending.type, meta: { arg: '2' } });
	});
});
