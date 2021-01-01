import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { RootState, AppDispatch } from '../../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../../helpers/store.helper';

import RenameTabModal from '../../../../src/components/layout/modals/RenameTabModal';
import '@testing-library/jest-dom';
import { actions } from '@store/';
import userEvent from '@testing-library/user-event';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('SearchFormModal', () => {
	const context = 'ctx';
	it('Renders correctly', () => {
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
				<RenameTabModal context={context} />
			</Provider>
		);

		// then
		expect(screen.getByText('Enter new tab name')).not.toBeNull();
		expect(screen.getByRole('button', { name: 'Rename' })).not.toBeNull();
		expect(screen.getAllByRole('button', { name: 'Close' })).toHaveLength(2);
	});
	it('Dispatches updateContext on Rename button click', () => {
		// given
		const newName = 'test tab name';
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
				<RenameTabModal context={context} />
			</Provider>
		);
		const input = screen.getByRole('textbox');
		fireEvent.change(input, { target: { value: newName } });
		fireEvent.click(screen.getByText('Rename'));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.searchContexts.updateContext.type,
			payload: {
				context,
				data: { tabName: newName },
			},
		});
		expect(dispatchedActions).toContainMatchingAction({ type: actions.modals.setVisible.type, payload: false });
	});
	it('Dispatches updateContext on enter press', () => {
		// given
		const newName = 'test tab name';
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
				<RenameTabModal context={context} />
			</Provider>
		);
		const input = screen.getByRole('textbox');
		userEvent.type(input, `${newName}{enter}`);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.searchContexts.updateContext.type,
			payload: {
				context,
				data: { tabName: newName },
			},
		});
		expect(dispatchedActions).toContainMatchingAction({ type: actions.modals.setVisible.type, payload: false });
	});
	it('Closes modal', () => {
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
				<RenameTabModal context={context} />
			</Provider>
		);
		userEvent.click(screen.getAllByRole('button', { name: 'Close' })[1]);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: actions.modals.setVisible.type, payload: false });
	});
});
