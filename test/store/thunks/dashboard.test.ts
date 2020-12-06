import { doDatabaseMock, mockedDb } from '../../helpers/database.mock';
doDatabaseMock();

import { initialState } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as thunks from '../../../src/store/thunks/dashboard';
import { mTagHistory, mTag, mPost } from '../../helpers/test.helper';
import { Tag } from '@appTypes/gelbooruTypes';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

jest.mock('../../../src/util/utils', () => {
	const originalModule = jest.requireActual('../../../src/util/utils');
	return {
		...originalModule,
		__esModule: true,
		delay: jest.fn().mockImplementation(() => null),
	};
});
jest.mock('../../../src/service/apiService', () => {
	const originalModule = jest.requireActual('../../../src/service/apiService');
	return {
		...originalModule,
		__esModule: true,
		getTagsByNames: jest.fn(),
	};
});
import { getTagsByNames } from '../../../src/service/apiService';

describe('thunks/dashboard', () => {
	describe('fetchDownloadedPostCount()', () => {
		it('Calls db and returns correct values', async () => {
			// given
			const store = mockStore(initialState);
			mockedDb.posts.getDownloadedCount.mockResolvedValue(456);

			// when
			await store.dispatch(thunks.fetchDownloadedPostCount());

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.posts.getDownloadedCount).toBeCalledTimes(1);
			expect(dispatchedActions[0]).toMatchObject({
				type: 'dashboard/fetchDownloadedPostCount/pending',
				payload: undefined,
			});
			expect(dispatchedActions[1]).toMatchObject({ type: 'dashboard/fetchDownloadedPostCount/fulfilled', payload: 456 });
		});
	});
	describe('fetchBlacklistedPostCount()', () => {
		it('Calls db and returns correct values', async () => {
			// given
			const store = mockStore(initialState);
			mockedDb.posts.getBlacklistedCount.mockResolvedValue(456);

			// when
			await store.dispatch(thunks.fetchBlacklistedPostCount());

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.posts.getBlacklistedCount).toBeCalledTimes(1);
			expect(dispatchedActions[0]).toMatchObject({
				type: 'dashboard/fetchBlacklistedPostCount/pending',
				payload: undefined,
			});
			expect(dispatchedActions[1]).toMatchObject({ type: 'dashboard/fetchBlacklistedPostCount/fulfilled', payload: 456 });
		});
	});
	describe('fetchFavoritePostCount()', () => {
		it('Calls db and returns correct values', async () => {
			// given
			const store = mockStore(initialState);
			const postIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
			mockedDb.favorites.getlAllPostIds.mockResolvedValue(postIds);

			// when
			await store.dispatch(thunks.fetchFavoritePostCount());

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.favorites.getlAllPostIds).toBeCalledTimes(1);
			expect(dispatchedActions[0]).toMatchObject({ type: 'dashboard/fetchFavoritePostCount/pending', payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({
				type: 'dashboard/fetchFavoritePostCount/fulfilled',
				payload: postIds.length,
			});
		});
	});
	describe('fetchTagCount()', () => {
		it('Calls db and returns correct values', async () => {
			// given
			const store = mockStore(initialState);
			mockedDb.tags.getCount.mockResolvedValue(456);

			// when
			await store.dispatch(thunks.fetchTagCount());

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.tags.getCount).toBeCalledTimes(1);
			expect(dispatchedActions[0]).toMatchObject({ type: 'dashboard/fetchTagCount/pending', payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: 'dashboard/fetchTagCount/fulfilled', payload: 456 });
		});
	});
	describe('fetchRatingCounts()', () => {
		it('Calls db and returns correct values', async () => {
			// given
			const store = mockStore(initialState);
			const counts = {
				explicit: 10,
				questionable: 100,
				safe: 1000,
			};
			mockedDb.posts.getCountForRating.mockImplementation((rating) => {
				switch (rating) {
					case 'any':
						return Promise.resolve(0);
					case 'explicit':
						return Promise.resolve(counts.explicit);
					case 'questionable':
						return Promise.resolve(counts.questionable);
					case 'safe':
						return Promise.resolve(counts.safe);
				}
			});

			// when
			await store.dispatch(thunks.fetchRatingCounts());

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.posts.getCountForRating).toBeCalledTimes(3);
			expect(dispatchedActions[0]).toMatchObject({ type: 'dashboard/fetchRatingCounts/pending', payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: 'dashboard/fetchRatingCounts/fulfilled', payload: counts });
		});
	});
	describe('fetchMostSearchedTags()', () => {
		it('Calls db and returns correct values', async () => {
			// given
			const store = mockStore(initialState);
			const tagHistories = [
				mTagHistory({ count: 123, tag: mTag({ tag: 'tag1' }) }),
				mTagHistory({ count: 256, tag: mTag({ id: 2, tag: 'tag2' }) }),
			];
			mockedDb.tagSearchHistory.getMostSearched.mockResolvedValue(tagHistories);

			// when
			await store.dispatch(thunks.fetchMostSearchedTags());

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.tags.getCount).toBeCalledTimes(1);
			expect(dispatchedActions[0]).toMatchObject({ type: 'dashboard/fetchMostSearchedTags/pending', payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({
				type: 'dashboard/fetchMostSearchedTags/fulfilled',
				payload: tagHistories,
			});
		});
	});
	describe('fetchMostViewedPosts()', () => {
		it('Calls db and returns correct values', async () => {
			// given
			const store = mockStore(initialState);
			const posts = [mPost({ id: 1 }), mPost({ id: 2 })];
			mockedDb.posts.getMostViewed.mockResolvedValue(posts);

			// when
			await store.dispatch(thunks.fetchMostViewedPosts());

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.posts.getMostViewed).toBeCalledTimes(1);
			expect(dispatchedActions[0]).toMatchObject({ type: 'dashboard/fetchMostViewedPosts/pending', payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: 'dashboard/fetchMostViewedPosts/fulfilled', payload: posts });
		});
	});
	describe('fetchMostFavoritedTags()', () => {
		it('Calls db and returns correct values', async () => {
			// given
			const store = mockStore({
				...initialState,
				settings: {
					...initialState.settings,
					dashboard: { ...initialState.settings.dashboard, saveTagsNotFoundInDb: true },
				},
			});
			const tagsWithCount = { tag1: 1, tag2: 2, tag3: 3, tag4: 0 };
			const tagNotInDb = mTag({ tag: 'tag4', id: 4 });
			mockedDb.favorites.getAllFavoriteTagsWithCounts.mockResolvedValue(tagsWithCount);
			(getTagsByNames as jest.Mock).mockResolvedValueOnce([tagNotInDb]);
			const tagsInDb = [mTag({ tag: 'tag1', id: 1 }), mTag({ tag: 'tag2', id: 2 }), mTag({ tag: 'tag3', id: 3 })];
			mockedDb.tags.getTag.mockImplementation((tag) => {
				let result: Tag | undefined = undefined;
				if (tag === 'tag1') result = tagsInDb[0];
				if (tag === 'tag2') result = tagsInDb[1];
				if (tag === 'tag3') result = tagsInDb[2];
				return Promise.resolve(result);
			});
			const expected = [
				{ tag: tagsInDb[2], count: tagsWithCount.tag3 },
				{ tag: tagsInDb[1], count: tagsWithCount.tag2 },
				{ tag: tagsInDb[0], count: tagsWithCount.tag1 },
				{ tag: tagNotInDb, count: tagsWithCount.tag4 },
			];

			// when
			await store.dispatch(thunks.fetchMostFavoritedTags());

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.posts.getMostViewed).toBeCalledTimes(1);
			expect(mockedDb.tags.save).toBeCalledWith(tagNotInDb);
			expect(dispatchedActions[0]).toMatchObject({ type: 'dashboard/fetchMostFavoritedTags/pending', payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({
				type: 'dashboard/fetchMostFavoritedTags/fulfilled',
				payload: expected,
			});
		});
		it('Returns rejected action if tag was not found in DB neither returned from API', async () => {
			// given
			const store = mockStore(initialState);
			const tagsWithCount = { tag1: 1, tag2: 2, tag3: 3, tag4: 0 };
			const tagNotInDb = mTag({ tag: 'tag4', id: 4 });
			mockedDb.favorites.getAllFavoriteTagsWithCounts.mockResolvedValue(tagsWithCount);
			(getTagsByNames as jest.Mock).mockResolvedValueOnce([]);
			const tagsInDb = [mTag({ tag: 'tag1', id: 1 }), mTag({ tag: 'tag2', id: 2 }), mTag({ tag: 'tag3', id: 3 })];
			mockedDb.tags.getTag.mockImplementation((tag) => {
				let result: Tag | undefined = undefined;
				if (tag === 'tag1') result = tagsInDb[0];
				if (tag === 'tag2') result = tagsInDb[1];
				if (tag === 'tag3') result = tagsInDb[2];
				return Promise.resolve(result);
			});

			// when
			await store.dispatch(thunks.fetchMostFavoritedTags());

			// then
			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toMatchObject({ type: 'dashboard/fetchMostFavoritedTags/pending', payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({
				type: 'dashboard/fetchMostFavoritedTags/rejected',
				payload: undefined,
				error: {
					message: `Could not download tags not found in DB, because they were not returned from API. Tags in question: ${[
						tagNotInDb,
					].join(' ')}`,
				},
			});
		});
	});
});
