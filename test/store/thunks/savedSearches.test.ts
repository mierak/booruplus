import { doDatabaseMock, mockedDb } from '../../helpers/database.mock';
doDatabaseMock();
import { enableFetchMocks } from 'jest-fetch-mock';
enableFetchMocks();

import { initialState } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as thunks from '../../../src/store/thunks/savedSearches';
import * as searchContexts from '../../../src/store/thunks/searchContexts';
import * as onlineSearchFormThunk from '../../../src/store/thunks/onlineSearches';
import * as downloadedSearchFormThunk from '../../../src/store/thunks/offlineSearches';
import { mSavedSearch, mTag, mPost } from '../../helpers/test.helper';
import { mState } from '../../helpers/store.helper';
import { saveThumbnailMock } from '../../helpers/imageBus.mock';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);
jest.mock('../../../src/service/apiService', () => {
	const originalModule = jest.requireActual('../../../src/service/apiService');
	return {
		...originalModule,
		__esModule: true,
		getTagsByNames: jest.fn(),
		getTagsByPattern: jest.fn(),
		getPostsForTags: jest.fn(),
	};
});
jest.mock('antd', () => {
	return {
		notification: {
			error: jest.fn(),
		},
	};
});
import { getThumbnailUrl } from '../../../src/service/webService';
import { SavedSearchAlreadyExistsError } from '@errors/savedSearchError';
import { unwrapResult } from '@reduxjs/toolkit';

