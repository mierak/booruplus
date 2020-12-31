import { doDatabaseMock, mockedDb } from '../../helpers/database.mock';
doDatabaseMock();
import { enableFetchMocks } from 'jest-fetch-mock';
enableFetchMocks();

import { initialState } from '../../../src/store';
import type { RootState, AppDispatch, SearchContext } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as thunks from '../../../src/store/thunks/tags';
import * as downloadedSearchFormThunk from '../../../src/store/thunks/offlineSearches';
import * as onlineSearchFormThunk from '../../../src/store/thunks/onlineSearches';
import { mTag } from '../../helpers/test.helper';
import { mState } from '../../helpers/store.helper';
import { Tag } from '@appTypes/gelbooruTypes';

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
import { generateTabContext } from '@util/utils';

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
			const store = mockStore(
				mState({
					searchContexts: {
						['1']: {},
					},
				})
			);
			const tag = mTag({ tag: 'tag1' });
			const context = generateTabContext(Object.keys(store.getState().searchContexts));
			const data: Partial<SearchContext> = {
				mode: 'online',
				selectedTags: [tag],
			};

			// when
			await store.dispatch(thunks.searchTagOnline(tag));

			// then
			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainMatchingAction({ type: thunks.searchTagOnline.pending.type, payload: undefined });
			expect(dispatchedActions).toContainMatchingAction({
				type: onlineSearchFormThunk.fetchPosts.pending.type,
				payload: undefined,
			});
			expect(dispatchedActions).toContainMatchingAction({ type: 'common/initPostsContext', payload: { context, data } });
		});
	});
	describe('searchTagOffline()', () => {
		it('Dispatches correct actions', async () => {
			// given
			const store = mockStore(
				mState({
					searchContexts: {
						['1']: {},
					},
				})
			);
			const tag = mTag({ tag: 'tag1' });
			const context = generateTabContext(Object.keys(store.getState().searchContexts));
			const data: Partial<SearchContext> = {
				mode: 'offline',
				selectedTags: [tag],
			};

			// when
			await store.dispatch(thunks.searchTagOffline(tag));

			// then
			const dispatchedActions = store.getActions();
			expect(dispatchedActions).toContainMatchingAction({
				type: thunks.searchTagOffline.pending.type,
				payload: undefined,
			});
			expect(dispatchedActions).toContainMatchingAction({
				type: downloadedSearchFormThunk.fetchPosts.pending.type,
				payload: undefined,
			});
			expect(dispatchedActions).toContainMatchingAction({ type: 'common/initPostsContext', payload: { context, data } });
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
			const downloadedCounts: { [key: string]: number } = {
				tag1: 1,
				tag2: 2,
				tag3: 3,
				tag4: 4,
				tag5: 5,
				tag6: 6,
			};
			const blacklistedCounts: { [key: string]: number } = {
				tag1: 7,
				tag2: 8,
				tag3: 9,
				tag4: 10,
				tag5: 11,
				tag6: 12,
			};
			const favoriteCounts: { [key: string]: number } = {
				tag1: 13,
				tag2: 14,
				tag3: 15,
				tag4: 16,
				tag5: 17,
				tag6: 18,
			};
			const searchParams = {
				pattern: 'tag_pattern',
				limit: 50,
				offset: 10,
			};
			mockedDb.tags.getAllWithLimitAndOffset.mockResolvedValue(tags);
			mockedDb.favorites.getAllFavoriteTagsWithCounts.mockResolvedValueOnce(favoriteCounts);
			mockedDb.tags.getBlacklistedAndDownloadedCounts.mockResolvedValueOnce({ blacklistedCounts, downloadedCounts });

			// when
			await store.dispatch(thunks.loadAllWithLimitAndOffset(searchParams));

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.tags.getAllWithLimitAndOffset).toBeCalledWith(searchParams);
			expect(dispatchedActions[0]).toMatchObject({
				type: thunks.loadAllWithLimitAndOffset.pending.type,
				payload: undefined,
			});
			expect(dispatchedActions[1]).toMatchObject({
				type: thunks.loadAllWithLimitAndOffset.fulfilled.type,
				payload: tags.map((tag) => ({
					...tag,
					downloadedCount: downloadedCounts[tag.tag],
					blacklistedCount: blacklistedCounts[tag.tag],
					favoriteCount: favoriteCounts[tag.tag],
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
