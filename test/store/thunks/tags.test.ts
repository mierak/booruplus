import { doDatabaseMock, mockedDb } from '../../helpers/database.mock';
doDatabaseMock();
import { enableFetchMocks } from 'jest-fetch-mock';
enableFetchMocks();

import { initialState } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as thunks from '../../../src/store/thunks/tags';
import * as downloadedSearchFormThunk from '../../../src/store/thunks/downloadedSearchForm';
import * as onlineSearchFormThunk from '../../../src/store/thunks/onlineSearchForm';
import { mTag } from '../../helpers/test.helper';
import { Tag } from 'types/gelbooruTypes';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);
jest.mock('../../../src/service/apiService', () => {
	const originalModule = jest.requireActual('../../../src/service/apiService');
	return {
		...originalModule,
		__esModule: true,
		getTagsByNames: jest.fn(),
		getPostsForTags: jest.fn(),
	};
});
import { getTagsByNames } from '../../../src/service/apiService';

describe('thunks/tags', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});
	describe('loadAllTagsFromDb()', () => {
		it('Calls db correctly', async () => {
			// given
			const store = mockStore(initialState);
			const tags = [mTag({ tag: 'tag1' }), mTag({ tag: 'tag2' })];
			mockedDb.tags.getAll.mockResolvedValue(tags);

			// when
			await store.dispatch(thunks.loadAllTagsFromDb());

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.tags.getAll).toBeCalledTimes(1);
			expect(dispatchedActions[0]).toMatchObject({ type: thunks.loadAllTagsFromDb.pending.type, payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: thunks.loadAllTagsFromDb.fulfilled.type, payload: tags });
		});
	});
	describe('getCount()', () => {
		it('Calls db correctly and returns count', async () => {
			// given
			const store = mockStore(initialState);
			const count = 123;
			mockedDb.tags.getCount.mockResolvedValue(count);

			// when
			await store.dispatch(thunks.getCount());

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.tags.getCount).toBeCalledTimes(1);
			expect(dispatchedActions[0]).toMatchObject({ type: thunks.getCount.pending.type, payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: thunks.getCount.fulfilled.type, payload: count });
		});
	});
	describe('loadByPatternFromDb()', () => {
		it('Calls db correctly and returns count', async () => {
			// given
			const store = mockStore(initialState);
			const pattern = 'tag_pattern';
			const tags = [mTag({ tag: 'tag1' }), mTag({ tag: 'tag2' })];
			mockedDb.tags.getByPattern.mockResolvedValue(tags);

			// when
			await store.dispatch(thunks.loadByPatternFromDb(pattern));

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.tags.getByPattern).toBeCalledWith(pattern);
			expect(dispatchedActions[0]).toMatchObject({ type: thunks.loadByPatternFromDb.pending.type, payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: thunks.loadByPatternFromDb.fulfilled.type, payload: tags });
		});
	});
	describe('searchTagOnline()', () => {
		it('Dispatches correct actions', async () => {
			// given
			const store = mockStore(initialState);
			const tag = mTag({ tag: 'tag1' });

			// when
			await store.dispatch(thunks.searchTagOnline(tag));

			// then
			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toMatchObject({ type: thunks.searchTagOnline.pending.type, payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: onlineSearchFormThunk.fetchPosts.pending.type, payload: undefined });
		});
	});
	describe('searchTagOffline()', () => {
		it('Dispatches correct actions', async () => {
			// given
			const store = mockStore(initialState);
			const tag = mTag({ tag: 'tag1' });

			// when
			await store.dispatch(thunks.searchTagOffline(tag));

			// then
			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toMatchObject({ type: thunks.searchTagOffline.pending.type, payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: downloadedSearchFormThunk.fetchPosts.pending.type, payload: undefined });
			expect(dispatchedActions[2]).toMatchObject({ type: downloadedSearchFormThunk.fetchPosts.fulfilled.type });
			expect(dispatchedActions[3]).toMatchObject({ type: thunks.searchTagOffline.fulfilled.type, payload: tag });
		});
	});
	describe('loadAllWithLimitAndOffset()', () => {
		it('Calls db correctly', async () => {
			// given
			const store = mockStore(initialState);
			const tags = [
				mTag({ tag: 'tag1' }),
				mTag({ tag: 'tag2' }),
				mTag({ tag: 'tag3' }),
				mTag({ tag: 'tag4' }),
				mTag({ tag: 'tag5' }),
				mTag({ tag: 'tag6' }),
			];
			const searchParams = {
				pattern: 'tag_pattern',
				limit: 50,
				offset: 10,
			};
			const downloadedCount = 5;
			const blacklistedCount = 10;
			mockedDb.tags.getAllWithLimitAndOffset.mockResolvedValue(tags);
			mockedDb.tags.getDownloadedCount.mockResolvedValue(downloadedCount);
			mockedDb.tags.getBlacklistedCount.mockResolvedValue(blacklistedCount);

			// when
			await store.dispatch(thunks.loadAllWithLimitAndOffset(searchParams));

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.tags.getAllWithLimitAndOffset).toBeCalledWith(searchParams);
			expect(dispatchedActions[0]).toMatchObject({ type: thunks.loadAllWithLimitAndOffset.pending.type, payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({
				type: thunks.loadAllWithLimitAndOffset.fulfilled.type,
				payload: tags.map((tag) => ({
					...tag,
					downloadedCount,
					blacklistedCount,
				})),
			});
		});
	});
	describe('fetchTags()', () => {
		it('Calls db with correct tags', async () => {
			// given
			const store = mockStore(initialState);
			const tagsString = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6'];
			const tags = [
				mTag({ tag: 'tag1' }),
				mTag({ tag: 'tag2' }),
				mTag({ tag: 'tag3' }),
				mTag({ tag: 'tag4' }),
				mTag({ tag: 'tag5' }),
				mTag({ tag: 'tag6' }),
			];
			mockedDb.tags.getTag.mockResolvedValue(mTag({ tag: 'tag' }));
			(getTagsByNames as jest.Mock).mockResolvedValue(tags);

			// when
			await store.dispatch(thunks.fetchTags(tagsString));

			// then
			tagsString.forEach((tag) => {
				expect(mockedDb.tags.getTag).toBeCalledWith(tag);
			});
		});
		it('Searches API for tags not in DB and returns correct array', async () => {
			// given
			const store = mockStore(initialState);
			const tagsString = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6'];
			const tags = [
				mTag({ tag: 'tag1' }),
				mTag({ tag: 'tag2' }),
				mTag({ tag: 'tag3' }),
				mTag({ tag: 'tag4' }),
				mTag({ tag: 'tag5' }),
				mTag({ tag: 'tag6' }),
			];
			mockedDb.tags.getTag.mockImplementation((tag) => {
				let value: Tag | undefined;
				if (tag === 'tag1') value = tags[0];
				if (tag === 'tag2') value = tags[1];
				if (tag === 'tag3') value = tags[2];

				return Promise.resolve(value);
			});
			(getTagsByNames as jest.Mock).mockResolvedValue(tags.slice(3));

			// when
			const result = await store.dispatch(thunks.fetchTags(tagsString));

			// then
			expect(getTagsByNames).toBeCalledWith(tagsString.slice(3), store.getState().settings.apiKey);
			expect(result).toStrictEqual(tags);
		});
	});
});
