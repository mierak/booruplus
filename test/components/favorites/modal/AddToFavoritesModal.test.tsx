import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { thunks, actions } from '../../../../src/store';
import { RootState, AppDispatch } from '../../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../../helpers/store.helper';

import AddToFavoritesModal from '../../../../src/components/favorites/modal/AddToFavoritesModal';
import { mPost, mTreeNode } from '../../../helpers/test.helper';
import * as componentTypes from '../../../../src/types/components';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('favorites/modal/AddToFavoritesModal', () => {
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
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<AddToFavoritesModal data={{ postsToFavorite: [] }} expandedKeys={expandedKeys} treeData={rootNode.children} />
			</Provider>
		);

		// then
		const closeButton = screen.getAllByRole('button', { name: 'Close' })[0];
		const addButton = screen.getByRole('button', { name: 'Add' });
		const cancelButton = screen.getAllByRole('button', { name: 'Close' })[1];
		expect(screen.getByText('Select directory to save favorite post to.')).not.toBeNull();
		expect(closeButton).not.toBeNull();
		expect(addButton).not.toBeNull();
		expect(cancelButton).not.toBeNull();
		expect(screen.queryByText('node1')).toBeNull();
		expect(screen.getByText('node11')).not.toBeNull();
		expect(screen.getByText('node111')).not.toBeNull();
		expect(screen.getByText('node12')).not.toBeNull();
		await waitFor(() => undefined, { timeout: 0 });
	});
	it('Closes modal when Close button is pressed', async () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<AddToFavoritesModal data={{ postsToFavorite: [] }} expandedKeys={expandedKeys} treeData={rootNode.children} />
			</Provider>
		);
		fireEvent.click(screen.getAllByRole('button', { name: 'Close' })[1]);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions[0]).toMatchObject({ type: actions.modals.setVisible.type, payload: false });
		await waitFor(() => undefined);
	});
	it('Dispatches addPostsToDirectory() when node is selected and Add button clicked', async () => {
		const postsToFavorite = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 }), mPost({ id: 4 }), mPost({ id: 5 })];
		const selectedNodeKey = 11;
		const store = mockStore(mState());
		const notificationSpy = jest.spyOn(componentTypes, 'openNotificationWithIcon').mockImplementation();

		// when
		render(
			<Provider store={store}>
				<AddToFavoritesModal data={{ postsToFavorite }} expandedKeys={expandedKeys} treeData={rootNode.children} />
			</Provider>
		);
		fireEvent.click(screen.getByText('node11'));
		fireEvent.click(screen.getByRole('button', { name: 'Add' }));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions[0]).toMatchObject({
			type: thunks.favorites.addPostsToDirectory.pending.type,
			meta: { arg: { posts: postsToFavorite, key: selectedNodeKey.toString() } },
		});
		await waitFor(() => expect(notificationSpy).toHaveBeenCalledWith('success', 'Success', expect.anything()));
		await waitFor(() =>
			expect(dispatchedActions).toContainMatchingAction({ type: thunks.favorites.fetchTreeData.fulfilled.type })
		);
	});
	it('Shows error notification when Add button is pressed but no posts to favorite are defined in state', async () => {
		// given
		const store = mockStore(mState());
		const notificationSpy = jest.spyOn(componentTypes, 'openNotificationWithIcon').mockImplementation();

		// when
		render(
			<Provider store={store}>
				<AddToFavoritesModal data={{ postsToFavorite: [] }} expandedKeys={expandedKeys} treeData={rootNode.children} />
			</Provider>
		);
		fireEvent.click(screen.getByText('node11'));
		fireEvent.click(screen.getByRole('button', { name: 'Add' }));

		// then
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
		const postsToFavorite = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 }), mPost({ id: 4 }), mPost({ id: 5 })];
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<AddToFavoritesModal data={{ postsToFavorite }} expandedKeys={expandedKeys} treeData={rootNode.children} />
			</Provider>
		);
		fireEvent.click(screen.getByRole('button', { name: 'Add' }));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions[0]).toMatchObject({
			type: thunks.favorites.addPostsToDirectory.pending.type,
			meta: { arg: { posts: postsToFavorite, key: 1 } },
		});
		await waitFor(() =>
			expect(dispatchedActions).toContainMatchingAction({ type: thunks.favorites.fetchTreeData.fulfilled.type })
		);
	});
	it('Works with context data', async () => {
		// given
		const postsToMove = [mPost({ id: 1 }), mPost({ id: 3 }), mPost({ id: 5 }), mPost({ id: 7 }), mPost({ id: 9 })];
		const store = mockStore(
			mState({
				posts: {
					posts: {
						favorites: postsToMove,
					},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<AddToFavoritesModal
					data={{ context: 'favorites', type: 'all' }}
					expandedKeys={expandedKeys}
					treeData={rootNode.children}
				/>
			</Provider>
		);
		fireEvent.click(screen.getByRole('button', { name: 'Add' }));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions[0]).toMatchObject({
			type: thunks.favorites.addPostsToDirectory.pending.type,
			meta: { arg: { posts: postsToMove, key: 1 } },
		});
		await waitFor(() =>
			expect(dispatchedActions).toContainMatchingAction({ type: thunks.favorites.fetchTreeData.fulfilled.type })
		);
	});
});