describe('thunks/savedSearches', () => {
	const context = 'ctx';
	beforeEach(() => {
		jest.clearAllMocks();
	});
	describe('loadSavedSearchesFromDb()', () => {
		it('Calls db correctly', async () => {
			// given
			const store = mockStore(initialState);
			const savedSearches = [
				mSavedSearch({ id: 1 }),
				mSavedSearch({ id: 2 }),
				mSavedSearch({ id: 3 }),
				mSavedSearch({ id: 4 }),
			];
			mockedDb.savedSearches.getAll.mockResolvedValue(savedSearches);

			// when
			await store.dispatch(thunks.loadSavedSearchesFromDb());

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.savedSearches.getAll).toBeCalledTimes(1);
			expect(dispatchedActions[0]).toMatchObject({
				type: thunks.loadSavedSearchesFromDb.pending.type,
				payload: undefined,
			});
			expect(dispatchedActions[1]).toMatchObject({
				type: thunks.loadSavedSearchesFromDb.fulfilled.type,
				payload: savedSearches,
			});
		});
	});
	describe('addPreviewsToActiveSavedSearch()', () => {
		it('Fetches preview and calls db correctly', async () => {
			// given
			fetchMock.mockResponse('');
			const post = mPost({ id: 123456, hash: 'posthash', directory: 'postdirectory' });
			const post2 = mPost({ id: 456789, hash: 'posthash2', directory: 'postdirectory2' });
			const url = getThumbnailUrl(post.directory, post.hash);
			const url2 = getThumbnailUrl(post2.directory, post2.hash);
			const savedSearch = mSavedSearch({ id: 123 });
			const store = mockStore({
				...initialState,
				savedSearches: { ...initialState.savedSearches, activeSavedSearch: savedSearch },
			});
			const blob = await (await fetch(url)).blob();

			// when
			await store.dispatch(thunks.addPreviewsToSavedSearch({ savedSearchId: savedSearch.id, posts: [post, post2] }));

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.savedSearches.addPreviews).toBeCalledWith(savedSearch.id, [
				{ postId: post.id, blob },
				{ postId: post2.id, blob },
			]);
			expect(saveThumbnailMock).toHaveBeenCalledTimes(2);
			expect(mockedDb.posts.put).toBeCalledWith(post);
			expect(mockedDb.posts.put).toBeCalledWith(post2);
			expect(fetchMock.mock.calls.length).toBe(3);
			expect(fetchMock.mock.calls[1][0]).toEqual(url);
			expect(fetchMock.mock.calls[2][0]).toEqual(url2);
			expect(dispatchedActions).toContainMatchingAction({
				type: thunks.addPreviewsToSavedSearch.pending.type,
				payload: undefined,
			});
			expect(dispatchedActions).toContainMatchingAction({
				type: thunks.addPreviewsToSavedSearch.fulfilled.type,
				payload: savedSearch.id,
			});
		});
		it('Dispatches rejected actions when no saved search is set as active', async () => {
			// given
			jest.clearAllMocks();
			const post = mPost({ id: 123456, hash: 'posthash', directory: 'postdirectory' });
			const store = mockStore({
				...initialState,
				savedSearches: { ...initialState.savedSearches, activeSavedSearch: undefined },
			});

			// when
			await store.dispatch(thunks.addPreviewsToSavedSearch({ savedSearchId: undefined, posts: [post] }));

			// then
			const dispatchedActions = store.getActions();
			expect(fetchMock.mock.calls.length).toBe(0);
			expect(mockedDb.savedSearches.addPreviews).toBeCalledTimes(0);
			expect(dispatchedActions).toContainMatchingAction({
				type: thunks.addPreviewsToSavedSearch.pending.type,
				payload: undefined,
			});
			expect(dispatchedActions).toContainMatchingAction({ type: thunks.addPreviewsToSavedSearch.rejected.type });
		});
	});
	describe('searchOnline()', () => {
		it('Calls db correctly, inits context and dispatches fetchPosts', async () => {
			// given
			const store = mockStore(
				mState({
					searchContexts: {
						['1']: {},
					},
				})
			);
			const mockSearch = mSavedSearch({ id: 123, lastSearched: undefined });
			const savedSearch = {
				id: mockSearch.id,
				previews: mockSearch.previews,
				rating: mockSearch.rating,
				tags: mockSearch.tags,
				excludedTags: mockSearch.excludedTags,
			};
			const newContext = unwrapResult(await store.dispatch(searchContexts.generateSearchContext()));

			// when
			await store.dispatch(thunks.searchOnline(savedSearch));

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.savedSearches.save.mock.calls[0][0]).toMatchObject(savedSearch);
			expect(dispatchedActions).toContainMatchingAction({ type: thunks.searchOnline.pending.type, payload: undefined });
			expect(dispatchedActions).toContainMatchingAction({
				type: 'common/initPostsContext',
				payload: {
					context: newContext,
					data: {
						mode: 'online',
						savedSearchId: savedSearch.id,
						selectedTags: savedSearch.tags,
						excludedTags: savedSearch.excludedTags,
						rating: savedSearch.rating,
					},
				},
			});
			expect(dispatchedActions).toContainMatchingAction({ type: onlineSearchFormThunk.fetchPosts.pending.type });
		});
	});
	describe('searchOffline()', () => {
		it('Calls db correctly and dispatches fetchPosts', async () => {
			// given
			const store = mockStore(
				mState({
					searchContexts: {
						['1']: {},
					},
				})
			);
			const mockSearch = mSavedSearch({ id: 123, lastSearched: undefined });
			const savedSearch = {
				id: mockSearch.id,
				previews: mockSearch.previews,
				rating: mockSearch.rating,
				tags: mockSearch.tags,
				excludedTags: mockSearch.excludedTags,
			};
			const newContext = unwrapResult(await store.dispatch(searchContexts.generateSearchContext()));

			// when
			await store.dispatch(thunks.searchOffline(savedSearch));

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.savedSearches.save.mock.calls[0][0]).toMatchObject(savedSearch);
			expect(dispatchedActions).toContainMatchingAction({
				type: 'common/initPostsContext',
				payload: {
					context: newContext,
					data: {
						mode: 'offline',
						savedSearchId: savedSearch.id,
						selectedTags: savedSearch.tags,
						excludedTags: savedSearch.excludedTags,
						rating: savedSearch.rating,
					},
				},
			});
			expect(dispatchedActions).toContainMatchingAction({ type: thunks.searchOffline.pending.type, payload: undefined });
			expect(dispatchedActions).toContainMatchingAction({ type: downloadedSearchFormThunk.fetchPosts.pending.type });
		});
	});
	describe('removePreview()', () => {
		it('Calls db correctly and dispatches fetchPosts', async () => {
			// given
			const store = mockStore(initialState);
			const mockSearch = mSavedSearch({ id: 123, lastSearched: undefined });
			const previewId = 456;

			// when
			await store.dispatch(thunks.removePreview({ savedSearch: mockSearch, previewId }));

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.savedSearches.removePreview).toBeCalledWith(mockSearch, previewId);
			expect(dispatchedActions[0]).toMatchObject({ type: thunks.removePreview.pending.type, payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({
				type: thunks.removePreview.fulfilled.type,
				payload: { savedSearchId: mockSearch.id, previewId },
			});
		});
	});
	describe('saveSearch()', () => {
		it('Calls db correctly and dispatches fetchPosts', async () => {
			// given
			const store = mockStore(initialState);
			const selectedTags = [mTag({ tag: 'tag1' }), mTag({ tag: 'tag2' })];
			const excludedTags = [mTag({ tag: 'tag3' }), mTag({ tag: 'tag4' })];
			const rating = 'explicit';
			const mockSearch = mSavedSearch({ id: 123, tags: selectedTags, excludedTags, rating });
			mockedDb.savedSearches.createAndSave.mockResolvedValue(123);

			// when
			await store.dispatch(thunks.saveSearch({ tags: selectedTags, excludedTags, rating, context }));

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.savedSearches.createAndSave).toBeCalledWith(rating, selectedTags, excludedTags);
			expect(dispatchedActions[0]).toMatchObject({ type: thunks.saveSearch.pending.type, payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: thunks.saveSearch.fulfilled.type, payload: mockSearch });
		});
		it('Returns SavedSearchAlreadyExistsError when Saved Search was already found in DB', async () => {
			// given
			const store = mockStore(initialState);
			const rating = 'explicit';
			const savedSearch = mSavedSearch({ id: 123 });
			mockedDb.savedSearches.createAndSave.mockResolvedValue(savedSearch);

			// when
			await store.dispatch(thunks.saveSearch({ tags: [], excludedTags: [], rating, context }));

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.savedSearches.createAndSave).toBeCalledWith(rating, [], []);
			// eslint-disable-next-line @typescript-eslint/unbound-method
			expect(dispatchedActions[0]).toMatchObject({ type: thunks.saveSearch.pending.type, payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({
				type: thunks.saveSearch.rejected.type,
				payload: new SavedSearchAlreadyExistsError(savedSearch),
			});
		});
	});
	describe('remove()', () => {
		it('Calls db with corrent params', async () => {
			// given
			const store = mockStore(initialState);
			const savedSearch = mSavedSearch({ id: 1234 });

			// when
			await store.dispatch(thunks.remove(savedSearch));

			// then
			expect(mockedDb.savedSearches.remove).toHaveBeenCalledWith(savedSearch);
		});
	});
});
