import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { thunks, actions } from '../../../../src/store';
import { RootState, AppDispatch } from '../../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../../helpers/store.helper';

import MovePostsToFavoritesDirectoryModal from '../../../../src/components/favorites/modal/MovePostsToFavoritesDirectoryModal';
import { mTreeNode } from '../../../helpers/test.helper';
import * as componentTypes from '../../../../src/types/components';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('favorites/modal/MoveDirectoryModal', () => {
	const rootNode = mTreeNode({
		title: 'node1',
		key: '0',
		children: [
			mTreeNode({
				title: 'node11',
				key: '11',
				children: [
					mTreeNode({
						title: 'node111',
						key: '111',
					}),
				],
			}),
			mTreeNode({
				title: 'node12',
				key: 'node12',
			}),
		],
	});
	const expandedKeys = ['0', '11', '111', '12'];
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('Renders correctly', async () => {
		// given
		const store = mockStore(
			mState({
				favorites: {
					rootNode,
					expandedKeys,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<MovePostsToFavoritesDirectoryModal treeData={rootNode.children} expandedKeys={expandedKeys} postIdsToMove={[]} />
			</Provider>
		);

		// then
		const closeButton = screen.getByRole('button', { name: 'Close' });
		const addButton = screen.getByRole('button', { name: 'Move' });
		const cancelButton = screen.getByRole('button', { name: 'Cancel' });
		expect(screen.getByText('Select directory to move post to.')).not.toBeNull();
		expect(closeButton).not.toBeNull();
		expect(addButton).not.toBeNull();
		expect(cancelButton).not.toBeNull();
		expect(screen.queryByText('node1')).toBeNull();
		expect(screen.getByText('node11')).not.toBeNull();
		await waitFor(() => undefined, { timeout: 0 });
	});
	it('Closes modal when Cancel button is pressed', async () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<MovePostsToFavoritesDirectoryModal treeData={rootNode.children} expandedKeys={expandedKeys} postIdsToMove={[]} />
			</Provider>
		);
		fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toHaveLength(1);
		expect(dispatchedActions[0]).toMatchObject({ type: actions.modals.setVisible.type, payload: false });
		await waitFor(() => undefined);
	});
	it('Dispatches addPostsToDirectory() when node is selected and Add button clicked', async () => {
		const postIdsToFavorite = [1, 2, 3, 4, 5];
		const selectedNodeKey = 11;
		const store = mockStore(mState());
		const notificationSpy = jest.spyOn(componentTypes, 'openNotificationWithIcon').mockImplementation();

		// when
		render(
			<Provider store={store}>
				<MovePostsToFavoritesDirectoryModal
					treeData={rootNode.children}
					expandedKeys={expandedKeys}
					postIdsToMove={postIdsToFavorite}
				/>
			</Provider>
		);
		fireEvent.click(screen.getByText('node11'));
		fireEvent.click(screen.getByRole('button', { name: 'Move' }));

		// then
		await waitFor(() => store.getActions().length === 6);
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: thunks.favorites.removePostsFromActiveDirectory.pending.type,
			meta: { arg: postIdsToFavorite },
		});
		expect(dispatchedActions).toContainMatchingAction({
			type: thunks.favorites.addPostsToDirectory.pending.type,
			meta: { arg: { ids: postIdsToFavorite, key: selectedNodeKey } },
		});
		expect(dispatchedActions).toContainMatchingAction({ type: thunks.favorites.fetchPostsInDirectory.pending.type });
		expect(dispatchedActions).toContainMatchingAction({ type: actions.modals.setVisible.type, payload: false });
		await waitFor(() => expect(notificationSpy).toHaveBeenCalledWith('success', 'Success', expect.anything()));
	});
	it('Shows error notification when Add button is pressed but no posts to favorite are defined in state', async () => {
		// given
		const store = mockStore(
			mState({
				favorites: {
					rootNode,
					expandedKeys,
				},
				modals: {
					addToFavoritesModal: {
						postIdsToFavorite: [],
					},
				},
			})
		);
		const notificationSpy = jest.spyOn(componentTypes, 'openNotificationWithIcon').mockImplementation();

		// when
		render(
			<Provider store={store}>
				<MovePostsToFavoritesDirectoryModal treeData={rootNode.children} expandedKeys={expandedKeys} postIdsToMove={[]} />
			</Provider>
		);
		fireEvent.click(screen.getByText('node11'));
		fireEvent.click(screen.getByRole('button', { name: 'Move' }));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: actions.modals.setVisible.type, payload: false });
		await waitFor(() =>
			expect(notificationSpy).toHaveBeenCalledWith(
				'error',
				'Failed to add post to directory',
				'Could not add post to directory because no post id was supplied.',
				5
			)
		);
	});
	it('When no node is selected it dispatches with default node key', async () => {
		const postIdsToFavorite = [1, 2, 3, 4, 5];
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<MovePostsToFavoritesDirectoryModal
					treeData={rootNode.children}
					expandedKeys={expandedKeys}
					postIdsToMove={postIdsToFavorite}
				/>
			</Provider>
		);
		fireEvent.click(screen.getByRole('button', { name: 'Move' }));

		// then
		const dispatchedActions = store.getActions();
		await waitFor(() =>
			expect(dispatchedActions).toContainMatchingAction({
				type: thunks.favorites.addPostsToDirectory.pending.type,
				meta: { arg: { ids: postIdsToFavorite, key: 1 } },
			})
		);
	});
});
