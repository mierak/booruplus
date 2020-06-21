import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { thunks, actions } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../helpers/store.helper';

import Favorites from '../../../src/pages/Favorites';
import '@testing-library/jest-dom';
import { mTreeNode, mPost } from '../../helpers/test.helper';
import { mockedDb } from '../../helpers/database.mock';
import { deleteImageMock } from '../../helpers/imageBus.mock';
import * as utils from '../../../src/types/components';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('pages/Favorites', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockedDb.posts.getBulk.mockResolvedValue([]);
		mockedDb.favorites.getNodeWithoutChildren.mockResolvedValue(mTreeNode());
	});
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
				key: '12',
			}),
		],
	});
	const expandedKeys = ['0', '11', '111', '12'];
	it('Renders correctly', () => {
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
				<Favorites />
			</Provider>
		);

		// then
		expect(screen.getByText('node11')).not.toBeNull();
		expect(screen.getByText('No Posts To Show')).not.toBeNull();
	});
	it('Fetches posts in root directory and sets search mode to favorites on mount', () => {
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
				<Favorites />
			</Provider>
		);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: thunks.favorites.fetchPostsInDirectory.pending.type, meta: { arg: 0 } });
		expect(dispatchedActions).toContainMatchingAction({ type: actions.system.setSearchMode.type, payload: 'favorites' });
	});
	it('Fetches posts on directory click', () => {
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
				<Favorites />
			</Provider>
		);
		fireEvent.click(screen.getByText('node12'));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: thunks.favorites.fetchPostsInDirectory.pending.type, meta: { arg: 12 } });
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
				favorites: {
					rootNode,
					expandedKeys,
				},
				posts: {
					posts,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<Favorites />
			</Provider>
		);

		// then
		const renderedPosts = screen.getAllByTestId('thumbnail-image');
		renderedPosts.forEach((post, index) => {
			expect(post).toHaveAttribute('src', `https://gelbooru.com/thumbnails/${posts[index].directory}/thumbnail_${posts[index].hash}.jpg`);
		});
		expect(screen.getAllByRole('img', { name: 'close' })).toHaveLength(5);
		expect(screen.getAllByRole('img', { name: 'download' })).toHaveLength(3);
		expect(screen.getAllByRole('img', { name: 'delete' })).toHaveLength(5);
		expect(screen.getAllByRole('img', { name: 'folder' })).toHaveLength(5);
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
				favorites: {
					rootNode,
					expandedKeys,
				},
				posts: {
					posts,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<Favorites />
			</Provider>
		);
		fireEvent.click(screen.getAllByRole('img', { name: 'download' })[1]);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: thunks.posts.downloadPost.pending.type, meta: { arg: { post: posts[1] } } });
	});
	it('Dispatches showModal() and setPostIds() for correct post when Move button is pressed', async () => {
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
				favorites: {
					rootNode,
					expandedKeys,
				},
				posts: {
					posts,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<Favorites />
			</Provider>
		);
		fireEvent.click(screen.getAllByRole('img', { name: 'folder' })[2]);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: actions.modals.showModal.type, payload: 'move-to-directory' });
		expect(dispatchedActions).toContainMatchingAction({ type: actions.modals.addToFavoritesModal.setPostIds.type, payload: [posts[2].id] });
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
				favorites: {
					rootNode,
					expandedKeys,
				},
				posts: {
					posts,
				},
			})
		);
		const notificationMock = jest.spyOn(utils, 'openNotificationWithIcon').mockImplementation();

		// when
		render(
			<Provider store={store}>
				<Favorites />
			</Provider>
		);
		fireEvent.click(screen.getAllByRole('img', { name: 'delete' })[3]);
		await waitFor(() => screen.getByText('Blacklist image?'));
		fireEvent.click(screen.getByRole('button', { name: 'Blacklist' }));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: thunks.posts.blacklistPosts.pending.type, meta: { arg: [posts[3]] } });
		await waitFor(() => expect(dispatchedActions).toContainMatchingAction({ type: thunks.posts.blacklistPosts.fulfilled.type }));
		expect(deleteImageMock).toBeCalledWith(posts[3]);
		expect(notificationMock).toBeCalledWith('success', 'Post deleted', 'Image was successfuly deleted from disk.');
		notificationMock.mockClear();
	});
	it('Dispatches removePostsFromActiveDirectory() for correct and fetches posts again post when Move button is pressed', async () => {
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
				favorites: {
					rootNode,
					expandedKeys,
					activeNodeKey: 0,
				},
				posts: {
					posts,
				},
			})
		);
		const notificationMock = jest.spyOn(utils, 'openNotificationWithIcon').mockImplementation();

		// when
		render(
			<Provider store={store}>
				<Favorites />
			</Provider>
		);
		fireEvent.click(screen.getAllByRole('img', { name: 'close' })[4]);
		await waitFor(() => screen.getByText('Remove from Favorites?'));
		fireEvent.click(screen.getByRole('button', { name: 'Remove' }));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: thunks.favorites.removePostsFromActiveDirectory.pending.type,
			meta: { arg: [posts[3].id] },
		});
		await waitFor(() =>
			expect(dispatchedActions).toContainMatchingAction({ type: thunks.favorites.fetchPostsInDirectory.pending.type, meta: { arg: 0 } })
		);
		expect(notificationMock).toBeCalledWith('success', 'Success', 'Successfuly removed post from directory');
	});
});
