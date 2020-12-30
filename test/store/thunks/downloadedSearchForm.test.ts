import { doDatabaseMock, mockedDb } from '../../helpers/database.mock';
doDatabaseMock();

import { initialState } from '../../../src/store';
import { RootState, AppDispatch, DownloadedSearchFormState } from '@store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as thunks from '../../../src/store/thunks/downloadedSearchForm';
import { mPost, mTag } from '../../helpers/test.helper';
import { mState } from '../../helpers/store.helper';
import { Tag } from '@appTypes/gelbooruTypes';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('thunks/downloadedSearchForm', () => {
	describe('getFilterOptions()', () => {
		it('Constructs object correctly', () => {
			// given
			const downloadedSearchFormState: DownloadedSearchFormState = {
				mode: 'online',
				page: 5,
				limit: 20,
				rating: 'explicit',
				showBlacklisted: false,
				showFavorites: true,
				showGifs: true,
				showImages: true,
				showVideos: false,
				showNonBlacklisted: true,
				sort: 'rating',
				sortOrder: 'asc',
				tagOptions: [],
				selectedTags: [],
				excludedTags: [],
			};

			// when
			const result = thunks.getFilterOptions(downloadedSearchFormState);

			// then
			expect(result.blacklisted).toBe(downloadedSearchFormState.showBlacklisted);
			expect(result.limit).toBe(downloadedSearchFormState.limit);
			expect(result.nonBlacklisted).toBe(downloadedSearchFormState.showNonBlacklisted);
			expect(result.offset).toBe(downloadedSearchFormState.limit * downloadedSearchFormState.page);
			expect(result.rating).toBe(downloadedSearchFormState.rating);
			expect(result.sort).toBe(downloadedSearchFormState.sort);
			expect(result.sortOrder).toBe(downloadedSearchFormState.sortOrder);
			expect(result.showGifs).toBe(downloadedSearchFormState.showGifs);
			expect(result.showFavorites).toBe(downloadedSearchFormState.showFavorites);
			expect(result.showImages).toBe(downloadedSearchFormState.showImages);
			expect(result.showVideos).toBe(downloadedSearchFormState.showVideos);
		});
	});
	describe('loadTagsByPattern()', () => {
		it('Calls db with correct pattern and return tags', async () => {
			// given
			const context = 'ctx';
			const store = mockStore(initialState);
			const tags = [mTag({ tag: 'tag1', id: 1 }), mTag({ tag: 'tag2', id: 2 }), mTag({ tag: 'tag2', id: 2 })];
			const pattern = 'tag_pattern';
			mockedDb.tags.getByPattern.mockResolvedValue(tags);

			// when
			await store.dispatch(thunks.loadTagsByPattern({ context, pattern }));

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.tags.getByPattern).toBeCalledWith(pattern);
			expect(dispatchedActions[0]).toMatchObject({
				type: 'downloadedSearchForm/loadTagsByPattern/pending',
				payload: undefined,
			});
			expect(dispatchedActions[1]).toMatchObject({
				type: 'downloadedSearchForm/loadTagsByPattern/fulfilled',
				payload: tags,
			});
		});
	});
	describe('fetchPosts()', () => {
		it('Calls db with correct tags and return posts', async () => {
			// given
			const context = 'ctx';
			const selectedTags = [mTag({ tag: 'tag1' }), mTag({ tag: 'tag2' })];
			const excludedTags = [mTag({ tag: 'excluded_tag1' }), mTag({ tag: 'excluded_tag2' })];
			const store = mockStore(
				mState({
					onlineSearchForm: {
						[context]: {
							...initialState.onlineSearchForm.default,
							selectedTags,
							excludedTags,
						},
					},
				})
			);
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 }), mPost({ id: 4 })];
			mockedDb.posts.getForTagsWithOptions.mockResolvedValue(posts);

			// when
			await store.dispatch(thunks.fetchPosts({ context }));

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.posts.getForTagsWithOptions).toBeCalledWith(
				thunks.getFilterOptions(store.getState().onlineSearchForm[context]),
				selectedTags.map((tag) => tag.tag),
				excludedTags.map((tag) => tag.tag)
			);
			expect(mockedDb.tagSearchHistory.saveSearch).toBeCalledWith(selectedTags);
			expect(dispatchedActions[0]).toMatchObject({ type: 'downloadedSearchForm/fetchPosts/pending', payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: 'downloadedSearchForm/fetchPosts/fulfilled', payload: posts });
		});
		it('Fetches all posts when no tags or selected tags are provide', async () => {
			// given
			const context = 'ctx';
			const selectedTags: Tag[] = [];
			const excludedTags: Tag[] = [];
			const store = mockStore(
				mState({
					onlineSearchForm: {
						[context]: {
							...initialState.onlineSearchForm.default,
							selectedTags,
							excludedTags,
						},
					},
				})
			);
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 }), mPost({ id: 4 })];
			mockedDb.posts.getAllWithOptions.mockResolvedValue(posts);

			// when
			await store.dispatch(thunks.fetchPosts({ context }));

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.posts.getAllWithOptions).toBeCalledWith(
				thunks.getFilterOptions(store.getState().onlineSearchForm[context])
			);
			expect(mockedDb.tagSearchHistory.saveSearch).toBeCalledWith(selectedTags);
			expect(dispatchedActions[0]).toMatchObject({ type: 'downloadedSearchForm/fetchPosts/pending', payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: 'downloadedSearchForm/fetchPosts/fulfilled', payload: posts });
		});
	});
	describe('fetchMorePosts()', () => {
		it('Calls db with correct tags and return posts', async () => {
			// given
			const context = 'ctx';
			const selectedTags = [mTag({ tag: 'tag1' }), mTag({ tag: 'tag2' })];
			const excludedTags = [mTag({ tag: 'excluded_tag1' }), mTag({ tag: 'excluded_tag2' })];
			const store = mockStore(
				mState({
					onlineSearchForm: {
						[context]: {
							...initialState.onlineSearchForm.default,
							selectedTags,
							excludedTags,
						},
					},
				})
			);
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 }), mPost({ id: 4 })];
			mockedDb.posts.getForTagsWithOptions.mockResolvedValue(posts);

			// when
			await store.dispatch(thunks.fetchMorePosts({ context }));

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.posts.getForTagsWithOptions).toBeCalledWith(
				thunks.getFilterOptions(store.getState().onlineSearchForm[context]),
				selectedTags.map((tag) => tag.tag),
				excludedTags.map((tag) => tag.tag)
			);
			expect(mockedDb.tagSearchHistory.saveSearch).toBeCalledWith(selectedTags);
			expect(dispatchedActions[0]).toMatchObject({
				type: 'downloadedSearchForm/fetchMorePosts/pending',
				payload: undefined,
			});
			expect(dispatchedActions[1]).toMatchObject({
				type: 'downloadedSearchForm/fetchMorePosts/fulfilled',
				payload: posts,
			});
		});
		it('Fetches all posts when no tags or selected tags are provide', async () => {
			// given
			const context = 'ctx';
			const selectedTags: Tag[] = [];
			const excludedTags: Tag[] = [];
			const store = mockStore(
				mState({
					onlineSearchForm: {
						[context]: {
							...initialState.onlineSearchForm.default,
							selectedTags,
							excludedTags,
						},
					},
				})
			);
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 }), mPost({ id: 4 })];
			mockedDb.posts.getAllWithOptions.mockResolvedValue(posts);

			// when
			await store.dispatch(thunks.fetchMorePosts({ context }));

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.posts.getAllWithOptions).toBeCalledWith(
				thunks.getFilterOptions(store.getState().onlineSearchForm[context])
			);
			expect(mockedDb.tagSearchHistory.saveSearch).toBeCalledWith(selectedTags);
			expect(dispatchedActions[0]).toMatchObject({
				type: 'downloadedSearchForm/fetchMorePosts/pending',
				payload: undefined,
			});
			expect(dispatchedActions[1]).toMatchObject({
				type: 'downloadedSearchForm/fetchMorePosts/fulfilled',
				payload: posts,
			});
		});
	});
});
