import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { actions } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../helpers/store.helper';

import OrderSelect from '../../../src/components/search-form/OrderSelect';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('search-form/OrderSelect', () => {
	const context = 'ctx';
	it('Renders Asc and Desc checkboxes', () => {
		// given
		const store = mockStore(
			mState({
				onlineSearchForm: {
					[context]: {},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<OrderSelect context={context} />
			</Provider>
		);

		// then
		expect(screen.getByRole('radio', { name: 'Asc' })).not.toBeNull();
		expect(screen.getByRole('radio', { name: 'Desc' })).not.toBeNull();
	});
	it('Dispatches setSortOrder for online mode', () => {
		// given
		const store = mockStore(
			mState({
				onlineSearchForm: {
					[context]: {},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<OrderSelect context={context} />
			</Provider>
		);
		fireEvent.click(screen.getByRole('radio', { name: 'Asc' }));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.onlineSearchForm.updateContext.type,
			payload: { context, data: { sortOrder: 'asc' } },
		});
	});
});
