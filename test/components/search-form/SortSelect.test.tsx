import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { actions } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../helpers/store.helper';

import SortSelect from '../../../src/components/search-form/SortSelect';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('search-form/SortSelect', () => {
	const context = 'ctx';
	it('Renders correctly', () => {
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
				<SortSelect context={context} />
			</Provider>
		);

		// then
		expect(screen.getByText('Date Uploaded')).not.toBeNull();
	});
	it('Renders all options when select box is opened', async () => {
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
				<SortSelect context={context} open />
			</Provider>
		);

		// then
		const anyOption = screen.getAllByText('Date Uploaded');
		expect(anyOption[1]).not.toBeNull();
		expect(anyOption).toHaveLength(2);
		expect(screen.getByText('Date Updated')).not.toBeNull();
		expect(screen.getByText('Rating')).not.toBeNull();
		await waitFor(() => undefined);
	});
	it('Dispatches setSort()', async () => {
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
				<SortSelect context={context} open />
			</Provider>
		);
		fireEvent.click(screen.getByText('Rating'));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.onlineSearchForm.updateContext.type,
			payload: { context, data: { sort: 'rating' } },
		});
		await waitFor(() => undefined);
	});
});
