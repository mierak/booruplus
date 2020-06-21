import { doDatabaseMock, mockedDb } from '../../helpers/database.mock';
doDatabaseMock();
import { enableFetchMocks } from 'jest-fetch-mock';
enableFetchMocks();

import { initialState } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as thunks from '../../../src/store/thunks/savedSearches';
import * as onlineSearchFormThunk from '../../../src/store/thunks/onlineSearchForm';
import * as downloadedSearchFormThunk from '../../../src/store/thunks/downloadedSearchForm';
import { mSavedSearch, mTag } from '../../helpers/test.helper';

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
import { notification } from 'antd';

describe('thunks/savedSearches', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});
	describe('loadSavedSearchesFromDb()', () => {
		it('Calls db correctly', async () => {
			// given
			const store = mockStore(initialState);
			const savedSearches = [mSavedSearch({ id: 1 }), mSavedSearch({ id: 2 }), mSavedSearch({ id: 3 }), mSavedSearch({ id: 4 })];
			mockedDb.savedSearches.getAll.mockResolvedValue(savedSearches);

			// when
			await store.dispatch(thunks.loadSavedSearchesFromDb());

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.savedSearches.getAll).toBeCalledTimes(1);
			expect(dispatchedActions[0]).toMatchObject({ type: thunks.loadSavedSearchesFromDb.pending.type, payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: thunks.loadSavedSearchesFromDb.fulfilled.type, payload: savedSearches });
		});
	});
	describe('addPreviewToActiveSavedSearch()', () => {
		it('Fetches preview and calls db correctly', async () => {
			// given
			fetchMock.mockResponse('');
			const savedSearch = mSavedSearch({ id: 123 });
			const store = mockStore({ ...initialState, savedSearches: { ...initialState.savedSearches, activeSavedSearch: savedSearch } });
			const url = 'preview_url';
			const blob = await (await fetch(url)).blob();

			// when
			await store.dispatch(thunks.addPreviewToActiveSavedSearch(url));

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.savedSearches.addPreview).toBeCalledWith(savedSearch.id, blob);
			expect(fetchMock.mock.calls.length).toBe(2);
			expect(fetchMock.mock.calls[0][0]).toEqual(url);
			expect(dispatchedActions[0]).toMatchObject({ type: thunks.addPreviewToActiveSavedSearch.pending.type, payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: thunks.addPreviewToActiveSavedSearch.fulfilled.type, payload: savedSearch });
		});
		it('Dispatches rejected actions when no saved search is set as active', async () => {
			// given
			jest.clearAllMocks();
			const store = mockStore({ ...initialState, savedSearches: { ...initialState.savedSearches, activeSavedSearch: undefined } });
			const url = 'preview_url';

			// when
			await store.dispatch(thunks.addPreviewToActiveSavedSearch(url));

			// then
			const dispatchedActions = store.getActions();
			expect(fetchMock.mock.calls.length).toBe(0);
			expect(mockedDb.savedSearches.addPreview).toBeCalledTimes(0);
			expect(dispatchedActions[0]).toMatchObject({ type: thunks.addPreviewToActiveSavedSearch.pending.type, payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({
				type: thunks.addPreviewToActiveSavedSearch.rejected.type,
				error: { message: 'Cannot add preview to Saved Search. No Saved Search is set as active.' },
			});
		});
	});
	describe('searchOnline()', () => {
		it('Calls db correctly and dispatches fetchPosts', async () => {
			// given
			const store = mockStore(initialState);
			const mockSearch = mSavedSearch({ id: 123, lastSearched: undefined });
			const savedSearch = {
				id: mockSearch.id,
				previews: mockSearch.previews,
				rating: mockSearch.rating,
				tags: mockSearch.tags,
				excludedTags: mockSearch.excludedTags,
			};

			// when
			await store.dispatch(thunks.searchOnline(savedSearch));

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.savedSearches.save.mock.calls[0][0]).toMatchObject(savedSearch);
			expect(dispatchedActions[0]).toMatchObject({ type: thunks.searchOnline.pending.type, payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: onlineSearchFormThunk.fetchPosts.pending.type });
			expect(dispatchedActions[2]).toMatchObject({ type: onlineSearchFormThunk.checkPostsAgainstDb.pending.type });
			expect(dispatchedActions[3]).toMatchObject({ type: onlineSearchFormThunk.checkPostsAgainstDb.fulfilled.type });
			expect(dispatchedActions[4]).toMatchObject({ type: onlineSearchFormThunk.fetchPosts.fulfilled.type });
			expect(dispatchedActions[5]).toMatchObject({ type: thunks.searchOnline.fulfilled.type, payload: savedSearch });
		});
	});
	describe('searchOffline()', () => {
		it('Calls db correctly and dispatches fetchPosts', async () => {
			// given
			const store = mockStore(initialState);
			const mockSearch = mSavedSearch({ id: 123, lastSearched: undefined });
			const savedSearch = {
				id: mockSearch.id,
				previews: mockSearch.previews,
				rating: mockSearch.rating,
				tags: mockSearch.tags,
				excludedTags: mockSearch.excludedTags,
			};

			// when
			await store.dispatch(thunks.searchOffline(savedSearch));

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.savedSearches.save.mock.calls[0][0]).toMatchObject(savedSearch);
			expect(dispatchedActions[0]).toMatchObject({ type: thunks.searchOffline.pending.type, payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: downloadedSearchFormThunk.fetchPosts.pending.type });
			expect(dispatchedActions[2]).toMatchObject({ type: downloadedSearchFormThunk.fetchPosts.fulfilled.type });
			expect(dispatchedActions[3]).toMatchObject({ type: thunks.searchOffline.fulfilled.type, payload: savedSearch });
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
			await store.dispatch(thunks.saveSearch({ tags: selectedTags, excludedTags, rating }));

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.savedSearches.createAndSave).toBeCalledWith(rating, selectedTags, excludedTags);
			expect(dispatchedActions[0]).toMatchObject({ type: thunks.saveSearch.pending.type, payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: thunks.saveSearch.fulfilled.type, payload: mockSearch });
		});
		it('Shows notification and dispatches rejected with error when id already exists in db', async () => {
			// given
			const store = mockStore(initialState);
			const rating = 'explicit';
			mockedDb.savedSearches.createAndSave.mockResolvedValue('already-exists');

			// when
			await store.dispatch(thunks.saveSearch({ tags: [], excludedTags: [], rating }));

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.savedSearches.createAndSave).toBeCalledWith(rating, [], []);
			// eslint-disable-next-line @typescript-eslint/unbound-method
			expect(notification.error as jest.Mock).toBeCalledTimes(1);
			expect(dispatchedActions[0]).toMatchObject({ type: thunks.saveSearch.pending.type, payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({
				type: thunks.saveSearch.rejected.type,
				error: { message: 'Saved search already exists' },
			});
		});
	});
});
