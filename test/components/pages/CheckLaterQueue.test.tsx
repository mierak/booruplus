import { doDatabaseMock } from '../../helpers/database.mock';
doDatabaseMock();
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { thunks, actions } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../helpers/store.helper';

import CheckLaterQueue from '../../../src/pages/CheckLaterQueue';
import '@testing-library/jest-dom';
import { mPost } from '../../helpers/test.helper';
import { deleteImageMock, thumbnailLoaderMock } from '../../helpers/imageBus.mock';
import * as utils from '../../../src/types/components';
import { ActiveModal } from '@appTypes/modalTypes';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('pages/CheckLaterQueue', () => {
	const testUrl = '123testurl.jpg';
	beforeEach(() => {
		jest.clearAllMocks();
		thumbnailLoaderMock.mockResolvedValue(testUrl);
	});
	it('Renders correctly', () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<CheckLaterQueue />
			</Provider>
		);

		// then
		expect(screen.getByText('No Posts To Show')).not.toBeNull();
		expect(screen.getByRole('menuitem', { name: 'download Download' })).not.toBeNull();
		expect(screen.getByRole('menuitem', { name: 'heart Add to Favorites' })).not.toBeNull();
		expect(screen.getByRole('menuitem', { name: 'delete Blacklist' })).not.toBeNull();
		expect(screen.getByRole('menuitem', { name: 'close Clear' })).not.toBeNull();
	});
	it('Renders posts with correct actions', async () => {
		// given
		const posts = [
			mPost({ id: 1, directory: 'dir1', hash: 'hash1' }),
			mPost({ id: 2, directory: 'dir2', hash: 'hash2' }),
			mPost({ id: 3, directory: 'dir3', hash: 'hash3' }),
			mPost({ id: 4, directory: 'dir4', hash: 'hash4', downloaded: 1 }),
			mPost({ id: 5, directory: 'dir5', hash: 'hash5', downloaded: 1 }),
		];
		const store = mockStore(
			mState({
				posts: {
					posts: { checkLaterQueue: posts },
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<CheckLaterQueue />
			</Provider>
		);

		// then
		expect(screen.getAllByRole('img', { name: 'heart' })).toHaveLength(6);
		expect(screen.getAllByRole('img', { name: 'download' })).toHaveLength(4);
		expect(screen.getAllByRole('img', { name: 'delete' })).toHaveLength(6);
		expect(screen.queryAllByRole('img', { name: 'plus' })).toHaveLength(0);
	});
	it('Dispatches movePosts() for correct post when remove button is pressed', async () => {
		// given
		const posts = [
			mPost({ id: 1, directory: 'dir1', hash: 'hash1' }),
			mPost({ id: 2, directory: 'dir2', hash: 'hash2' }),
			mPost({ id: 3, directory: 'dir3', hash: 'hash3' }),
			mPost({ id: 4, directory: 'dir4', hash: 'hash4', downloaded: 1 }),
			mPost({ id: 5, directory: 'dir5', hash: 'hash5', downloaded: 1 }),
		];
		const store = mockStore(
			mState({
				posts: {
					posts: { checkLaterQueue: posts },
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<CheckLaterQueue />
			</Provider>
		);
		fireEvent.click(screen.getAllByRole('img', { name: 'close' })[2]);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.posts.removePosts.type,
			payload: { context: 'checkLaterQueue', data: posts[1] },
		});
		expect(await screen.findAllByRole('img', { name: 'close' })).toHaveLength(5);
	});
	it('Dispatches downloadPost() for correct post when Download button is pressed', async () => {
		// given
		const posts = [
			mPost({ id: 1, directory: 'dir1', hash: 'hash1' }),
			mPost({ id: 2, directory: 'dir2', hash: 'hash2' }),
			mPost({ id: 3, directory: 'dir3', hash: 'hash3' }),
			mPost({ id: 4, directory: 'dir4', hash: 'hash4', downloaded: 1 }),
			mPost({ id: 5, directory: 'dir5', hash: 'hash5', downloaded: 1 }),
		];
		const store = mockStore(
			mState({
				posts: {
					posts: { checkLaterQueue: posts },
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<CheckLaterQueue />
			</Provider>
		);
		fireEvent.click(screen.getAllByRole('img', { name: 'download' })[2]);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: thunks.posts.downloadPost.pending.type,
			meta: { arg: { context: 'checkLaterQueue', post: posts[1] } },
		});
		expect(await screen.findAllByRole('img', { name: 'download' })).toHaveLength(3);
	});
	it('Dispatches downloadAllPosts() when download All button is pressed', async () => {
		// given
		const posts = [
			mPost({ id: 1, directory: 'dir1', hash: 'hash1' }),
			mPost({ id: 2, directory: 'dir2', hash: 'hash2' }),
			mPost({ id: 3, directory: 'dir3', hash: 'hash3' }),
			mPost({ id: 4, directory: 'dir4', hash: 'hash4', downloaded: 1 }),
			mPost({ id: 5, directory: 'dir5', hash: 'hash5', downloaded: 1 }),
		];
		const store = mockStore(
			mState({
				posts: {
					posts: { checkLaterQueue: posts },
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<CheckLaterQueue />
			</Provider>
		);
		fireEvent.click(screen.getByRole('menuitem', { name: 'download Download' }));
		fireEvent.click((await screen.findAllByRole('menuitem', { name: 'eye All' }))[0]);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: thunks.posts.downloadAllPosts.pending.type,
			meta: { arg: { context: 'checkLaterQueue' } },
		});
	});
	it('Dispatches downloadSelectedPosts() when download selected button is pressed', async () => {
		// given
		const posts = [
			mPost({ id: 1, directory: 'dir1', hash: 'hash1' }),
			mPost({ id: 2, directory: 'dir2', hash: 'hash2' }),
			mPost({ id: 3, directory: 'dir3', hash: 'hash3' }),
			mPost({ id: 4, directory: 'dir4', hash: 'hash4', downloaded: 1 }),
			mPost({ id: 5, directory: 'dir5', hash: 'hash5', downloaded: 1 }),
		];
		const store = mockStore(
			mState({
				posts: {
					posts: { checkLaterQueue: posts },
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<CheckLaterQueue />
			</Provider>
		);
		fireEvent.click(screen.getByRole('menuitem', { name: 'download Download' }));
		fireEvent.click((await screen.findAllByRole('menuitem', { name: 'check-square Selected' }))[0]);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: thunks.posts.downloadSelectedPosts.pending.type,
			meta: { arg: { context: 'checkLaterQueue' } },
		});
	});
	it('Dispatches blacklistAllPosts() when blacklist All button is pressed', async () => {
		// given
		const posts = [
			mPost({ id: 1, directory: 'dir1', hash: 'hash1' }),
			mPost({ id: 2, directory: 'dir2', hash: 'hash2' }),
			mPost({ id: 3, directory: 'dir3', hash: 'hash3' }),
			mPost({ id: 4, directory: 'dir4', hash: 'hash4', downloaded: 1 }),
			mPost({ id: 5, directory: 'dir5', hash: 'hash5', downloaded: 1 }),
		];
		const store = mockStore(
			mState({
				posts: {
					posts: { checkLaterQueue: posts },
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<CheckLaterQueue />
			</Provider>
		);
		fireEvent.click(screen.getByRole('menuitem', { name: 'delete Blacklist' }));
		fireEvent.click((await screen.findAllByRole('menuitem', { name: 'eye All' }))[2]);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: thunks.posts.blacklistAllPosts.pending.type,
			meta: { arg: { context: 'checkLaterQueue' } },
		});
	});
	it('Dispatches blacklistSelectedPosts() when blacklist selected button is pressed', async () => {
		// given
		const posts = [
			mPost({ id: 1, directory: 'dir1', hash: 'hash1' }),
			mPost({ id: 2, directory: 'dir2', hash: 'hash2' }),
			mPost({ id: 3, directory: 'dir3', hash: 'hash3' }),
			mPost({ id: 4, directory: 'dir4', hash: 'hash4', downloaded: 1 }),
			mPost({ id: 5, directory: 'dir5', hash: 'hash5', downloaded: 1 }),
		];
		const store = mockStore(
			mState({
				posts: {
					posts: { checkLaterQueue: posts },
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<CheckLaterQueue />
			</Provider>
		);
		fireEvent.click(screen.getByRole('menuitem', { name: 'delete Blacklist' }));
		fireEvent.click((await screen.findAllByRole('menuitem', { name: 'check-square Selected' }))[2]);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: thunks.posts.blacklistSelectedPosts.pending.type,
			meta: { arg: { context: 'checkLaterQueue' } },
		});
	});
	it('Dispatches blacklistPosts() for correct post when Move button is pressed', async () => {
		// given
		const posts = [
			mPost({ id: 1, directory: 'dir1', hash: 'hash1' }),
			mPost({ id: 2, directory: 'dir2', hash: 'hash2' }),
			mPost({ id: 3, directory: 'dir3', hash: 'hash3' }),
			mPost({ id: 4, directory: 'dir4', hash: 'hash4', downloaded: 1 }),
			mPost({ id: 5, directory: 'dir5', hash: 'hash5', downloaded: 1 }),
		];
		const store = mockStore(
			mState({
				posts: {
					posts: { checkLaterQueue: posts },
				},
			})
		);
		const notificationMock = jest.spyOn(utils, 'openNotificationWithIcon').mockImplementation();

		// when
		render(
			<Provider store={store}>
				<CheckLaterQueue />
			</Provider>
		);
		fireEvent.click(screen.getAllByRole('img', { name: 'delete' })[4]);
		await waitFor(() => screen.getByText('Blacklist image?'));
		fireEvent.click(screen.getByRole('button', { name: 'Blacklist' }));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: thunks.posts.blacklistPosts.pending.type,
			meta: { arg: { context: 'checkLaterQueue', posts: [posts[3]] } },
		});
		await waitFor(() =>
			expect(dispatchedActions).toContainMatchingAction({ type: thunks.posts.blacklistPosts.fulfilled.type })
		);
		expect(deleteImageMock).toBeCalledWith(posts[3]);
		expect(notificationMock).toBeCalledWith('success', 'Post deleted', 'Image was successfuly deleted from disk.');
		notificationMock.mockClear();
	});
	it('Dispatches favoriteAllPosts() when favorite All button is pressed', async () => {
		// given
		const posts = [
			mPost({ id: 1, directory: 'dir1', hash: 'hash1' }),
			mPost({ id: 2, directory: 'dir2', hash: 'hash2' }),
			mPost({ id: 3, directory: 'dir3', hash: 'hash3' }),
			mPost({ id: 4, directory: 'dir4', hash: 'hash4', downloaded: 1 }),
			mPost({ id: 5, directory: 'dir5', hash: 'hash5', downloaded: 1 }),
		];
		const store = mockStore(
			mState({
				posts: {
					posts: { checkLaterQueue: posts },
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<CheckLaterQueue />
			</Provider>
		);
		fireEvent.click(screen.getByRole('menuitem', { name: 'heart Add to Favorites' }));
		fireEvent.click((await screen.findAllByRole('menuitem', { name: 'eye All' }))[1]);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.modals.showModal.type,
			payload: {
				modal: ActiveModal.ADD_POSTS_TO_FAVORITES,
				modalState: {
					[ActiveModal.ADD_POSTS_TO_FAVORITES]: {
						context: 'checkLaterQueue',
						type: 'all',
					},
				},
			},
		});
	});
	it('Dispatches favoriteSelectedPosts() when favorite selected button is pressed', async () => {
		// given
		const posts = [
			mPost({ id: 1, directory: 'dir1', hash: 'hash1' }),
			mPost({ id: 2, directory: 'dir2', hash: 'hash2' }),
			mPost({ id: 3, directory: 'dir3', hash: 'hash3' }),
			mPost({ id: 4, directory: 'dir4', hash: 'hash4', downloaded: 1 }),
			mPost({ id: 5, directory: 'dir5', hash: 'hash5', downloaded: 1 }),
		];
		const store = mockStore(
			mState({
				posts: {
					posts: { checkLaterQueue: posts },
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<CheckLaterQueue />
			</Provider>
		);
		fireEvent.click(screen.getByRole('menuitem', { name: 'heart Add to Favorites' }));
		fireEvent.click((await screen.findAllByRole('menuitem', { name: 'check-square Selected' }))[1]);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.modals.showModal.type,
			payload: {
				modal: ActiveModal.ADD_POSTS_TO_FAVORITES,
				modalState: {
					[ActiveModal.ADD_POSTS_TO_FAVORITES]: {
						context: 'checkLaterQueue',
						type: 'selected',
					},
				},
			},
		});
	});
	it('Dispatches correct actions on clear', async () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<CheckLaterQueue />
			</Provider>
		);
		fireEvent.click(screen.getByRole('menuitem', { name: 'close Clear' }));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.posts.setPosts.type,
			payload: { context: 'checkLaterQueue', data: [] },
		});
		expect(dispatchedActions).toContainMatchingAction({ type: actions.system.setActiveView.type, payload: 'dashboard' });
	});
	it('Dispatches showModal() and setPostIds() for correct post when Favorite button is pressed', async () => {
		// given
		const posts = [
			mPost({ id: 1, directory: 'dir1', hash: 'hash1' }),
			mPost({ id: 2, directory: 'dir2', hash: 'hash2' }),
			mPost({ id: 3, directory: 'dir3', hash: 'hash3' }),
			mPost({ id: 4, directory: 'dir4', hash: 'hash4', downloaded: 1 }),
			mPost({ id: 5, directory: 'dir5', hash: 'hash5', downloaded: 1 }),
		];
		const store = mockStore(
			mState({
				posts: {
					posts: { checkLaterQueue: posts },
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<CheckLaterQueue />
			</Provider>
		);
		fireEvent.click(screen.getAllByRole('img', { name: 'heart' })[3]);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.modals.showModal.type,
			payload: {
				modal: ActiveModal.ADD_POSTS_TO_FAVORITES,
				modalState: { [ActiveModal.ADD_POSTS_TO_FAVORITES]: { postsToFavorite: [posts[2]] } },
			},
		});
		expect(await screen.findAllByRole('img', { name: 'heart' })).toHaveLength(5);
	});
});
