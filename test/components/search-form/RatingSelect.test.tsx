import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { actions } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../helpers/store.helper';

import RatingSelect from '../../../src/components/search-form/RatingSelect';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('search-form/RatingSelect', () => {
	const context = 'ctx';
	it('Renders correctly', async () => {
		// given
		const store = mockStore(
			mState({
				searchContexts: {
					[context]: {},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<RatingSelect context={context} />
			</Provider>
		);

		// then
		expect(screen.getByText('Any')).not.toBeNull();
	});
	it('Renders all Ratings when select box is opened', async () => {
		// given
		const store = mockStore(
			mState({
				searchContexts: {
					[context]: {},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<RatingSelect context={context} open />
			</Provider>
		);

		// then
		const anyOption = screen.getAllByText('Any');
		expect(anyOption[1]).not.toBeNull();
		expect(anyOption).toHaveLength(2);
		expect(screen.getByText('Safe')).not.toBeNull();
		expect(screen.getByText('Questionable')).not.toBeNull();
		expect(screen.getByText('Explicit')).not.toBeNull();
		await waitFor(() => undefined);
	});
	it('Dispatches setRating() for onlineSearchForm', async () => {
		// given
		const store = mockStore(
			mState({
				searchContexts: {
					[context]: {},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<RatingSelect context={context} open />
			</Provider>
		);
		fireEvent.click(screen.getByText('Explicit'));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.searchContexts.updateContext.type,
			payload: { context, data: { rating: 'explicit' } },
		});
		await waitFor(() => undefined);
	});
});
