import { doDatabaseMock, mockedDb } from '../../helpers/database.mock';
doDatabaseMock();
import { enableFetchMocks } from 'jest-fetch-mock';
enableFetchMocks();

import { MockedStore } from '../../helpers/types.helper';
import { initialState } from '../../../src/store';
import { RootState, AppDispatch, Task, DownloadTaskState } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as thunks from '../../../src/store/thunks/posts';
import { actions as tasksActions } from '../../../src/store/tasks';
import { mTag, mPost } from '../../helpers/test.helper';
import { Post, PostSearchOptions } from '@appTypes/gelbooruTypes';

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
import { getTagsByNames, getPostsForTags } from '../../../src/service/apiService';
jest.mock('../../../src/util/imageIpcUtils', () => {
	const deleteImage = jest.fn();
	const saveImage = jest.fn();
	return {
		__esModule: true,
		deleteImage: jest.fn(() => deleteImage),
		saveImage: jest.fn(() => saveImage),
	};
});
import { deleteImage } from '../../../src/util/imageIpcUtils';
import { mState } from '../../helpers/store.helper';
jest.mock('../../../src/util/utils', () => {
	const originalModule = jest.requireActual('../../../src/util/utils');
	return {
		...originalModule,
		__esModule: true,
		delay: jest.fn().mockImplementation(() => null),
	};
});

