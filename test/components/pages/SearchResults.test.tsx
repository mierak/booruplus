import { doDatabaseMock, mockedDb } from '../../helpers/database.mock';
doDatabaseMock();
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { thunks, actions } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../helpers/store.helper';

import SearchResults from '../../../src/pages/Searches';
import '@testing-library/jest-dom';
import { mPost, mTag } from '../../helpers/test.helper';
import { deleteImageMock } from '../../helpers/imageBus.mock';
import * as utils from '../../../src/types/components';
import { thumbnailLoaderMock } from '../../helpers/imageBus.mock';
import { ActiveModal } from '@appTypes/modalTypes';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('pages/SearchResults', () => {
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
				<SearchResults />
			</Provider>
		);

		// then
		expect(screen.getByText('No Posts To Show')).not.toBeNull();
		expect(screen.getByRole('button', { name: 'download Download' })).not.toBeNull();
		expect(screen.getByRole('button', { name: 'heart Add to Favorites' })).not.toBeNull();
		expect(screen.getByRole('button', { name: 'delete Blacklist' })).not.toBeNull();
	});
	it('Does not render "Save Search" when search mode is "saved-search-online"', () => {
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
				<SearchResults />
			</Provider>
		);

		// then
		expect(screen.queryByRole('menuitem', { name: 'save Save Search' })).not.toBeInTheDocument();
	});
	it('Does not render "Save Search" when search mode is "saved-search-offline"', () => {
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
				<SearchResults />
			</Provider>
		);

		// then
		expect(screen.queryByRole('menuitem', { name: 'save Save Search' })).not.toBeInTheDocument();
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
				<SearchResults />
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
				<SearchResults />
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
					posts: { posts, favorites: [] },
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<SearchResults />
			</Provider>
		);

		// then
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
					posts: { posts, favorites: [] },
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<SearchResults />
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
					posts: { posts, favorites: [] },
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<SearchResults />
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
					posts: { posts, favorites: [] },
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<SearchResults />
			</Provider>
		);
		fireEvent.click(screen.getAllByRole('img', { name: 'download' })[2]);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: thunks.posts.downloadPost.pending.type,
			meta: { arg: { context: 'posts', post: posts[1] } },
		});
		expect(await screen.findAllByRole('img', { name: 'download' })).toHaveLength(3);
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
					posts: { posts, favorites: [] },
				},
			})
		);
		const notificationMock = jest.spyOn(utils, 'openNotificationWithIcon').mockImplementation();

		// when
		render(
			<Provider store={store}>
				<SearchResults />
			</Provider>
		);
		fireEvent.click(screen.getAllByRole('img', { name: 'delete' })[4]);
		await waitFor(() => screen.getByText('Blacklist image?'));
		fireEvent.click(screen.getByRole('button', { name: 'Blacklist' }));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: thunks.posts.blacklistPosts.pending.type,
			meta: { arg: { context: 'posts', posts: [posts[3]] } },
		});
		await waitFor(() =>
			expect(dispatchedActions).toContainMatchingAction({ type: thunks.posts.blacklistPosts.fulfilled.type })
		);
		expect(deleteImageMock).toBeCalledWith(posts[3]);
		expect(notificationMock).toBeCalledWith('success', 'Post deleted', 'Image was successfuly deleted from disk.');
		expect(await screen.findAllByRole('img', { name: 'delete' })).toHaveLength(6);
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
					posts: { posts, favorites: [] },
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<SearchResults />
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
					posts: { posts, favorites: [] },
				},
			})
		);
		const notificationMock = jest.spyOn(utils, 'openNotificationWithIcon').mockImplementation();

		// when
		render(
			<Provider store={store}>
				<SearchResults />
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
		expect(await screen.findAllByRole('img', { name: 'plus' })).toHaveLength(5);
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
				<SearchResults />
			</Provider>
		);

		// then
		expect(screen.getByRole('img', { name: 'loading' })).not.toBeNull();
	});
	it.each([
		['online', 'onlineSearchForm'],
		['offline', 'downloadedSearchForm'],
	])('Save Search button dispatches correct actions when mode is %s', async (mode, stateSlice) => {
		// given
		const tags = [mTag({ id: 123 })];
		const eTags = [mTag({ id: 456 })];
		const id = 12345;
		const rating = 'explicit';
		mockedDb.savedSearches.createAndSave.mockResolvedValueOnce(id);
		const state = mState({
			system: {
				searchMode: mode as any,
			},
			[stateSlice]: {
				rating,
				selectedTags: tags,
				excludedTags: eTags,
			},
		});
		const store = mockStore(state);

		// when
		render(
			<Provider store={store}>
				<SearchResults />
			</Provider>
		);
		fireEvent.click(screen.getByRole('menuitem', { name: 'save Save Search' }));
		fireEvent.click(await screen.findByRole('button', { name: 'Save' }));

		//then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: thunks.savedSearches.saveSearch.pending.type,
			meta: { arg: { tags, excludedTags: eTags, rating } },
		});
	});
});
