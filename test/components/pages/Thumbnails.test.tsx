import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { thunks, actions } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../helpers/store.helper';

import Thumbnails from '../../../src/pages/Thumbnails';
import '@testing-library/jest-dom';
import { mPost } from '../../helpers/test.helper';
import { deleteImageMock } from '../../helpers/imageBus.mock';
import * as utils from '../../../src/types/components';
import { getThumbnailUrl } from '../../../src/service/webService';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('pages/Thumbnails', () => {
	it('Renders correctly', () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<Thumbnails />
			</Provider>
		);

		// then
		expect(screen.getByText('No Posts To Show')).not.toBeNull();
		expect(screen.getByRole('button', { name: 'download Download' })).not.toBeNull();
		expect(screen.getByRole('button', { name: 'heart Add to Favorites' })).not.toBeNull();
		expect(screen.getByRole('button', { name: 'delete Blacklist' })).not.toBeNull();
	});
	it('Renders add to previews menu when search mode is set to saved-search-online', () => {
		// given
		const store = mockStore(
			mState({
				system: {
					searchMode: 'saved-search-online',
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<Thumbnails />
			</Provider>
		);

		// then
		expect(screen.getByRole('button', { name: 'folder-view Add to Previews' })).not.toBeNull();
	});
	it('Renders add to previews menu when search mode is set to saved-search-offline', () => {
		// given
		const store = mockStore(
			mState({
				system: {
					searchMode: 'saved-search-offline',
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<Thumbnails />
			</Provider>
		);

		// then
		expect(screen.getByRole('button', { name: 'folder-view Add to Previews' })).not.toBeNull();
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
					posts,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<Thumbnails />
			</Provider>
		);

		// then
		const renderedPosts = screen.getAllByTestId('thumbnail-image');
		renderedPosts.forEach((post, index) => {
			expect(post).toHaveAttribute('src', getThumbnailUrl(posts[index].directory, posts[index].hash));
		});
		expect(screen.getAllByRole('img', { name: 'heart' })).toHaveLength(6);
		expect(screen.getAllByRole('img', { name: 'download' })).toHaveLength(4);
		expect(screen.getAllByRole('img', { name: 'delete' })).toHaveLength(6);
		expect(screen.queryAllByRole('img', { name: 'plus' })).toHaveLength(0);
	});
	it('Renders add preview button when serach mod is saved-serach-online', async () => {
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
				system: {
					searchMode: 'saved-search-online',
				},
				posts: {
					posts,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<Thumbnails />
			</Provider>
		);

		// then
		expect(screen.queryAllByRole('img', { name: 'plus' })).toHaveLength(5);
	});
	it('Renders add preview button when serach mod is saved-serach-offline', async () => {
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
				system: {
					searchMode: 'saved-search-offline',
				},
				posts: {
					posts,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<Thumbnails />
			</Provider>
		);

		// then
		expect(screen.queryAllByRole('img', { name: 'plus' })).toHaveLength(5);
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
					posts,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<Thumbnails />
			</Provider>
		);
		fireEvent.click(screen.getAllByRole('img', { name: 'download' })[2]);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: thunks.posts.downloadPost.pending.type, meta: { arg: { post: posts[1] } } });
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
					posts,
				},
			})
		);
		const notificationMock = jest.spyOn(utils, 'openNotificationWithIcon').mockImplementation();

		// when
		render(
			<Provider store={store}>
				<Thumbnails />
			</Provider>
		);
		fireEvent.click(screen.getAllByRole('img', { name: 'delete' })[4]);
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
					posts,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<Thumbnails />
			</Provider>
		);
		fireEvent.click(screen.getAllByRole('img', { name: 'heart' })[3]);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: actions.modals.showModal.type, payload: 'add-to-favorites' });
		expect(dispatchedActions).toContainMatchingAction({ type: actions.modals.addToFavoritesModal.setPostIds.type, payload: [posts[2].id] });
	});
	it('Dispatches addPreviewToActiveSavedSearch() for correct post when Add Preview button is pressed', async () => {
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
				system: {
					searchMode: 'saved-search-online',
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
				<Thumbnails />
			</Provider>
		);
		fireEvent.click(screen.getAllByRole('img', { name: 'plus' })[3]);
		await waitFor(() => screen.getByText('Add preview to Saved Search?'));
		fireEvent.click(screen.getByRole('button', { name: 'Add' }));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: thunks.savedSearches.addPreviewToActiveSavedSearch.pending.type,
			meta: { arg: posts[3] },
		});
		expect(notificationMock).toBeCalledWith('success', 'Preview added', 'Preview was successfuly added to saved search');
		notificationMock.mockClear();
	});
	it('Renders loading state', () => {
		// given
		const store = mockStore(
			mState({
				loadingStates: {
					isFetchingPosts: true,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<Thumbnails />
			</Provider>
		);

		expect(screen.getByRole('img', { name: 'loading' })).not.toBeNull();
	});
});
