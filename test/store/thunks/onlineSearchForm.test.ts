import { doDatabaseMock, mockedDb } from '../../helpers/database.mock';
doDatabaseMock();

import { initialState } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as thunks from '../../../src/store/thunks/onlineSearchForm';
import { mPost, mTag } from '../../helpers/test.helper';

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
import { getTagsByPattern, getPostsForTags } from '../../../src/service/apiService';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('thunks/onlineSearchForm', () => {
	describe('postApiOptions()', () => {
		it('Constructs object correctly', () => {
			// given
			const store = mockStore({
				...initialState,
				settings: { ...initialState.settings, apiKey: 'api_key' },
				onlineSearchForm: { ...initialState.onlineSearchForm, limit: 20, page: 5, rating: 'explicit', sort: 'rating', sortOrder: 'desc' },
			});

			// when
			const state = store.getState();
			const incrementedResult = thunks.getPostApiOptions(state, true);
			const nonIncrementedResult = thunks.getPostApiOptions(state, false);

			// then
			const searchFormState = state.onlineSearchForm;
			expect(incrementedResult.apiKey).toBe(state.settings.apiKey);
			expect(incrementedResult.limit).toBe(searchFormState.limit);
			expect(incrementedResult.page).toBe(searchFormState.page + 1);
			expect(incrementedResult.rating).toBe(searchFormState.rating);
			expect(incrementedResult.sort).toBe(searchFormState.sort);
			expect(incrementedResult.sortOrder).toBe(searchFormState.sortOrder);
			expect(nonIncrementedResult.page).toBe(searchFormState.page);
		});
	});
	describe('checkPostsAgainstDb()', () => {
		it('Calls db with correct parameters and returns posts', async () => {
			// given
			const store = mockStore(initialState);
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 }), mPost({ id: 4 })];
			mockedDb.posts.bulkSaveOrUpdateFromApi.mockResolvedValue(posts);

			// when
			await store.dispatch(thunks.checkPostsAgainstDb(posts));

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.posts.bulkSaveOrUpdateFromApi).toBeCalledWith(posts);
			expect(dispatchedActions[0]).toMatchObject({ type: 'onlineSearchForm/checkPostsAgainstDb/pending', payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: 'onlineSearchForm/checkPostsAgainstDb/fulfilled', payload: posts });
		});
	});
	describe('getTagsByPatternFromApi()', () => {
		it('Calls db with correct parameters and returns posts', async () => {
			// given
			const store = mockStore(initialState);
			const pattern = 'tag_pattern';
			const tags = [mTag({ tag: 'tag1', id: 1 }), mTag({ tag: 'tag2', id: 2 }), mTag({ tag: 'tag2', id: 2 })];
			(getTagsByPattern as jest.Mock).mockResolvedValueOnce(tags);

			// when
			await store.dispatch(thunks.getTagsByPatternFromApi(pattern));

			// then
			const dispatchedActions = store.getActions();
			expect(getTagsByPattern).toBeCalledWith(pattern, store.getState().settings.apiKey);
			expect(dispatchedActions[0]).toMatchObject({ type: 'onlineSearchForm/getTagsByPatternFromApi/pending', payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: 'onlineSearchForm/getTagsByPatternFromApi/fulfilled', payload: tags });
		});
	});
	describe('fetchPosts()', () => {
		it('Calls api with correct tags and returns posts', async () => {
			// given
			const selectedTags = [mTag({ tag: 'tag1' }), mTag({ tag: 'tag2' })];
			const excludedTags = [mTag({ tag: 'excluded_tag1' }), mTag({ tag: 'excluded_tag2' })];
			const store = mockStore({ ...initialState, onlineSearchForm: { ...initialState.onlineSearchForm, selectedTags, excludedTags } });
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 }), mPost({ id: 4 })];
			(getPostsForTags as jest.Mock).mockResolvedValueOnce(posts);

			// when
			await store.dispatch(thunks.fetchPosts());

			// then
			const dispatchedActions = store.getActions();
			expect(getPostsForTags).toBeCalledWith(
				selectedTags.map((tag) => tag.tag),
				thunks.getPostApiOptions(store.getState()),
				excludedTags.map((tag) => tag.tag)
			);
			expect(mockedDb.tagSearchHistory.saveSearch).toBeCalledWith(selectedTags);
			expect(dispatchedActions[0]).toMatchObject({ type: 'onlineSearchForm/fetchPosts/pending', payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: 'onlineSearchForm/checkPostsAgainstDb/pending', meta: { arg: posts } });
			expect(dispatchedActions[2]).toMatchObject({ type: 'onlineSearchForm/checkPostsAgainstDb/fulfilled' });
			expect(dispatchedActions[3]).toMatchObject({ type: 'onlineSearchForm/fetchPosts/fulfilled', payload: posts });
		});
	});
	describe('fetchMorePosts()', () => {
		it('Calls api with correct tags and returns posts', async () => {
			// given
			const selectedTags = [mTag({ tag: 'tag1' }), mTag({ tag: 'tag2' })];
			const excludedTags = [mTag({ tag: 'excluded_tag1' }), mTag({ tag: 'excluded_tag2' })];
			const store = mockStore({ ...initialState, onlineSearchForm: { ...initialState.onlineSearchForm, selectedTags, excludedTags } });
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 }), mPost({ id: 4 })];
			(getPostsForTags as jest.Mock).mockResolvedValueOnce(posts);

			// when
			await store.dispatch(thunks.fetchMorePosts());

			// then
			const dispatchedActions = store.getActions();
			expect(getPostsForTags).toBeCalledWith(
				selectedTags.map((tag) => tag.tag),
				thunks.getPostApiOptions(store.getState(), true),
				excludedTags.map((tag) => tag.tag)
			);
			expect(dispatchedActions[0]).toMatchObject({ type: 'onlineSearchForm/fetchMorePosts/pending', payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: 'onlineSearchForm/checkPostsAgainstDb/pending', meta: { arg: posts } });
			expect(dispatchedActions[2]).toMatchObject({ type: 'onlineSearchForm/checkPostsAgainstDb/fulfilled' });
			expect(dispatchedActions[3]).toMatchObject({ type: 'onlineSearchForm/fetchMorePosts/fulfilled', payload: posts });
		});
	});
});
