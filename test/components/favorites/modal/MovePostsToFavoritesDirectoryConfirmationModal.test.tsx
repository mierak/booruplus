import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { thunks, actions } from '../../../../src/store';
import { RootState, AppDispatch } from '../../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../../helpers/store.helper';
import { mPost } from '../../../helpers/test.helper';

import MovePostsToSuppliedFavoritesDirectoryModal from '../../../../src/components/favorites/modal/MovePostsToSuppliedFavoritesDirectoryModal';
import * as componentTypes from '../../../../src/types/components';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('favorites/modal/MovePostsToFavoritesDirectory', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});
	it('Renders correctly', () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<MovePostsToSuppliedFavoritesDirectoryModal postsToMove={[]} targetDirectoryKey={1} />
			</Provider>
		);

		// then
		expect(screen.getByText('Move selected posts?')).not.toBeNull();
		expect(screen.getByRole('button', { name: 'Move' })).not.toBeNull();
		expect(screen.getAllByRole('button', { name: 'Close' })).toHaveLength(2);
	});
	it('Closes modal when Close button is pressed', () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<MovePostsToSuppliedFavoritesDirectoryModal postsToMove={[]} targetDirectoryKey={1} />
			</Provider>
		);
		fireEvent.click(screen.getByText('Close'));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions[0]).toMatchObject({ type: actions.modals.setVisible.type, payload: false });
	});
	it('Closes modal and dispatches correct actions when Move button is pressed', async () => {
		// given
		const postsToMove = [mPost({ id: 1 }), mPost({ id: 3 }), mPost({ id: 5 }), mPost({ id: 7 }), mPost({ id: 9 })];
		const selectedKey = 123456;
		const store = mockStore(mState());
		const notificationSpy = jest.spyOn(componentTypes, 'openNotificationWithIcon').mockImplementation();

		// when
		render(
			<Provider store={store}>
				<MovePostsToSuppliedFavoritesDirectoryModal postsToMove={postsToMove} targetDirectoryKey={selectedKey} />
			</Provider>
		);
		fireEvent.click(screen.getByText('Move'));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: thunks.favorites.removePostsFromActiveDirectory.pending.type,
			meta: { arg: postsToMove },
		});
		await waitFor(() =>
			expect(dispatchedActions).toContainMatchingAction({
				type: thunks.favorites.addPostsToDirectory.pending.type,
				meta: { arg: { posts: postsToMove, key: selectedKey } },
			})
		);
		await waitFor(() =>
			expect(dispatchedActions).toContainMatchingAction({ type: thunks.favorites.fetchPostsInDirectory.pending.type })
		);
		await waitFor(() => expect(dispatchedActions).toContainMatchingAction({ type: actions.modals.setVisible.type }));
		await waitFor(() =>
			expect(notificationSpy).toHaveBeenCalledWith('success', 'Success', 'Successfuly moved post to folder')
		);
	});
	it('Shows error notification when confirm is pressed and no posts are selected', () => {
		// given
		const store = mockStore(mState());
		const notificationSpy = jest.spyOn(componentTypes, 'openNotificationWithIcon').mockImplementation();

		// when
		render(
			<Provider store={store}>
				<MovePostsToSuppliedFavoritesDirectoryModal postsToMove={[]} targetDirectoryKey={1} />
			</Provider>
		);
		fireEvent.click(screen.getByText('Move'));

		// then
		expect(notificationSpy).toHaveBeenCalledWith(
			'error',
			'Failed to add post to directory',
			'Could not add post to directory because no post id was supplied.',
			5
		);
	});
});
