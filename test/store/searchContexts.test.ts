import { doDatabaseMock } from '../helpers/database.mock';
doDatabaseMock();
import reducer, { actions, initialState, SearchContextsState } from '../../src/store/searchContexts';
import { thunks } from '../../src/store';
import { createAction, mTag, createPendingAction, createFulfilledAction, mPost } from '../helpers/test.helper';
import { SearchContext } from '@store/types';
import { mState } from '../helpers/store.helper';
import { Post } from '@appTypes/gelbooruTypes';

describe('store/searcContexts', () => {
	const defaultCtx = 'default';
	it('Adds tag', () => {
		//given
		const tag = mTag({ tag: 'tag1' });
		const action = createAction(actions.addTag.type, { context: defaultCtx, data: tag });

		// when
		const result = reducer(initialState, action);

		// then
		expect(result[defaultCtx].selectedTags).toContain(tag);
	});
	it('Adds excluded tag', () => {
		//given
		const tag = mTag({ tag: 'tag1' });
		const action = createAction(actions.addExcludedTag.type, { context: defaultCtx, data: tag });

		// when
		const result = reducer(initialState, action);

		// then
		expect(result[defaultCtx].excludedTags).toContain(tag);
	});
	it('Removes tag', () => {
		//given
		const context = 'ctx';
		const tag = mTag({ tag: 'tag1' });
		const action = createAction(actions.removeTag.type, { context: defaultCtx, data: tag });

		// when
		const result = reducer({ ...initialState, [context]: { ...initialState.default, selectedTags: [tag] } }, action);

		// then
		expect(result[defaultCtx].selectedTags).not.toContain(tag);
	});
	it('Removes excluded tag', () => {
		//given
		const context = 'ctx';
		const tag = mTag({ tag: 'tag1' });
		const action = createAction(actions.removeExcludedTag.type, { context: defaultCtx, data: tag });

		// when
		const result = reducer({ ...initialState, [context]: { ...initialState.default, excludedTags: [tag] } }, action);

		// then
		expect(result[defaultCtx].excludedTags).not.toContain(tag);
	});
	it('Clears tag options', () => {
		//given
		const context = 'ctx';
		const tags = [mTag({ tag: 'tag1' }), mTag({ tag: 'tag2' }), mTag({ tag: 'tag3' })];
		const action = createAction(actions.clearTagOptions.type, { context: defaultCtx, data: tags });

		// when
		const result = reducer({ ...initialState, [context]: { ...initialState.default, tagOptions: tags } }, action);

		// then
		expect(result[defaultCtx].tagOptions).toEqual([]);
	});
	describe('Updates context', () => {
		//given
		const state: SearchContext = {
			tabName: '',
			mode: 'offline',
			excludedTags: [],
			page: 123,
			limit: 123,
			rating: 'explicit',
			selectedTags: [],
			sort: 'resolution',
			sortOrder: 'asc',
			tagOptions: [],
			showBlacklisted: true,
			showFavorites: false,
			showGifs: false,
			showImages: false,
			showNonBlacklisted: false,
			showVideos: false,
			posts: [],
		};
		const action = createAction(actions.updateContext.type, { context: defaultCtx, data: state });

		// when
		const result = reducer(undefined, action);

		// then
		expect(result).toStrictEqual({ ...initialState, [defaultCtx]: state });
	});
	it('Adds post(s)', () => {
		const context = 'posts';
		const post = mPost();
		const action = createAction(actions.addPosts.type, { data: post, context });
		const action2 = createAction(actions.addPosts.type, { data: [mPost(), mPost()], context });
		const state = mState({ searchContexts: { posts: {} } }).searchContexts;

		// when
		const result = reducer(state, action);
		const result2 = reducer(state, action2);

		// then
		expect(result[context].posts).toHaveLength(1);
		expect(result2[context].posts).toHaveLength(2);
	});
	it('Removes post(s)', () => {
		const context = 'posts';
		const posts = [mPost({ id: 0 }), mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 }), mPost({ id: 4 })];
		const action = createAction(actions.removePosts.type, { data: posts[2], context });
		const action2 = createAction(actions.removePosts.type, { data: [posts[1], posts[3]], context });
		const state = mState({ searchContexts: { posts: { posts } } }).searchContexts;

		// when
		const result = reducer(state, action);
		const result2 = reducer(state, action2);

		// then
		expect(result.posts[context]).toHaveLength(posts.length - 1);
		expect(result.posts[context].find((p) => p.id === 2)).toBeUndefined();
		expect(result2.posts[context]).toHaveLength(posts.length - 2);
		expect(result2.posts[context].find((p) => p.id === 1)).toBeUndefined();
		expect(result2.posts[context].find((p) => p.id === 3)).toBeUndefined();
	});
	it('Correctly sets next index when nextPost', () => {
		// given
		const context = 'posts';
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createAction(actions.nextPost.type, { context });
		const state = mState({ searchContexts: { posts: { posts, selectedIndex: 0 } } }).searchContexts;

		// when
		const result = reducer(state, action);

		// then
		expect(result[context].selectedIndex).toBe(1);
	});
	it('Correctly sets next index when nextPost and current post is last', () => {
		// given
		const context = 'posts';
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createAction(actions.nextPost.type, { context });
		const state = mState({ searchContexts: { posts: { posts, selectedIndex: 2 } } }).searchContexts;

		// when
		const result = reducer(state, action);

		// then
		expect(result[context].selectedIndex).toBe(0);
	});
	it('Correctly sets previous index when previousPost', () => {
		// given
		const context = 'posts';
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createAction(actions.previousPost.type, { context });
		const state = mState({ searchContexts: { posts: { posts, selectedIndex: 2 } } }).searchContexts;

		// when
		const result = reducer(state, action);

		// then
		expect(result[context].selectedIndex).toBe(1);
	});
	it('Correctly sets previous index when previousPost and current post is first', () => {
		// given
		const context = 'posts';
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createAction(actions.previousPost.type, { context });
		const state = mState({ searchContexts: { posts: { posts, selectedIndex: 0 } } }).searchContexts;

		// when
		const result = reducer(state, action);

		// then
		expect(result[context].selectedIndex).toBe(2);
	});
	it('Sets post selected', () => {
		// given
		const context = 'posts';
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createAction(actions.setPostSelected.type, { data: { post: posts[1], selected: true }, context });
		const state = mState({ searchContexts: { posts: { posts } } }).searchContexts;
		// when
		const result = reducer(state, action);

		// then
		expect(result.posts[context][1].selected).toBe(true);
	});
	it('Unselects all posts on unselectAllPosts', () => {
		// given
		const context = 'posts';
		const posts = [mPost({ id: 1, selected: true }), mPost({ id: 2, selected: true }), mPost({ id: 3, selected: true })];
		const action = createAction(actions.unselectAllPosts.type, { context });
		const state = mState({ searchContexts: { posts: { posts } } }).searchContexts;

		// when
		const result = reducer(state, action);

		// then
		result.posts[context].forEach((post) => {
			expect(post.selected).toBe(false);
		});
	});
	describe('selectMultiplePosts()', () => {
		it('Selects a single post when no posts are selected', () => {
			// given
			const context = 'posts';
			const index = 1;
			const posts = [
				mPost({ id: 1, selected: false }),
				mPost({ id: 2, selected: false }),
				mPost({ id: 3, selected: false }),
			];
			const action = createAction(actions.selectMultiplePosts.type, { data: index, context });
			const state = mState({ searchContexts: { posts: { posts } } }).searchContexts;

			// when
			const result = reducer(state, action);

			// then
			expect(result[context].posts[index].selected).toBe(true);
		});
		it('Does not do anything when index is higher or equal than posts length', () => {
			// given
			const context = 'posts';
			const index = 5;
			const posts = [
				mPost({ id: 1, selected: false }),
				mPost({ id: 2, selected: false }),
				mPost({ id: 3, selected: false }),
			];
			const action = createAction(actions.selectMultiplePosts.type, { data: index, context });
			const state = mState({ searchContexts: { posts: { posts } } }).searchContexts;

			// when
			const result = reducer(state, action);

			// then
			result[context].posts.forEach((post, i) => {
				expect(post).toMatchObject(posts[i]);
			});
		});
		it('Does not do anything when index is lower than 0', () => {
			// given
			const context = 'posts';
			const index = -1;
			const posts = [
				mPost({ id: 1, selected: false }),
				mPost({ id: 2, selected: false }),
				mPost({ id: 3, selected: false }),
			];
			const action = createAction(actions.selectMultiplePosts.type, { data: index, context });
			const state = mState({ searchContexts: { posts: { posts } } }).searchContexts;

			// when
			const result = reducer(state, action);

			// then
			result[context].posts.forEach((post, i) => {
				expect(post).toMatchObject(posts[i]);
			});
		});
		it('Selects all posts from maxSelectedIndex to supplied index', () => {
			// given
			const context = 'posts';
			const index = 10;
			const posts = [
				mPost({ id: 0, selected: false }),
				mPost({ id: 1, selected: false }),
				mPost({ id: 2, selected: true }),
				mPost({ id: 3, selected: true }),
				mPost({ id: 4, selected: true }),
				mPost({ id: 5, selected: true }),
				mPost({ id: 6, selected: false }),
				mPost({ id: 7, selected: false }),
				mPost({ id: 8, selected: false }),
				mPost({ id: 9, selected: false }),
				mPost({ id: 10, selected: false }),
			];
			const action = createAction(actions.selectMultiplePosts.type, { data: index, context });
			const state = mState({ searchContexts: { posts: { posts } } }).searchContexts;

			// when
			const result = reducer(state, action);

			// then
			expect(result[context].posts[0].selected).toBe(false);
			expect(result[context].posts[1].selected).toBe(false);
			result[context].posts.slice(2).forEach((post) => {
				expect(post.selected).toBe(true);
			});
		});
		it('Selects all posts from minSelectedIndex to supplied index', () => {
			// given
			const context = 'posts';
			const index = 1;
			const posts = [
				mPost({ id: 0, selected: false }),
				mPost({ id: 1, selected: false }),
				mPost({ id: 2, selected: false }),
				mPost({ id: 3, selected: false }),
				mPost({ id: 4, selected: false }),
				mPost({ id: 5, selected: true }),
				mPost({ id: 6, selected: false }),
				mPost({ id: 7, selected: false }),
				mPost({ id: 8, selected: false }),
				mPost({ id: 9, selected: false }),
				mPost({ id: 10, selected: false }),
			];
			const action = createAction(actions.selectMultiplePosts.type, { data: index, context });
			const state = mState({ searchContexts: { posts: { posts } } }).searchContexts;

			// when
			const result = reducer(state, action);

			// then
			expect(result.posts[context][0].selected).toBe(false);
			result[context].posts.slice(1, 5).forEach((post) => {
				expect(post.selected).toBe(true);
			});
			result[context].posts.slice(6).forEach((post) => {
				expect(post.selected).toBe(false);
			});
		});
		it('Selects posts from minIndex to index, if index is between min and max selected post and minIndex is closer', () => {
			// given
			const context = 'posts';
			const index = 4;
			const posts = [
				mPost({ id: 0, selected: true }),
				mPost({ id: 1, selected: false }),
				mPost({ id: 2, selected: false }),
				mPost({ id: 3, selected: false }),
				mPost({ id: 4, selected: false }),
				mPost({ id: 5, selected: false }),
				mPost({ id: 6, selected: false }),
				mPost({ id: 7, selected: false }),
				mPost({ id: 8, selected: false }),
				mPost({ id: 9, selected: false }),
				mPost({ id: 10, selected: true }),
			];
			const action = createAction(actions.selectMultiplePosts.type, { data: index, context });
			const state = mState({ searchContexts: { posts: { posts } } }).searchContexts;

			// when
			const result = reducer(state, action);

			// then
			result[context].posts.slice(0, 4).forEach((post) => {
				expect(post.selected).toBe(true);
			});
			result[context].posts.slice(5, 10).forEach((post) => {
				expect(post.selected).toBe(false);
			});
			expect(result[context].posts[10].selected).toBe(true);
		});
		it('Selects posts from maxIndex to index, if index is between min and max selected post and maxIndex is closer', () => {
			// given
			const context = 'posts';
			const index = 7;
			const posts = [
				mPost({ id: 0, selected: true }),
				mPost({ id: 1, selected: false }),
				mPost({ id: 2, selected: false }),
				mPost({ id: 3, selected: false }),
				mPost({ id: 4, selected: false }),
				mPost({ id: 5, selected: false }),
				mPost({ id: 6, selected: false }),
				mPost({ id: 7, selected: false }),
				mPost({ id: 8, selected: false }),
				mPost({ id: 9, selected: false }),
				mPost({ id: 10, selected: true }),
			];
			const action = createAction(actions.selectMultiplePosts.type, { data: index, context });
			const state = mState({ searchContexts: { posts: { posts } } }).searchContexts;

			// when
			const result = reducer(state, action);

			// then
			expect(result[context].posts[0].selected).toBe(true);
			result[context].posts.slice(1, 6).forEach((post) => {
				expect(post.selected).toBe(false);
			});
			result[context].posts.slice(7).forEach((post) => {
				expect(post.selected).toBe(true);
			});
		});
	});
	it('Clear reset to initialState', () => {
		//given
		const action = createAction(actions.clear.type, { context: defaultCtx });
		const state: SearchContext = {
			tabName: '',
			mode: 'offline',
			excludedTags: [],
			page: 123,
			limit: 123,
			rating: 'explicit',
			selectedTags: [],
			sort: 'resolution',
			sortOrder: 'asc',
			tagOptions: [],
			showBlacklisted: true,
			showFavorites: false,
			showGifs: false,
			showImages: false,
			showNonBlacklisted: false,
			showVideos: false,
			posts: [],
		};

		// when
		const result = reducer({ ...initialState, [defaultCtx]: state }, action);

		// then
		expect(result).toStrictEqual(initialState);
	});
	describe('extraReducers', () => {
		it('Inits search context', () => {
			// given
			const context = 'newCtx';
			const action = createFulfilledAction('common/initPostsContext', { context });

			// when
			const result = reducer(undefined, action);

			// then
			expect(result[context]).toStrictEqual(initialState.default);
		});
		it('deletes search context', () => {
			// given
			const someCtx = 'someCtx';
			const action = createFulfilledAction('common/deletePostsContext', { context: someCtx });

			// when
			const result = reducer(
				{ ...initialState, [someCtx]: initialState.default, second: { ...initialState.default, mode: 'online' } },
				action
			);

			// then
			expect(result).toStrictEqual({ ...initialState, second: { ...initialState.default, mode: 'online' } });
		});
		it('Does not delete search context when its the last one', () => {
			// given
			const someCtx = 'someCtx';
			const action = createFulfilledAction('common/deletePostsContext', { context: someCtx });

			// when
			const result = reducer({ ...initialState, [someCtx]: initialState.default }, action);

			// then
			expect(result).toStrictEqual(initialState);
		});
		it('Resets state when online fetchPosts is pending', () => {
			// given
			const context = 'ctx';
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
			const action = createPendingAction(thunks.onlineSearches.fetchPosts.pending.type, { arg: { context } });
			const state = mState({ searchContexts: { [context]: { posts, selectedIndex: 123 } } }).searchContexts;

			// when
			const result = reducer(state, action);

			// then
			expect(result[context].posts).toHaveLength(0);
			expect(result[context].selectedIndex).toBe(undefined);
		});
		it('Resets state when offline fetchPosts is pending', () => {
			// given
			const context = 'ctx';
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
			const action = createPendingAction(thunks.offlineSearches.fetchPosts.pending.type, { arg: { context } });
			const state = mState({ searchContexts: { [context]: { posts, selectedIndex: 123 } } }).searchContexts;

			// when
			const result = reducer(state, action);

			// then
			expect(result[context].posts).toHaveLength(0);
			expect(result[context].selectedIndex).toBe(undefined);
		});
		it('Adds posts when offline fetchPosts is fulfilled', () => {
			// given
			const context = 'ctx';
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
			const action = createFulfilledAction(thunks.offlineSearches.fetchPosts.fulfilled.type, posts, {
				arg: { context },
			});
			const state = mState({ searchContexts: { [context]: { posts: [] } } }).searchContexts;

			// when
			const result = reducer(state, action);

			// then
			expect(result[context].posts).toHaveLength(posts.length);
		});
		it('Resets state when fetchPostsById is pending', () => {
			// given
			const context = 'ctx';
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
			const action = createPendingAction(thunks.posts.fetchPostsByIds.pending.type, {
				arg: { context, ids: posts.map((p) => p.id) },
			});
			const state = mState({ searchContexts: { [context]: { posts, selectedIndex: 123 } } }).searchContexts;

			// when
			const result = reducer(state, action);

			// then
			expect(result[context].posts).toHaveLength(0);
			expect(result[context].selectedIndex).toBe(undefined);
		});
		it('Adds posts when fetchPostsById is fulfilled', () => {
			// given
			const context = 'ctx';
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
			const action = createFulfilledAction(thunks.posts.fetchPostsByIds.fulfilled.type, posts, {
				arg: { context, ids: posts.map((p) => p.id) },
			});
			const state = mState({ searchContexts: { [context]: { posts: [], selectedIndex: 123 } } }).searchContexts;

			// when
			const result = reducer(state, action);

			// then
			expect(result[context].posts).toHaveLength(posts.length);
		});

		it('Resets favorites context when fetchPostsInDirectory is pending', () => {
			// given
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
			const action = createPendingAction(thunks.favorites.fetchPostsInDirectory.pending.type);
			const state = mState({ searchContexts: { favorites: { posts, selectedIndex: 123 } } }).searchContexts;

			// when
			const result = reducer(state, action);

			// then
			expect(result.favorites.posts).toHaveLength(0);
			expect(result.favorites.selectedIndex).toBe(undefined);
		});
		it('Adds posts when favorites fetchPostsInDirectory is fulfilled', () => {
			// given
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
			const action = createAction(thunks.favorites.fetchPostsInDirectory.fulfilled.type, posts);
			const state = mState({ searchContexts: { favorites: { posts, selectedIndex: 123 } } }).searchContexts;

			// when
			const result = reducer(state, action);

			// then
			expect(result.favorites.posts).toHaveLength(posts.length);
		});
		it('Removes posts from active directory', () => {
			// given
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
			const action = createFulfilledAction(thunks.favorites.removePostsFromActiveDirectory.fulfilled.type, undefined, {
				arg: [posts[0]],
			});
			const state = mState({ searchContexts: { favorites: { posts } } }).searchContexts;

			// when
			const result = reducer(state, action);

			// then
			expect(result.favorites.posts).toHaveLength(2);
			expect(result.favorites.posts[0].id).toBe(2);
			expect(result.favorites.posts[1].id).toBe(3);
		});
		it('Sets tag options when getTagsByPatternFromApi is fullfiled', () => {
			// given
			const tags = [mTag({ tag: 'tag1' })];
			const action = createFulfilledAction(thunks.onlineSearches.getTagsByPatternFromApi.fulfilled.type, tags, {
				arg: { context: defaultCtx },
			});

			// when
			const result = reducer(undefined, action);

			// then
			expect(result[defaultCtx].tagOptions).toStrictEqual(tags);
		});
		it('Increments page on online fetchMorePosts', () => {
			//given
			const action = createFulfilledAction(thunks.onlineSearches.fetchMorePosts.fulfilled.type, [], {
				arg: { context: defaultCtx },
			});

			// when
			const result = reducer(undefined, action);

			// then
			expect(result[defaultCtx].page).toEqual(1);
		});
		it('Sets activePostIndex to first new post', () => {
			// given
			const context = 'ctx';
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
			const currentPosts = [mPost({ id: 4 }), mPost({ id: 5 }), mPost({ id: 6 })];
			const checkAction = createFulfilledAction(thunks.onlineSearches.checkPostsAgainstDb.fulfilled.type, posts, {
				arg: { context },
			});
			const action = createFulfilledAction(thunks.onlineSearches.fetchMorePosts.fulfilled.type, posts, {
				arg: { context },
			});
			const state = mState({ searchContexts: { [context]: { posts: currentPosts } } }).searchContexts;

			// when
			const result = reducer(reducer(state, checkAction), action);

			// then
			expect(result[context].selectedIndex).toBe(3);
		});
		it('Sets activePostIndex to last post if no posts were fetched', () => {
			// given
			const context = 'ctx';
			const posts: Post[] = [];
			const currentPosts = [mPost({ id: 4 }), mPost({ id: 5 }), mPost({ id: 6 })];
			const action = createFulfilledAction(thunks.onlineSearches.fetchMorePosts.fulfilled.type, posts, {
				arg: { context },
			});
			const state = mState({ searchContexts: { [context]: { posts: currentPosts } } }).searchContexts;

			// when
			const result = reducer(state, action);

			// then
			expect(result[context].selectedIndex).toBe(2);
		});
		it('Sets activePostIndex to 0 if posts were fetched, but no posts were currently in state', () => {
			// given
			const context = 'ctx';
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
			const currentPosts: Post[] = [];
			const action = createFulfilledAction(thunks.onlineSearches.fetchMorePosts.fulfilled.type, posts, {
				arg: { context },
			});
			const state = mState({ searchContexts: { [context]: { posts: currentPosts } } }).searchContexts;

			// when
			const result = reducer(state, action);

			// then
			expect(result[context].selectedIndex).toBe(0);
		});
		it('Adds posts when online fetchPosts - checkPostsAgainstDb is fulfilled', () => {
			// given
			const context = 'ctx';
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
			const action = createFulfilledAction(thunks.onlineSearches.checkPostsAgainstDb.fulfilled.type, posts, {
				arg: { context },
			});
			const state = mState({ searchContexts: { [context]: { posts: [] } } }).searchContexts;

			// when
			const result = reducer(state, action);

			// then
			expect(result[context].posts).toHaveLength(posts.length);
		});
		it('Sets tag options on loadTagsByPattern fulfilled', () => {
			//given
			const tags = [mTag({ tag: 'tag1' })];
			const action = createFulfilledAction(thunks.offlineSearches.loadTagsByPattern.fulfilled.type, tags, {
				arg: { context: defaultCtx },
			});

			// when
			const result = reducer(undefined, action);

			// then
			expect(result[defaultCtx].tagOptions).toStrictEqual(tags);
		});
		it('Increases page and adds posts on offline fetchMorePosts', () => {
			//given
			const context = 'ctx';
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
			const action = createFulfilledAction(thunks.offlineSearches.fetchMorePosts.fulfilled.type, posts, {
				arg: { context },
			});
			const state = mState({ searchContexts: { [context]: { posts: [] } } }).searchContexts;

			// when
			const result = reducer(state, action);

			// then
			expect(result[context].page).toEqual(1);
			expect(result[context].posts).toHaveLength(posts.length);
		});
		it('Sets activePostIndex to first new post on offline fetchMorePosts', () => {
			// given
			const context = 'ctx';
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
			const currentPosts = [mPost({ id: 4 }), mPost({ id: 5 }), mPost({ id: 6 })];
			const action = createFulfilledAction(thunks.offlineSearches.fetchMorePosts.fulfilled.type, posts, {
				arg: { context },
			});
			const state = mState({ searchContexts: { [context]: { posts: currentPosts } } }).searchContexts;

			// when
			const result = reducer(state, action);

			// then
			expect(result[context].selectedIndex).toBe(3);
		});
		it('Sets activePostIndex to last post if no posts were fetched on offline fetchMorePosts', () => {
			// given
			const context = 'ctx';
			const posts: Post[] = [];
			const currentPosts = [mPost({ id: 4 }), mPost({ id: 5 }), mPost({ id: 6 })];
			const action = createFulfilledAction(thunks.offlineSearches.fetchMorePosts.fulfilled.type, posts, {
				arg: { context },
			});
			const state = mState({ searchContexts: { [context]: { posts: currentPosts } } }).searchContexts;

			// when
			const result = reducer(state, action);

			// then
			expect(result[context].selectedIndex).toBe(2);
		});
		it('Sets activePostIndex to 0 if posts were fetched, but no posts were currently in state on offline fetchMorePosts', () => {
			// given
			const context = 'ctx';
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
			const currentPosts: Post[] = [];
			const action = createFulfilledAction(thunks.offlineSearches.fetchMorePosts.fulfilled.type, posts, {
				arg: { context },
			});
			const state = mState({ searchContexts: { [context]: { posts: currentPosts } } }).searchContexts;

			// when
			const result = reducer(state, action);

			// then
			expect(result[context].selectedIndex).toBe(0);
		});
		it('Sets savedSearchId for context when search is saved', () => {
			//given
			const action = createFulfilledAction(
				thunks.savedSearches.saveSearch.fulfilled.type,
				{ id: 123 },
				{
					arg: { context: defaultCtx },
				}
			);

			// when
			const result = reducer(undefined, action);

			// then
			expect(result[defaultCtx].savedSearchId).toEqual(123);
		});
		it('Removes blacklisted posts when blacklistPosts is fulfilled', () => {
			// given
			const context = 'ctx';
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
			const action = createFulfilledAction(thunks.posts.blacklistPosts.fulfilled.type, [posts[0], posts[1]], {
				arg: { context },
			});
			const state = mState({ searchContexts: { [context]: { posts, selectedIndex: 123 } } }).searchContexts;

			// when
			const result = reducer(state, action);

			// then
			expect(result[context].posts).toHaveLength(1);
			expect(result[context].posts[0].id).toBe(3);
		});
		it('Switches posts downloaded status when downloadPost is fulfilled', () => {
			// given
			const context = 'ctx';
			const posts = [mPost({ id: 1, downloaded: 0 }), mPost({ id: 2, downloaded: 0 }), mPost({ id: 3, downloaded: 0 })];
			const action = createFulfilledAction(thunks.posts.downloadPost.fulfilled.type, posts[0], {
				arg: { context },
			});
			const state = mState({ searchContexts: { [context]: { posts, selectedIndex: 123 } } }).searchContexts;

			// when
			const result = reducer(state, action);

			// then
			expect(result[context].posts).toHaveLength(3);
			expect(result[context].posts[0].downloaded).toBe(1);
		});
		it('Sets most viewed posts when fetchMostViewedPosts() is fulfiled', () => {
			//given
			const mostviewedPosts = [mPost({ id: 1 }), mPost({ id: 2 })];
			const action = createAction(thunks.dashboard.fetchMostViewedPosts.fulfilled.type, mostviewedPosts);

			// when
			const result = reducer(undefined, action);

			// then
			expect(result.mostViewed.posts).toStrictEqual(mostviewedPosts);
		});
	});
});