describe('thunks/posts', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});
	describe('deduplicateAndCheckTagsAgainstDb()', () => {
		it('Does not return duplicates and tags that exist in db', async () => {
			// given
			const tags = ['tag1', 'tag1', 'tag2', 'tag2', 'tag3', 'tag4', 'tag5'];
			const deduplicated = [...new Set(tags)];
			mockedDb.tags.checkIfExists.mockImplementation((tag) => {
				let value = false;
				if (tag === tags[0]) value = true;
				if (tag === tags[2]) value = true;
				if (tag === tags[4]) value = true;
				return Promise.resolve(value);
			});

			// when
			const result = await thunks.deduplicateAndCheckTagsAgainstDb(tags);

			// then
			expect(result).toEqual(['tag4', 'tag5']);
			deduplicated.forEach((tag) => {
				expect(mockedDb.tags.checkIfExists).toBeCalledWith(tag);
			});
		});
	});
	describe('copyAndBlacklist()', () => {
		it('Clones post and changes its properties', () => {
			// given
			const post = mPost({ blacklisted: 0, downloaded: 1, selected: true });

			// when
			const result = thunks.copyAndBlacklistPost(post);

			// then
			expect(result.blacklisted).toBe(1);
			expect(result.downloaded).toBe(0);
			expect(result.selected).toBe(false);
			expect(post.blacklisted).toBe(0);
			expect(post.downloaded).toBe(1);
			expect(post.selected).toBe(true);
		});
	});
	describe('downloadTags()', () => {
		it('Calls deduplicate, api, db and returns results', async () => {
			// given
			const store = mockStore(initialState);
			const tags = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'];
			const tagsFromApi = [
				mTag({ tag: 'tag1' }),
				mTag({ tag: 'tag2' }),
				mTag({ tag: 'tag3' }),
				mTag({ tag: 'tag4' }),
				mTag({ tag: 'tag5' }),
			];
			(getTagsByNames as jest.Mock).mockResolvedValue(tagsFromApi);

			// when
			await store.dispatch(thunks.downloadTags(tags));

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.tags.bulkPut).toBeCalledWith(tagsFromApi);
			expect(dispatchedActions[0]).toMatchObject({ type: thunks.downloadTags.pending.type, payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: thunks.downloadTags.fulfilled.type, payload: tagsFromApi });
		});
	});
	describe('cancelPostDownload()', () => {
		it('It changes all posts to not downloaded and calls deleteImage for each post', async () => {
			// given
			const store = mockStore(initialState);
			const posts = [
				mPost({ downloaded: 1, id: 1 }),
				mPost({ downloaded: 1, id: 2 }),
				mPost({ downloaded: 1, id: 3 }),
				mPost({ downloaded: 1, id: 4 }),
			];

			// when
			await store.dispatch(thunks.cancelPostsDownload(posts));

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.posts.bulkSave).toBeCalledWith(
				posts.map((post) => {
					return {
						...post,
						downloaded: 0,
					};
				})
			);
			posts.forEach((post) => {
				expect(deleteImage).toBeCalledWith(post);
			});
			expect(dispatchedActions[0]).toMatchObject({ type: thunks.cancelPostsDownload.pending.type, payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: thunks.cancelPostsDownload.fulfilled.type, payload: undefined });
		});
	});
	describe('fetchPostsById()', () => {
		it('Calls db with correct ids', async () => {
			// given
			const store = mockStore(initialState);
			const postIds = [1, 2, 3, 4, 5];
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 }), mPost({ id: 4 })];
			mockedDb.posts.getBulk.mockResolvedValue(posts);

			// when
			await store.dispatch(thunks.fetchPostsByIds(postIds));

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.posts.getBulk).toBeCalledWith(postIds);
			expect(dispatchedActions[0]).toMatchObject({ type: thunks.fetchPostsByIds.pending.type, payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: thunks.fetchPostsByIds.fulfilled.type, payload: posts });
		});
	});
	describe('downloadPost()', () => {
		it('Clones and updates posts', async () => {
			// given
			const store = mockStore(initialState);
			const post = mPost({ blacklisted: 1, downloaded: 0, tags: ['tag1', 'tag2'] });

			// when
			const result = await store.dispatch(thunks.downloadPost({ post }));

			// then
			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toMatchObject({ type: thunks.downloadPost.pending.type, payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: thunks.downloadTags.pending.type, meta: { arg: post.tags } });
			expect(dispatchedActions[2]).toMatchObject({ type: thunks.downloadTags.fulfilled.type });
			expect(dispatchedActions[3]).toMatchObject({ type: thunks.downloadPost.fulfilled.type, payload: { blacklisted: 0, downloaded: 1 } });
			expect(mockedDb.posts.update).toBeCalledWith(result.payload);
		});
	});
	describe('downloadPost()', () => {
		it('Clones and updates posts', async () => {
			// given
			const store = mockStore(initialState);
			const post = mPost({ blacklisted: 1, downloaded: 0, tags: ['tag1', 'tag2'] });

			// when
			const result = await store.dispatch(thunks.downloadPost({ post }));

			// then
			const dispatchedActions = store.getActions();
			expect(dispatchedActions[0]).toMatchObject({ type: thunks.downloadPost.pending.type, payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: thunks.downloadTags.pending.type, meta: { arg: post.tags } });
			expect(dispatchedActions[2]).toMatchObject({ type: thunks.downloadTags.fulfilled.type });
			expect(dispatchedActions[3]).toMatchObject({ type: thunks.downloadPost.fulfilled.type, payload: { blacklisted: 0, downloaded: 1 } });
			expect(mockedDb.posts.update).toBeCalledWith(result.payload);
		});
	});
	describe('downloadPosts()', () => {
		let store: MockedStore;
		beforeEach(() => {
			store = mockStore({
				...initialState,
				tasks: {
					lastId: 1,
					tasks: {
						1: {
							id: 1,
							items: 5,
							itemsDone: 0,
							postIds: [1, 2, 3, 4, 5],
							state: 'preparing',
							timestampStarted: Date.now(),
						},
					},
				},
			});
		});
		it('Calls downloadPost() for each post', async () => {
			// given
			const posts = [
				mPost({ id: 1, tags: ['tag1', 'tag2'], downloaded: 0 }),
				mPost({ id: 2, tags: ['tag3', 'tag4'], downloaded: 0 }),
				mPost({ id: 3, tags: ['tag5', 'tag6'], downloaded: 0 }),
				mPost({ id: 4, tags: ['tag7', 'tag8'], downloaded: 0 }),
			];

			// when
			await store.dispatch(thunks.downloadPosts({ posts }));

			// then
			const dispatchedActions = store.getActions();
			expect(dispatchedActions[1]).toMatchObject({ type: thunks.downloadPost.pending.type, meta: { arg: { post: posts[0] } } });
			expect(dispatchedActions[2]).toMatchObject({ type: thunks.downloadPost.pending.type, meta: { arg: { post: posts[1] } } });
			expect(dispatchedActions[4]).toMatchObject({ type: thunks.downloadPost.pending.type, meta: { arg: { post: posts[2] } } });
			expect(dispatchedActions[6]).toMatchObject({ type: thunks.downloadPost.pending.type, meta: { arg: { post: posts[3] } } });
		});
		it('Skips post when it is already downloaded', async () => {
			// given
			const posts = [
				mPost({ id: 1, tags: ['tag1', 'tag2'], downloaded: 0 }),
				mPost({ id: 2, tags: ['tag3', 'tag4'], downloaded: 1 }),
				mPost({ id: 3, tags: ['tag5', 'tag6'], downloaded: 1 }),
				mPost({ id: 4, tags: ['tag7', 'tag8'], downloaded: 0 }),
			];

			// when
			await store.dispatch(thunks.downloadPosts({ posts }));

			// then
			const dispatchedActions = store.getActions();
			expect(dispatchedActions[1]).toMatchObject({ type: thunks.downloadPost.pending.type, meta: { arg: { post: posts[0] } } });
			expect(dispatchedActions[3]).toMatchObject({ type: thunks.downloadPost.pending.type, meta: { arg: { post: posts[3] } } });
		});
		it('Dispatches cancelPostDownload with appropriate posts when task state is set to cancelled', async () => {
			// given
			store = mockStore({
				...initialState,
				tasks: {
					lastId: 1,
					tasks: {
						1: {
							id: 1,
							items: 5,
							itemsDone: 0,
							postIds: [1, 2, 3, 4, 5],
							state: 'canceled',
							timestampStarted: Date.now(),
						},
					},
				},
			});
			const posts = [
				mPost({ id: 1, tags: ['tag1', 'tag2'], downloaded: 0 }),
				mPost({ id: 2, tags: ['tag3', 'tag4'], downloaded: 0 }),
				mPost({ id: 3, tags: ['tag5', 'tag6'], downloaded: 0 }),
				mPost({ id: 4, tags: ['tag7', 'tag8'], downloaded: 0 }),
			];
			store.dispatch(tasksActions.setState({ id: 1, value: 'canceled' }));

			// when
			await store.dispatch(thunks.downloadPosts({ posts }));

			// then
			const dispatchedActions = store.getActions();
			expect(dispatchedActions[3]).toMatchObject({ type: thunks.cancelPostsDownload.pending.type, meta: { arg: [posts[0]] } });
		});
	});
	describe('downloadSelectedPosts()', () => {
		it('Filters only selected posts and dispatches downloadPosts with them', async () => {
			// given
			const posts = [
				mPost({ id: 0, selected: false }),
				mPost({ id: 1, selected: true }),
				mPost({ id: 2, selected: false }),
				mPost({ id: 3, selected: true }),
				mPost({ id: 4, selected: false }),
			];
			const store = mockStore({
				...initialState,
				posts: { ...initialState.posts, posts: { posts, favorites: [], mostViewed: [] } },
			});

			// when
			await store.dispatch(thunks.downloadSelectedPosts());

			// then
			const dispatchedActions = store.getActions();
			expect(dispatchedActions[1]).toMatchObject({
				type: thunks.downloadPosts.pending.type,
				meta: { arg: { posts: [posts[1], posts[3]] } },
			});
		});
		it('Throws error when there are no selected posts', async () => {
			// given
			const posts = [mPost({ id: 0, selected: false }), mPost({ id: 1, selected: false })];
			const store = mockStore({
				...initialState,
				posts: { ...initialState.posts, posts: { posts, favorites: [], mostViewed: [] } },
			});

			// when
			await store.dispatch(thunks.downloadSelectedPosts());

			// then
			const dispatchedActions = store.getActions();
			expect(dispatchedActions[1]).toMatchObject({
				type: thunks.downloadSelectedPosts.rejected.type,
				error: { message: 'No posts selected' },
			});
		});
	});
	describe('downloadAllPosts()', () => {
		it('Gets all posts from state and dispatches downloadPost()', async () => {
			// given
			const posts = [mPost({ id: 0 }), mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 }), mPost({ id: 4 })];
			const store = mockStore({
				...initialState,
				posts: { ...initialState.posts, posts: { posts, favorites: [], mostViewed: [] } },
			});

			// when
			await store.dispatch(thunks.downloadAllPosts());

			// then
			const dispatchedActions = store.getActions();
			expect(dispatchedActions[1]).toMatchObject({
				type: thunks.downloadPosts.pending.type,
				meta: { arg: { posts } },
			});
		});
		it('Throws error when there are no posts in state', async () => {
			// given
			const posts: Post[] = [];
			const store = mockStore({
				...initialState,
				posts: { ...initialState.posts, posts: { posts, favorites: [], mostViewed: [] } },
			});

			// when
			await store.dispatch(thunks.downloadAllPosts());

			// then
			const dispatchedActions = store.getActions();
			expect(dispatchedActions[1]).toMatchObject({
				type: thunks.downloadAllPosts.rejected.type,
				error: { message: 'No posts to download' },
			});
		});
	});
	describe('blacklistPosts()', () => {
		it('Calls deleteImage and DB for each post and returns changed Posts', async () => {
			// given
			const store = mockStore(initialState);
			const posts = [mPost({ id: 0, blacklisted: 0 }), mPost({ id: 1, blacklisted: 0 }), mPost({ id: 2, blacklisted: 0 })];
			const deletedPosts = posts.map((post) => thunks.copyAndBlacklistPost(post));

			// when
			await store.dispatch(thunks.blacklistPosts(posts));

			// then
			deletedPosts.forEach((post, index) => {
				expect(deleteImage).toBeCalledWith(posts[index]);
				expect(mockedDb.posts.update).toBeCalledWith(post);
			});
			const dispatchedActions = store.getActions();
			expect(dispatchedActions[1]).toMatchObject({ type: thunks.blacklistPosts.fulfilled.type, payload: deletedPosts });
		});
	});
	describe('blacklistSelectedPosts()', () => {
		it('Filters only selected posts and dispatches blacklistPosts with them', async () => {
			// given
			const posts = [
				mPost({ id: 0, selected: false }),
				mPost({ id: 1, selected: true }),
				mPost({ id: 2, selected: false }),
				mPost({ id: 3, selected: true }),
				mPost({ id: 4, selected: false }),
			];
			const store = mockStore({
				...initialState,
				posts: { ...initialState.posts, posts: { posts, favorites: [], mostViewed: [] } },
			});

			// when
			await store.dispatch(thunks.blacklistSelectedPosts());

			// then
			const dispatchedActions = store.getActions();
			expect(dispatchedActions[1]).toMatchObject({
				type: thunks.blacklistPosts.pending.type,
				meta: { arg: [posts[1], posts[3]] },
			});
		});
	});
	describe('blacklistAllPosts()', () => {
		it('Gets all posts from state and dispatches blacklistPosts()', async () => {
			// given
			const posts = [mPost({ id: 0 }), mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 }), mPost({ id: 4 })];
			const store = mockStore({
				...initialState,
				posts: { ...initialState.posts, posts: { posts, favorites: [], mostViewed: [] } },
			});

			// when
			await store.dispatch(thunks.blacklistAllPosts());

			// then
			const dispatchedActions = store.getActions();
			expect(dispatchedActions[1]).toMatchObject({
				type: thunks.blacklistPosts.pending.type,
				meta: { arg: posts },
			});
		});
	});
	describe('incrementViewCount()', () => {
		it('calls DB with the right post', async () => {
			// given
			const store = mockStore(initialState);
			const post = mPost({ id: 1 });

			// when
			store.dispatch(thunks.incrementViewCount(post));

			// then
			expect(mockedDb.posts.incrementViewcount).toBeCalledWith(post);
		});
	});
	describe('downloadWholeSearch()', () => {
		it('Calls api with correct arguments correct number of times and dispatches downloadPosts', async () => {
			// given
			const selectedTags = [mTag({ tag: 'tag1' }), mTag({ tag: 'tag2' })];
			const excludedTags = [mTag({ tag: 'tag3' }), mTag({ tag: 'tag4' })];
			const rating = 'explicit';
			const apiKey = 'api_key';
			const store = mockStore({
				...initialState,
				onlineSearchForm: {
					...initialState.onlineSearchForm,
					selectedTags,
					excludedTags,
					rating,
				},
				settings: {
					...initialState.settings,
					apiKey,
				},
			});
			const options: PostSearchOptions = {
				rating,
				apiKey,
				limit: 100,
				page: 0,
			};
			const posts = [mPost({ id: 0 }), mPost({ id: 1 }), mPost({ id: 2 })];
			(getPostsForTags as jest.Mock).mockImplementation((_: string[], options: PostSearchOptions, _2: string[]) => {
				const posts: Post[] = [];
				if (options.page === 0) posts.push(mPost({ id: 0 }));
				if (options.page === 1) posts.push(mPost({ id: 1 }));
				if (options.page === 2) posts.push(mPost({ id: 2 }));
				return Promise.resolve(posts);
			});

			// when
			await store.dispatch(thunks.downloadWholeSearch());

			// then
			const dispatchedActions = store.getActions();
			expect(getPostsForTags).toBeCalledWith(
				selectedTags.map((tag) => tag.tag),
				options,
				excludedTags.map((tag) => tag.tag)
			);
			expect(getPostsForTags).toBeCalledWith(
				selectedTags.map((tag) => tag.tag),
				{ ...options, page: 1 },
				excludedTags.map((tag) => tag.tag)
			);
			expect(getPostsForTags).toBeCalledWith(
				selectedTags.map((tag) => tag.tag),
				{ ...options, page: 2 },
				excludedTags.map((tag) => tag.tag)
			);
			expect(getPostsForTags).toBeCalledWith(
				selectedTags.map((tag) => tag.tag),
				{ ...options, page: 3 },
				excludedTags.map((tag) => tag.tag)
			);
			expect(getPostsForTags).toBeCalledTimes(4);
			expect(dispatchedActions[1]).toMatchObject({ type: thunks.downloadPosts.pending.type, meta: { arg: { posts } } });
		});
	});
	describe('persistTask()', () => {
		it('Saves correct task when all posts were downloaded and none skipped', async () => {
			// given
			const taskId = 123;
			const task: Task = {
				id: taskId,
				items: 100,
				itemsDone: 50,
				state: 'downloading',
				postIds: [],
				timestampStarted: 12345,
			};
			const taskState: DownloadTaskState = {
				taskId,
				canceled: false,
				downloaded: 100,
				skipped: 0,
			};
			const store = mockStore(
				mState({
					tasks: {
						tasks: {
							[taskId]: task,
						},
					},
				})
			);

			// when
			await store.dispatch(thunks.persistTask(taskState));

			// then
			expect(mockedDb.tasks.save).toBeCalledWith({ ...task, state: 'completed', itemsDone: 100, timestampDone: expect.anything() });
		});
		it('Saves correct task when no posts were downloaded and all skipped', async () => {
			// given
			const taskId = 123;
			const task: Task = {
				id: taskId,
				items: 100,
				itemsDone: 50,
				state: 'downloading',
				postIds: [],
				timestampStarted: 12345,
			};
			const taskState: DownloadTaskState = {
				taskId,
				canceled: false,
				downloaded: 0,
				skipped: 100,
			};
			const store = mockStore(
				mState({
					tasks: {
						tasks: {
							[taskId]: task,
						},
					},
				})
			);

			// when
			await store.dispatch(thunks.persistTask(taskState));

			// then
			expect(mockedDb.tasks.save).toBeCalledWith({ ...task, state: 'completed', itemsDone: 100, timestampDone: expect.anything() });
		});
		it('Saves correct task when some posts were downloaded and some skipped and they add up to task items', async () => {
			// given
			const taskId = 123;
			const task: Task = {
				id: taskId,
				items: 100,
				itemsDone: 50,
				state: 'downloading',
				postIds: [],
				timestampStarted: 12345,
			};
			const taskState: DownloadTaskState = {
				taskId,
				canceled: false,
				downloaded: 60,
				skipped: 40,
			};
			const store = mockStore(
				mState({
					tasks: {
						tasks: {
							[taskId]: task,
						},
					},
				})
			);

			// when
			await store.dispatch(thunks.persistTask(taskState));

			// then
			expect(mockedDb.tasks.save).toBeCalledWith({ ...task, state: 'completed', itemsDone: 100, timestampDone: expect.anything() });
		});
		it('Saves correct task when some posts were downloaded and some skipped and they dont add up to task items', async () => {
			// given
			const taskId = 123;
			const task: Task = {
				id: taskId,
				items: 100,
				itemsDone: 50,
				state: 'downloading',
				postIds: [],
				timestampStarted: 12345,
			};
			const taskState: DownloadTaskState = {
				taskId,
				canceled: false,
				downloaded: 50,
				skipped: 40,
			};
			const store = mockStore(
				mState({
					tasks: {
						tasks: {
							[taskId]: task,
						},
					},
				})
			);

			// when
			await store.dispatch(thunks.persistTask(taskState));

			// then
			expect(mockedDb.tasks.save).toBeCalledWith({ ...task, state: 'failed', timestampDone: expect.anything() });
		});
		it('Saves correct task when task was canceled', async () => {
			// given
			const taskId = 123;
			const task: Task = {
				id: taskId,
				items: 100,
				itemsDone: 50,
				state: 'downloading',
				postIds: [],
				timestampStarted: 12345,
			};
			const taskState: DownloadTaskState = {
				taskId,
				canceled: true,
				downloaded: 50,
				skipped: 40,
			};
			const store = mockStore(
				mState({
					tasks: {
						tasks: {
							[taskId]: task,
						},
					},
				})
			);

			// when
			await store.dispatch(thunks.persistTask(taskState));

			// then
			expect(mockedDb.tasks.save).toBeCalledWith({ ...task, state: 'canceled', timestampDone: expect.anything() });
		});
		it('Return undefined when no task is in state', async () => {
			// given
			const taskId = 123;
			const taskState: DownloadTaskState = {
				taskId,
				canceled: true,
				downloaded: 50,
				skipped: 40,
			};
			const store = mockStore(
				mState({
					tasks: {
						tasks: {},
						lastId: 1,
					},
				})
			);

			// when
			const result = await store.dispatch(thunks.persistTask(taskState));

			// then
			expect(result.payload).toBeUndefined();
			expect(mockedDb.tasks.save).toBeCalledTimes(0);
		});
	});
});
