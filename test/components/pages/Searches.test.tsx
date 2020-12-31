import { doDatabaseMock, mockedDb } from '../../helpers/database.mock';
doDatabaseMock();
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { thunks, actions } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mPostsPostsState, mState } from '../../helpers/store.helper';

import Searches from '../../../src/pages/Searches';
import '@testing-library/jest-dom';
import { mPost, mTag } from '../../helpers/test.helper';
import * as utils from '../../../src/types/components';
import { thumbnailLoaderMock, deleteImageMock } from '../../helpers/imageBus.mock';
import { ActiveModal } from '@appTypes/modalTypes';
import { unwrapResult } from '@reduxjs/toolkit';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('pages/Searches', () => {
	const testUrl = '123testurl.jpg';
	const context = 'ctx';
	beforeEach(() => {
		jest.clearAllMocks();
		thumbnailLoaderMock.mockResolvedValue(testUrl);
	});
	it('Renders correctly', () => {
		// given
		const store = mockStore(
			mState({
				searchContexts: {
					[context]: {},
				},
				system: {
					activeSearchTab: context,
				},
				posts: { posts: mPostsPostsState({ [context]: [] }) },
			})
		);

		// when
		render(
			<Provider store={store}>
				<Searches />
			</Provider>
		);

		// then
		expect(screen.getByText('No Posts To Show')).not.toBeNull();
		expect(screen.getByRole('button', { name: 'download Download' })).not.toBeNull();
		expect(screen.getByRole('button', { name: 'heart Add to Favorites' })).not.toBeNull();
		expect(screen.getByRole('button', { name: 'delete Blacklist' })).not.toBeNull();
	});
	it('Does not render "Save Search" when context has savedSearchId', () => {
		// given
		const store = mockStore(
			mState({
				searchContexts: {
					[context]: {
						savedSearchId: 123,
					},
				},
				system: {
					activeSearchTab: context,
				},
				posts: { posts: mPostsPostsState({ [context]: [] }) },
			})
		);

		// when
		render(
			<Provider store={store}>
				<Searches />
			</Provider>
		);

		// then
		expect(screen.queryByRole('menuitem', { name: 'save Save Search' })).not.toBeInTheDocument();
	});
	it('Renders add to previews menu when context has savedSearchID', () => {
		// given
		const store = mockStore(
			mState({
				searchContexts: {
					[context]: {
						savedSearchId: 123,
					},
				},
				system: {
					activeSearchTab: context,
				},
				posts: { posts: mPostsPostsState({ [context]: [] }) },
			})
		);

		// when
		render(
			<Provider store={store}>
				<Searches />
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
				searchContexts: {
					[context]: {},
				},
				system: {
					activeSearchTab: context,
				},
				posts: { posts: mPostsPostsState({ [context]: posts }) },
			})
		);

		// when
		render(
			<Provider store={store}>
				<Searches />
			</Provider>
		);

		// then
		expect(screen.getAllByRole('img', { name: 'heart' })).toHaveLength(6);
		expect(screen.getAllByRole('img', { name: 'download' })).toHaveLength(4);
		expect(screen.getAllByRole('img', { name: 'delete' })).toHaveLength(6);
		expect(screen.getAllByRole('img', { name: 'clock-circle' })).toHaveLength(5);
		expect(screen.queryAllByRole('img', { name: 'plus' })).toHaveLength(2);
	});
	it('Renders add preview button when context has savedSearchId', async () => {
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
				searchContexts: {
					[context]: { savedSearchId: 123 },
				},
				system: {
					activeSearchTab: context,
				},
				posts: { posts: mPostsPostsState({ [context]: posts }) },
			})
		);

		// when
		render(
			<Provider store={store}>
				<Searches />
			</Provider>
		);

		// then
		expect(screen.queryAllByRole('img', { name: 'plus' })).toHaveLength(7);
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
				searchContexts: {
					[context]: {},
				},
				system: {
					activeSearchTab: context,
				},
				posts: { posts: mPostsPostsState({ [context]: posts }) },
			})
		);

		// when
		render(
			<Provider store={store}>
				<Searches />
			</Provider>
		);
		fireEvent.click(screen.getAllByRole('img', { name: 'download' })[2]);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: thunks.posts.downloadPost.pending.type,
			meta: { arg: { context, post: posts[1] } },
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
				searchContexts: {
					[context]: {},
				},
				system: {
					activeSearchTab: context,
				},
				posts: { posts: mPostsPostsState({ [context]: posts }) },
			})
		);
		const notificationMock = jest.spyOn(utils, 'openNotificationWithIcon').mockImplementation();

		// when
		render(
			<Provider store={store}>
				<Searches />
			</Provider>
		);
		fireEvent.click(screen.getAllByRole('img', { name: 'delete' })[4]);
		await waitFor(() => screen.getByText('Blacklist image?'));
		fireEvent.click(screen.getByRole('button', { name: 'Blacklist' }));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: thunks.posts.blacklistPosts.pending.type,
			meta: { arg: { context, posts: [posts[3]] } },
		});
		await waitFor(() =>
			expect(dispatchedActions).toContainMatchingAction({ type: thunks.posts.blacklistPosts.fulfilled.type })
		);
		expect(deleteImageMock).toBeCalledWith(posts[3]);
		expect(notificationMock).toBeCalledWith('success', 'Post deleted', 'Image was successfuly deleted from disk.');
		expect(await screen.findAllByRole('img', { name: 'delete' })).toHaveLength(6);
		notificationMock.mockClear();
	});
	it('Adds posts to checkLaterQueue when Plus button is pressed', async () => {
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
				searchContexts: {
					[context]: {},
				},
				system: {
					activeSearchTab: context,
				},
				posts: { posts: mPostsPostsState({ [context]: posts }) },
			})
		);

		// when
		render(
			<Provider store={store}>
				<Searches />
			</Provider>
		);
		fireEvent.click(screen.getAllByRole('img', { name: 'clock-circle' })[4]);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.posts.addPosts.type,
			payload: { data: posts[4], context: 'checkLaterQueue' },
		});
		expect(await screen.findAllByRole('img', { name: 'download' })).toHaveLength(4);
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
				searchContexts: {
					[context]: {},
				},
				system: {
					activeSearchTab: context,
				},
				posts: { posts: mPostsPostsState({ [context]: posts }) },
			})
		);

		// when
		render(
			<Provider store={store}>
				<Searches />
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
	it('Dispatches addPreviewsToSavedSearch() for correct post when Add Preview button is pressed', async () => {
		// given
		const savedSearchId = 123;
		const posts = [
			mPost({ id: 1, directory: 'dir1', hash: 'hash1' }),
			mPost({ id: 2, directory: 'dir2', hash: 'hash2' }),
			mPost({ id: 3, directory: 'dir3', hash: 'hash3' }),
			mPost({ id: 4, directory: 'dir4', hash: 'hash4', downloaded: 1 }),
			mPost({ id: 5, directory: 'dir5', hash: 'hash5', downloaded: 1 }),
		];
		const store = mockStore(
			mState({
				searchContexts: {
					[context]: { savedSearchId },
				},
				system: {
					activeSearchTab: context,
				},
				posts: { posts: mPostsPostsState({ [context]: posts }) },
			})
		);
		const notificationMock = jest.spyOn(utils, 'openNotificationWithIcon').mockImplementation();

		// when
		render(
			<Provider store={store}>
				<Searches />
			</Provider>
		);
		fireEvent.click(screen.getAllByRole('img', { name: 'plus' })[5]);
		await waitFor(() => screen.getByText('Add preview to Saved Search?'));
		fireEvent.click(screen.getByRole('button', { name: 'Add' }));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: thunks.savedSearches.addPreviewsToSavedSearch.pending.type,
			meta: { arg: { savedSearchId, posts: [posts[3]] } },
		});
		expect(notificationMock).toBeCalledWith('success', 'Preview added', 'Preview was successfuly added to saved search');
		expect(await screen.findAllByRole('img', { name: 'plus' })).toHaveLength(7);
		notificationMock.mockClear();
	});
	it('Renders loading state', () => {
		// given
		const store = mockStore(
			mState({
				loadingStates: {
					isFetchingPosts: true,
				},
				searchContexts: {
					[context]: {},
				},
				system: {
					activeSearchTab: context,
				},
				posts: { posts: mPostsPostsState({ [context]: [] }) },
			})
		);

		// when
		render(
			<Provider store={store}>
				<Searches />
			</Provider>
		);

		// then
		expect(screen.getByRole('img', { name: 'loading' })).not.toBeNull();
	});
	it('Save Search button dispatches correct actions', async () => {
		// given
		const tags = [mTag({ id: 123 })];
		const eTags = [mTag({ id: 456 })];
		const id = 12345;
		const rating = 'explicit';
		mockedDb.savedSearches.createAndSave.mockResolvedValueOnce(id);
		const state = mState({
			searchContexts: {
				[context]: {
					rating,
					selectedTags: tags,
					excludedTags: eTags,
				},
			},
			system: {
				activeSearchTab: context,
			},
			posts: { posts: mPostsPostsState({ [context]: [mPost()] }) },
		});
		const store = mockStore(state);

		// when
		render(
			<Provider store={store}>
				<Searches />
			</Provider>
		);
		fireEvent.click(screen.getByRole('menuitem', { name: 'save Save Search' }));
		fireEvent.click(await screen.findByRole('button', { name: 'Save' }));

		//then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: thunks.savedSearches.saveSearch.pending.type,
			meta: { arg: { context, tags, excludedTags: eTags, rating } },
		});
	});
	describe('Tabs', () => {
		it('Initializes context and shows search form modal on new tab click', async () => {
			// given
			const store = mockStore(
				mState({
					system: {
						activeSearchTab: context,
					},
					searchContexts: {
						[context]: {},
					},
					posts: {
						posts: mPostsPostsState({ [context]: [] }),
					},
				})
			);
			const newContext = unwrapResult(await store.dispatch(thunks.searchContexts.generateSearchContext()));

			// when
			render(
				<Provider store={store}>
					<Searches />
				</Provider>
			);
			fireEvent.click(screen.getAllByRole('img', { name: 'plus' })[1]);

			// then
			const dispatchedActions = store.getActions();
			await waitFor(() =>
				expect(dispatchedActions).toContainMatchingAction({
					type: 'common/initPostsContext',
					payload: { context: newContext, data: { mode: 'online' } },
				})
			);
			expect(dispatchedActions).toContainMatchingAction({
				type: actions.modals.showModal.type,
				payload: {
					modal: ActiveModal.SEARCH_FORM,
					modalState: { [ActiveModal.SEARCH_FORM]: { context: newContext } },
				},
			});
		});
		it('Deletes context on tab close click', () => {
			// given
			const store = mockStore(
				mState({
					system: {
						activeSearchTab: context,
					},
					searchContexts: {
						[context]: {},
						secondContext: {},
					},
					posts: {
						posts: mPostsPostsState({ [context]: [] }),
					},
				})
			);

			// when
			render(
				<Provider store={store}>
					<Searches />
				</Provider>
			);
			fireEvent.click(screen.getAllByRole('button', { name: 'remove' })[0]);

			// then
			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainMatchingAction({
				type: 'common/deletePostsContext',
				payload: { context },
			});
		});
		it('Clicking tab switchest to it', () => {
			// given
			const store = mockStore(
				mState({
					system: {
						activeSearchTab: context,
					},
					searchContexts: {
						[context]: {},
						secondContext: { selectedTags: [mTag({ tag: 'switchhere' })] },
					},
					posts: {
						posts: mPostsPostsState({ [context]: [] }),
					},
				})
			);

			// when
			render(
				<Provider store={store}>
					<Searches />
				</Provider>
			);
			fireEvent.click(screen.getAllByRole('tab', { name: 'global switchhere' })[0]);

			// then
			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainMatchingAction({
				type: actions.system.setActiveSearchTab.type,
				payload: 'secondContext',
			});
		});
		it('Activates last tab if current active tab is not found in current tab list', () => {
			// given
			const store = mockStore(
				mState({
					system: {
						activeSearchTab: 'noexisto',
					},
					searchContexts: {
						[context]: {},
						secondContext: { selectedTags: [mTag({ tag: 'switchhere' })] },
					},
					posts: {
						posts: mPostsPostsState({ [context]: [], secondContext: [mPost({ downloaded: 0 })] }),
					},
				})
			);

			// when
			render(
				<Provider store={store}>
					<Searches />
				</Provider>
			);

			// then
			expect(screen.getAllByRole('img', { name: 'download' })).toHaveLength(2);
		});
	});
});
