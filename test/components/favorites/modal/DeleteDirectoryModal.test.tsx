import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { thunks, actions } from '../../../../src/store';
import { RootState, AppDispatch } from '../../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../../helpers/store.helper';

import * as componentTypes from '../../../../src/types/components';
import DeleteDirectoryModal from '../../../../src/components/favorites/modal/DeleteDirectoryModal';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('favorites/modal/DeleteDirectoryModal', () => {
	it('Renders correctly', () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<DeleteDirectoryModal />
			</Provider>
		);
		const title = screen.getByText('Delete Directory');
		const buttons = screen.getAllByRole('button');

		// then
		expect(title).not.toBeNull();
		expect(buttons).toHaveLength(3);
		expect(buttons[1].textContent).toBe('Delete');
		expect(buttons[2].textContent).toBe('Close');
	});
	it('Closes modal when Close button is pressed', () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<DeleteDirectoryModal />
			</Provider>
		);
		fireEvent.click(screen.getByText('Close'));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions[0]).toMatchObject({ type: actions.modals.setVisible.type, payload: false });
	});
	it('Closes modal and dispatches addSubFolder when Add button is pressed', () => {
		// given
		const store = mockStore(
			mState({
				favorites: {
					selectedNodeKey: 123,
				},
			})
		);
		const notificationSpy = jest.spyOn(componentTypes, 'openNotificationWithIcon').mockImplementation();

		// when
		render(
			<Provider store={store}>
				<DeleteDirectoryModal />
			</Provider>
		);
		fireEvent.click(screen.getByText('Delete'));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions[0]).toMatchObject({
			type: thunks.favorites.deleteDirectoryAndChildren.pending.type,
			meta: { arg: 123 },
		});
		waitFor(() => expect(dispatchedActions[1]).toMatchObject({ type: actions.modals.setVisible.type, payload: false }));
		waitFor(() => expect(notificationSpy).toHaveBeenCalledWith('success', expect.anything(), expect.anything()));
	});
	it('Shows error notification when Delete button is pressed but no node is selected', () => {
		// given
		const store = mockStore(
			mState({
				favorites: {
					selectedNodeKey: undefined,
				},
			})
		);
		const notificationSpy = jest.spyOn(componentTypes, 'openNotificationWithIcon').mockImplementation();

		// when
		render(
			<Provider store={store}>
				<DeleteDirectoryModal />
			</Provider>
		);
		fireEvent.click(screen.getByText('Delete'));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions[0]).toMatchObject({ type: actions.modals.setVisible.type, payload: false });
		waitFor(() => expect(notificationSpy).toHaveBeenCalledWith('error', expect.anything(), expect.anything()));
	});
	it('Shows error notification when trying to delete default directory', () => {
		// given
		const store = mockStore(
			mState({
				favorites: {
					selectedNodeKey: 1,
				},
			})
		);
		const notificationSpy = jest.spyOn(componentTypes, 'openNotificationWithIcon').mockImplementation();

		// when
		render(
			<Provider store={store}>
				<DeleteDirectoryModal />
			</Provider>
		);
		fireEvent.click(screen.getByText('Delete'));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions[0]).toMatchObject({ type: actions.modals.setVisible.type, payload: false });
		waitFor(() =>
			expect(notificationSpy).toHaveBeenCalledWith(
				'error',
				'Failed to delete folder',
				'The default folder cannot be deleted! You can rename it if you want.'
			)
		);
	});
});
