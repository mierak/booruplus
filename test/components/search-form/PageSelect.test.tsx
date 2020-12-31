import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { actions } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../helpers/store.helper';

import PageSelect from '../../../src/components/search-form/PageSelect';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('search-form/PostCountSelect', () => {
	const context = 'ctx';
	it('Renders correctly', () => {
		// given
		const store = mockStore(
			mState({
				searchContexts: {
					[context]: {
						page: 11,
					},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<PageSelect context={context} />
			</Provider>
		);

		// then
		expect(screen.getByDisplayValue('11')).not.toBeNull();
	});
	it('Changes value on spinner button press', async () => {
		// given
		const store = mockStore(
			mState({
				searchContexts: {
					[context]: {
						page: 11,
					},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<PageSelect context={context} />
			</Provider>
		);
		fireEvent.mouseDown(screen.getByRole('button', { name: 'Increase Value' }));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.searchContexts.updateContext.type,
			payload: { context, data: { page: 12 } },
		});
	});
});
