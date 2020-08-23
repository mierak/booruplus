import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { thunks } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import '@testing-library/jest-dom';
import { mState } from '../../helpers/store.helper';

import General from '../../../src/components/settings/General';
import { IpcChannels } from '../../../src/types/processDto';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('settings/General', () => {
	it('Render correctly', () => {
		// given
		const store = mockStore(
			mState({
				settings: {
					imagesFolderPath: 'path/to/images',
					theme: 'dark',
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<General />
			</Provider>
		);

		// then
		expect(screen.getByDisplayValue(store.getState().settings.imagesFolderPath)).not.toBeNull();
		expect(screen.getByText('Dark')).not.toBeNull();
		expect(screen.getByRole('button', { name: 'folder Select' })).not.toBeNull();
		expect(screen.getByRole('button', { name: 'folder-open Open' })).not.toBeNull();
	});
	it('Dispatches updateTheme() and then calls IPC for reload', async () => {
		// given
		const store = mockStore(
			mState({
				settings: {
					imagesFolderPath: 'path/to/images',
					theme: 'dark',
				},
			})
		);
		const ipcSendSpy = jest.fn();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(global as any).api = {
			send: ipcSendSpy,
		};

		// when
		render(
			<Provider store={store}>
				<General />
			</Provider>
		);
		fireEvent.mouseDown(screen.getByText('Dark'));
		fireEvent.click(screen.getByText('Light'));

		// then
		const dispatchedActions = store.getActions();
		await waitFor(() =>
			expect(dispatchedActions).toContainMatchingAction({ type: thunks.settings.updateTheme.fulfilled.type, payload: 'light' })
		);
		expect(ipcSendSpy).toBeCalledWith(IpcChannels.THEME_CHANGED);
	});
	it('Dispatches importDatabase() when Import button is pressed', async () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<General />
			</Provider>
		);
		fireEvent.click(screen.getByText('Import'));

		// then
		const dispatchedActions = store.getActions();
		await waitFor(() => expect(dispatchedActions).toContainMatchingAction({ type: thunks.settings.importDatabase.pending.type }));
	});
	it('Dispatches exportDatabase() when Export button is pressed', async () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<General />
			</Provider>
		);
		fireEvent.click(screen.getByText('Export'));

		// then
		const dispatchedActions = store.getActions();
		await waitFor(() => expect(dispatchedActions).toContainMatchingAction({ type: thunks.settings.exportDatabase.pending.type }));
	});
	it('Sends open select folder dialog message to IPC and then dispatches updateImagePath()', async () => {
		// given
		const newPath = 'new/path/-to/images';
		const store = mockStore(
			mState({
				settings: {
					imagesFolderPath: 'path/to/images',
					theme: 'dark',
				},
			})
		);
		const ipcSendSpy = jest.fn().mockResolvedValue({
			filePaths: [newPath],
			canceled: false,
		});
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(global as any).api = {
			invoke: ipcSendSpy,
		};

		// when
		render(
			<Provider store={store}>
				<General />
			</Provider>
		);
		fireEvent.click(screen.getByRole('button', { name: 'folder Select' }));

		// then
		const dispatchedActions = store.getActions();
		expect(ipcSendSpy).toBeCalledWith(IpcChannels.OPEN_SELECT_IMAGES_FOLDER_DIALOG);
		await waitFor(() =>
			expect(dispatchedActions).toContainMatchingAction({ type: thunks.settings.updateImagePath.fulfilled.type, payload: newPath })
		);
	});
	it('Sends open select folder dialog message to IPC and does not dispatch anything when it is canceled', async () => {
		// given
		const newPath = 'new/path/-to/images';
		const store = mockStore(
			mState({
				settings: {
					imagesFolderPath: 'path/to/images',
					theme: 'dark',
				},
			})
		);
		const ipcSendSpy = jest.fn().mockResolvedValue({
			filePaths: [newPath],
			canceled: true,
		});
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(global as any).api = {
			invoke: ipcSendSpy,
		};

		// when
		render(
			<Provider store={store}>
				<General />
			</Provider>
		);
		fireEvent.click(screen.getByRole('button', { name: 'folder Select' }));

		// then
		const dispatchedActions = store.getActions();
		await waitFor(() => expect(ipcSendSpy).toBeCalledWith(IpcChannels.OPEN_SELECT_IMAGES_FOLDER_DIALOG));
		await waitFor(() =>
			expect(dispatchedActions).not.toContainMatchingAction({ type: thunks.settings.updateImagePath.fulfilled.type, payload: newPath })
		);
	});
	it('Sends open open path dialog message to IPC with correct parameter', async () => {
		// given
		const store = mockStore(
			mState({
				settings: {
					imagesFolderPath: 'path/to/images',
					theme: 'dark',
				},
			})
		);
		const ipcSendSpy = jest.fn();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(global as any).api = {
			send: ipcSendSpy,
		};

		// when
		render(
			<Provider store={store}>
				<General />
			</Provider>
		);
		fireEvent.click(screen.getByRole('button', { name: 'folder-open Open' }));

		// then
		expect(ipcSendSpy).toBeCalledWith(IpcChannels.OPEN_PATH, store.getState().settings.imagesFolderPath);
	});
});
