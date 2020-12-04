import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { thunks, actions } from '../../../../src/store';
import { RootState, AppDispatch } from '../../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../../helpers/store.helper';

import RenameDirectoryModal from '../../../../src/components/favorites/modal/RenameDirectoryModal';
import * as componentTypes from '../../../../src/types/components';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);
describe('favorites/modal/RenameDirectoryModal', () => {
	it('Renders correctly', () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<RenameDirectoryModal targetDirectoryKey={123} />
			</Provider>
		);

		// then
		expect(screen.getByText('Input new category name')).not.toBeNull();
	});
	it('Closes modal when Close button is pressed', () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<RenameDirectoryModal targetDirectoryKey={123} />
			</Provider>
		);
		fireEvent.click(screen.getByText('Close'));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions[0]).toMatchObject({ type: actions.modals.setVisible.type, payload: false });
	});
	it('Closes modal and dispatches addSubFolder when Add button is pressed', async () => {
		// given
		const store = mockStore(mState());
		const notificationSpy = jest.spyOn(componentTypes, 'openNotificationWithIcon').mockImplementation();

		// when
		render(
			<Provider store={store}>
				<RenameDirectoryModal targetDirectoryKey={123} />
			</Provider>
		);
		fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test folder name' } });
		fireEvent.click(screen.getByText('Rename'));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions[0]).toMatchObject({
			type: thunks.favorites.renameDirectory.pending.type,
			meta: { arg: { key: 123, title: 'test folder name' } },
		});
		await waitFor(() =>
			expect(dispatchedActions).toContainMatchingAction({ type: actions.modals.setVisible.type, payload: false })
		);
		await waitFor(() => expect(notificationSpy).toHaveBeenCalledWith('success', expect.anything(), expect.anything()));
	});
	it('Validates new directory name as invalid when input is empty', async () => {
		// given
		const store = mockStore(mState());
		const notificationSpy = jest.spyOn(componentTypes, 'openNotificationWithIcon').mockImplementation();

		// when
		render(
			<Provider store={store}>
				<RenameDirectoryModal targetDirectoryKey={123} />
			</Provider>
		);
		fireEvent.change(screen.getByRole('textbox'), { target: { value: '' } });
		fireEvent.click(screen.getByText('Rename'));

		// then
		await waitFor(() =>
			expect(notificationSpy).toHaveBeenCalledWith('error', 'Directory name cannot be empty', expect.anything())
		);
	});
	it('Dispatches renameDirectory() when input is focused and enter pressed', () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<RenameDirectoryModal targetDirectoryKey={123} />
			</Provider>
		);
		const input = screen.getByRole('textbox');
		fireEvent.change(input, { target: { value: 'test folder name' } });
		fireEvent.focus(input);
		fireEvent.keyPress(input, {
			key: 'Enter',
		});
		fireEvent.click(screen.getByText('Rename'));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions[0]).toMatchObject({
			type: thunks.favorites.renameDirectory.pending.type,
			meta: { arg: { key: 123, title: 'test folder name' } },
		});
	});
	it('Validates correct input', () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<RenameDirectoryModal targetDirectoryKey={123} />
			</Provider>
		);
		const input = screen.getByRole('textbox');
		fireEvent.change(input, { target: { value: 'test folder name' } });
		const icon = screen.getAllByRole('img', {
			name: 'check-circle',
		});

		// then
		expect(icon).not.toBeNull();
	});
	it('Validates incorrect input', () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<RenameDirectoryModal targetDirectoryKey={123} />
			</Provider>
		);
		const input = screen.getByRole('textbox');
		fireEvent.change(input, { target: { value: 'asdf' } });
		fireEvent.change(input, { target: { value: '' } });
		const icon = screen.getAllByRole('img', {
			name: 'close-circle',
		});

		// then
		expect(icon).not.toBeNull();
	});
});
