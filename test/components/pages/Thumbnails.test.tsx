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
import { mTag, mPost } from '../../helpers/test.helper';
import { deleteImageMock } from '../../helpers/imageBus.mock';
import * as utils from '../../../src/types/components';
import { getThumbnailUrl } from 'service/webService';

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
		expect(screen.getByRole('button', { name: 'Download Search' })).not.toBeNull();
		expect(screen.getByRole('button', { name: 'Save Search' })).not.toBeNull();
		expect(screen.getByRole('button', { name: 'Blacklist All' })).not.toBeNull();
		expect(screen.getByRole('button', { name: 'Blacklist Selected' })).not.toBeNull();
		expect(screen.getByRole('button', { name: 'Add All To Favorites' })).not.toBeNull();
		expect(screen.getByRole('button', { name: 'Add Selected To Favorites' })).not.toBeNull();
		expect(screen.getByRole('button', { name: 'Download All' })).not.toBeNull();
	});
	it('Dispatches all actions when all buttons are pressed', () => {
		// given
		const selectedTags = [mTag({ id: 1, tag: 'tag1' })];
		const excludedTags = [mTag({ id: 2, tag: 'tag2' })];
		const rating = 'questionable';
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
					searchMode: 'offline',
				},
				downloadedSearchForm: {
					selectedTags,
					excludedTags,
					rating,
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
		fireEvent.click(screen.getByRole('button', { name: 'Download Search' }));
		fireEvent.click(screen.getByRole('button', { name: 'Save Search' }));
		fireEvent.click(screen.getByRole('button', { name: 'Blacklist All' }));
		fireEvent.click(screen.getByRole('button', { name: 'Blacklist Selected' }));
		fireEvent.click(screen.getByRole('button', { name: 'Add All To Favorites' }));
		fireEvent.click(screen.getByRole('button', { name: 'Add Selected To Favorites' }));
		fireEvent.click(screen.getByRole('button', { name: 'Download All' }));
		fireEvent.click(screen.getByRole('button', { name: 'Download Selected' }));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: thunks.posts.downloadWholeSearch.pending.type });
		expect(dispatchedActions).toContainMatchingAction({
			type: thunks.savedSearches.saveSearch.pending.type,
			meta: { arg: { tags: selectedTags, excludedTags, rating } },
		});
		expect(dispatchedActions).toContainMatchingAction({ type: thunks.posts.blacklistAllPosts.pending.type });
		expect(dispatchedActions).toContainMatchingAction({ type: thunks.posts.blacklistSelectedPosts.pending.type });
		expect(dispatchedActions).toContainMatchingAction({ type: thunks.posts.downloadAllPosts.pending.type });
		expect(dispatchedActions).toContainMatchingAction({ type: thunks.posts.downloadSelectedPosts.pending.type });
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.modals.addToFavoritesModal.setPostIds.type,
			payload: posts.map((post) => post.id),
		});
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.modals.addToFavoritesModal.setPostIds.type,
			payload: posts.filter((post) => post.selected).map((post) => post.id),
		});
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
		expect(screen.getAllByRole('img', { name: 'heart' })).toHaveLength(5);
		expect(screen.getAllByRole('img', { name: 'download' })).toHaveLength(3);
		expect(screen.getAllByRole('img', { name: 'delete' })).toHaveLength(5);
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
		fireEvent.click(screen.getAllByRole('img', { name: 'download' })[1]);

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
		fireEvent.click(screen.getAllByRole('img', { name: 'heart' })[2]);

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
			meta: { arg: getThumbnailUrl(posts[3].directory, posts[3].hash) },
		});
		expect(notificationMock).toBeCalledWith('success', 'Preview added', 'Preview was successfuly added to saved search');
		notificationMock.mockClear();
	});
	it('Renders loading state', () => {
		// given
		const store = mockStore(
			mState({
				system: {
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
