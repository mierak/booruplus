import { doDatabaseMock } from '../helpers/database.mock';
doDatabaseMock();
import reducer, { actions, initialState, PostsState } from '../../src/store/posts';
import { thunks } from '../../src/store/';
import { createAction, mPost, createPendingAction } from '../helpers/test.helper';

describe('store/posts', () => {
	it('Sets activePostIndex', () => {
		// given
		const index = 123;
		const action = createAction(actions.setActivePostIndex.type, index);
		const state: PostsState = {
			...initialState,
			activePostIndex: 0,
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.activePostIndex).toBe(index);
	});
	it('Sets posts', () => {
		// given
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createAction(actions.setPosts.type, posts);
		const state: PostsState = {
			...initialState,
			posts: [],
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.posts).toHaveLength(posts.length);
	});
	it('Sets post selected', () => {
		// given
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createAction(actions.setPostSelected.type, { post: posts[1], selected: true });
		const state: PostsState = {
			...initialState,
			posts,
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.posts[1].selected).toBe(true);
	});
	it('Correctly sets next index when nextPost', () => {
		// given
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createAction(actions.nextPost.type);
		const state: PostsState = {
			...initialState,
			posts,
			activePostIndex: 0,
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.activePostIndex).toBe(1);
	});
	it('Correctly sets next index when nextPost and current post is last', () => {
		// given
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createAction(actions.nextPost.type);
		const state: PostsState = {
			...initialState,
			posts,
			activePostIndex: 2,
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.activePostIndex).toBe(0);
	});
	it('Correctly sets previous index when previousPost', () => {
		// given
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createAction(actions.previousPost.type);
		const state: PostsState = {
			...initialState,
			posts,
			activePostIndex: 2,
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.activePostIndex).toBe(1);
	});
	it('Correctly sets previous index when previousPost and current post is first', () => {
		// given
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createAction(actions.previousPost.type);
		const state: PostsState = {
			...initialState,
			posts,
			activePostIndex: 0,
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.activePostIndex).toBe(2);
	});
	it('Resets state when online fetchPosts is pending', () => {
		// given
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createPendingAction(thunks.onlineSearchForm.fetchPosts.pending.type);
		const state: PostsState = {
			...initialState,
			posts,
			activePostIndex: 123,
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.posts).toHaveLength(0);
		expect(result.activePostIndex).toBe(undefined);
	});
	it('Resets state when offline fetchPosts is pending', () => {
		// given
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createPendingAction(thunks.downloadedSearchForm.fetchPosts.pending.type);
		const state: PostsState = {
			...initialState,
			posts,
			activePostIndex: 123,
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.posts).toHaveLength(0);
		expect(result.activePostIndex).toBe(undefined);
	});
	it('Resets state when fetchPostsById is pending', () => {
		// given
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createPendingAction(thunks.posts.fetchPostsByIds.pending.type);
		const state: PostsState = {
			...initialState,
			posts,
			activePostIndex: 123,
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.posts).toHaveLength(0);
		expect(result.activePostIndex).toBe(undefined);
	});
	it('Resets state when fetchPostsInDirectory is pending', () => {
		// given
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createPendingAction(thunks.favorites.fetchPostsInDirectory.pending.type);
		const state: PostsState = {
			...initialState,
			posts,
			activePostIndex: 123,
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.posts).toHaveLength(0);
		expect(result.activePostIndex).toBe(undefined);
	});
	it('Adds posts when fetchPostsById is fulfilled', () => {
		// given
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createAction(thunks.posts.fetchPostsByIds.fulfilled.type, posts);
		const state: PostsState = {
			...initialState,
			posts: [],
			activePostIndex: 123,
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.posts).toHaveLength(posts.length);
	});
	it('Adds posts when online fetchPosts - checkPostsAgainstDb is fulfilled', () => {
		// given
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createAction(thunks.onlineSearchForm.checkPostsAgainstDb.fulfilled.type, posts);
		const state: PostsState = {
			...initialState,
			posts: [],
			activePostIndex: 123,
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.posts).toHaveLength(posts.length);
	});
	it('Adds posts when offline fetchPosts is fulfilled', () => {
		// given
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createAction(thunks.downloadedSearchForm.fetchPosts.fulfilled.type, posts);
		const state: PostsState = {
			...initialState,
			posts: [],
			activePostIndex: 123,
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.posts).toHaveLength(posts.length);
	});
	it('Adds posts when offline fetchMorePosts is fulfilled', () => {
		// given
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createAction(thunks.downloadedSearchForm.fetchMorePosts.fulfilled.type, posts);
		const state: PostsState = {
			...initialState,
			posts: [],
			activePostIndex: 123,
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.posts).toHaveLength(posts.length);
	});
	it('Adds posts when favorites fetchPostsInDirectory is fulfilled', () => {
		// given
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createAction(thunks.favorites.fetchPostsInDirectory.fulfilled.type, posts);
		const state: PostsState = {
			...initialState,
			posts: [],
			activePostIndex: 123,
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.posts).toHaveLength(posts.length);
	});
	it('Removes blacklisted posts when blacklistPosts is fulfilled', () => {
		// given
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createAction(thunks.posts.blacklistPosts.fulfilled.type, [posts[0], posts[1]]);
		const state: PostsState = {
			...initialState,
			posts,
			activePostIndex: 123,
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.posts).toHaveLength(1);
		expect(result.posts[0].id).toBe(3);
	});
});
