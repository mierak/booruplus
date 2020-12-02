import { doDatabaseMock } from '../helpers/database.mock';
doDatabaseMock();
import reducer, { actions, initialState, PostsState } from '../../src/store/posts';
import { thunks } from '../../src/store/';
import { createAction, mPost, createPendingAction } from '../helpers/test.helper';
import { Post } from '../../src/types/gelbooruTypes';

describe('store/posts', () => {
	const context = 'posts';
	it('Sets activePostIndex', () => {
		// given
		const index = 123;
		const action = createAction(actions.setActivePostIndex.type, { data: index, context });
		const state: PostsState = {
			...initialState,
			selectedIndices: { posts: 0 },
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.selectedIndices.posts).toBe(index);
	});
	it('Sets posts', () => {
		// given
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createAction(actions.setPosts.type, { data: posts, context });
		const state: PostsState = {
			...initialState,
			posts: { posts, favorites: [], mostViewed: [] },
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.posts.posts).toHaveLength(posts.length);
	});
	it('Sets post selected', () => {
		// given
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createAction(actions.setPostSelected.type, { data: { post: posts[1], selected: true }, context });
		const state: PostsState = {
			...initialState,
			posts: { posts, favorites: [], mostViewed: [] },
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.posts.posts[1].selected).toBe(true);
	});
	it('Correctly sets next index when nextPost', () => {
		// given
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createAction(actions.nextPost.type, { context });
		const state: PostsState = {
			...initialState,
			posts: { posts, favorites: [], mostViewed: [] },
			selectedIndices: { posts: 0 },
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.selectedIndices.posts).toBe(1);
	});
	it('Correctly sets next index when nextPost and current post is last', () => {
		// given
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createAction(actions.nextPost.type, { context });
		const state: PostsState = {
			...initialState,
			posts: { posts, favorites: [], mostViewed: [] },
			selectedIndices: { posts: 2 },
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.selectedIndices.posts).toBe(0);
	});
	it('Correctly sets previous index when previousPost', () => {
		// given
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createAction(actions.previousPost.type, { context });
		const state: PostsState = {
			...initialState,
			posts: { posts, favorites: [], mostViewed: [] },
			selectedIndices: { posts: 2 },
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.selectedIndices.posts).toBe(1);
	});
	it('Correctly sets previous index when previousPost and current post is first', () => {
		// given
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createAction(actions.previousPost.type, { context });
		const state: PostsState = {
			...initialState,
			posts: { posts, favorites: [], mostViewed: [] },
			selectedIndices: { posts: 0 },
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.selectedIndices.posts).toBe(2);
	});
	it('Unselects all posts on unselectAllPosts', () => {
		// given
		const posts = [mPost({ id: 1, selected: true }), mPost({ id: 2, selected: true }), mPost({ id: 3, selected: true })];
		const action = createAction(actions.unselectAllPosts.type, { context });
		const state: PostsState = {
			...initialState,
			posts: { posts, favorites: [], mostViewed: [] },
		};

		// when
		const result = reducer(state, action);

		// then
		result.posts.posts.forEach((post) => {
			expect(post.selected).toBe(false);
		});
	});
	describe('selectMultiplePosts()', () => {
		it('Selects a single post when no posts are selected', () => {
			// given
			const index = 1;
			const posts = [mPost({ id: 1, selected: false }), mPost({ id: 2, selected: false }), mPost({ id: 3, selected: false })];
			const action = createAction(actions.selectMultiplePosts.type, { data: index, context });
			const state: PostsState = {
				...initialState,
				posts: { posts, favorites: [], mostViewed: [] },
			};

			// when
			const result = reducer(state, action);

			// then
			expect(result.posts.posts[index].selected).toBe(true);
		});
		it('Does not do anything when index is higher or equal than posts length', () => {
			// given
			const index = 5;
			const posts = [mPost({ id: 1, selected: false }), mPost({ id: 2, selected: false }), mPost({ id: 3, selected: false })];
			const action = createAction(actions.selectMultiplePosts.type, { data: index, context });
			const state: PostsState = {
				...initialState,
				posts: { posts, favorites: [], mostViewed: [] },
			};

			// when
			const result = reducer(state, action);

			// then
			result.posts.posts.forEach((post, index) => {
				expect(post).toMatchObject(posts[index]);
			});
		});
		it('Does not do anything when index is lower than 0', () => {
			// given
			const index = -1;
			const posts = [mPost({ id: 1, selected: false }), mPost({ id: 2, selected: false }), mPost({ id: 3, selected: false })];
			const action = createAction(actions.selectMultiplePosts.type, { data: index, context });
			const state: PostsState = {
				...initialState,
				posts: { posts, favorites: [], mostViewed: [] },
			};

			// when
			const result = reducer(state, action);

			// then
			result.posts.posts.forEach((post, index) => {
				expect(post).toMatchObject(posts[index]);
			});
		});
		it('Selects all posts from maxSelectedIndex to supplied index', () => {
			// given
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
			const state: PostsState = {
				...initialState,
				posts: { posts, favorites: [], mostViewed: [] },
			};

			// when
			const result = reducer(state, action);

			// then
			expect(result.posts.posts[0].selected).toBe(false);
			expect(result.posts.posts[1].selected).toBe(false);
			result.posts.posts.slice(2).forEach((post) => {
				expect(post.selected).toBe(true);
			});
		});
		it('Selects all posts from minSelectedIndex to supplied index', () => {
			// given
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
			const state: PostsState = {
				...initialState,
				posts: { posts, favorites: [], mostViewed: [] },
			};

			// when
			const result = reducer(state, action);

			// then
			expect(result.posts.posts[0].selected).toBe(false);
			result.posts.posts.slice(1, 5).forEach((post) => {
				expect(post.selected).toBe(true);
			});
			result.posts.posts.slice(6).forEach((post) => {
				expect(post.selected).toBe(false);
			});
		});
		it('Selects posts from minIndex to index, if index is between min and max selected post and minIndex is closer', () => {
			// given
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
			const state: PostsState = {
				...initialState,
				posts: { posts, favorites: [], mostViewed: [] },
			};

			// when
			const result = reducer(state, action);

			// then
			result.posts.posts.slice(0, 4).forEach((post) => {
				expect(post.selected).toBe(true);
			});
			result.posts.posts.slice(5, 10).forEach((post) => {
				expect(post.selected).toBe(false);
			});
			expect(posts[10].selected).toBe(true);
		});
		it('Selects posts from maxIndex to index, if index is between min and max selected post and maxIndex is closer', () => {
			// given
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
			const state: PostsState = {
				...initialState,
				posts: { posts, favorites: [], mostViewed: [] },
			};

			// when
			const result = reducer(state, action);

			// then
			expect(result.posts.posts[0].selected).toBe(true);
			result.posts.posts.slice(1, 6).forEach((post) => {
				expect(post.selected).toBe(false);
			});
			result.posts.posts.slice(7).forEach((post) => {
				expect(post.selected).toBe(true);
			});
		});
	});
	describe('setHoveredPost', () => {
		it('Sets the whole hovered post state', () => {
			// given
			const post = mPost();
			const action = createAction(actions.setHoveredPost.type, { post, visible: true });
			const state: PostsState = {
				...initialState,
				hoveredPost: {
					post: undefined,
					visible: false,
				},
			};

			// when
			const result = reducer(state, action);

			// then
			expect(result.hoveredPost).toMatchObject({ post, visible: true });
		});
	});
	it('Resets state when online fetchPosts is pending', () => {
		// given
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createPendingAction(thunks.onlineSearchForm.fetchPosts.pending.type);
		const state: PostsState = {
			...initialState,
			posts: { posts, favorites: [], mostViewed: [] },
			selectedIndices: { posts: 123 },
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.posts.posts).toHaveLength(0);
		expect(result.selectedIndices.posts).toBe(undefined);
	});
	it('Resets state when offline fetchPosts is pending', () => {
		// given
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createPendingAction(thunks.downloadedSearchForm.fetchPosts.pending.type);
		const state: PostsState = {
			...initialState,
			posts: { posts, favorites: [], mostViewed: [] },
			selectedIndices: { posts: 123 },
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.posts.posts).toHaveLength(0);
		expect(result.selectedIndices.posts).toBe(undefined);
	});
	it('Resets state when fetchPostsById is pending', () => {
		// given
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createPendingAction(thunks.posts.fetchPostsByIds.pending.type);
		const state: PostsState = {
			...initialState,
			posts: { posts, favorites: [], mostViewed: [] },
			selectedIndices: { posts: 123 },
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.posts.posts).toHaveLength(0);
		expect(result.selectedIndices.posts).toBe(undefined);
	});
	it('Resets state when fetchPostsInDirectory is pending', () => {
		// given
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createPendingAction(thunks.favorites.fetchPostsInDirectory.pending.type);
		const state: PostsState = {
			...initialState,
			posts: { posts, favorites: [], mostViewed: [] },
			selectedIndices: { favorites: 123 },
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.posts.favorites).toHaveLength(0);
		expect(result.selectedIndices.favorites).toBe(undefined);
	});
	it('Adds posts when fetchPostsById is fulfilled', () => {
		// given
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createAction(thunks.posts.fetchPostsByIds.fulfilled.type, posts);
		const state: PostsState = {
			...initialState,
			posts: { posts: [], favorites: [], mostViewed: [] },
			selectedIndices: { posts: 123 },
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.posts.posts).toHaveLength(posts.length);
	});
	it('Adds posts when online fetchPosts - checkPostsAgainstDb is fulfilled', () => {
		// given
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createAction(thunks.onlineSearchForm.checkPostsAgainstDb.fulfilled.type, posts);
		const state: PostsState = {
			...initialState,
			posts: { posts: [], favorites: [], mostViewed: [] },
			selectedIndices: { posts: 123 },
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.posts.posts).toHaveLength(posts.length);
	});
	it('Adds posts when offline fetchPosts is fulfilled', () => {
		// given
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createAction(thunks.downloadedSearchForm.fetchPosts.fulfilled.type, posts);
		const state: PostsState = {
			...initialState,
			posts: { posts: [], favorites: [], mostViewed: [] },
			selectedIndices: { posts: 123 },
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.posts.posts).toHaveLength(posts.length);
	});
	describe('downloadedSearchForm.fetchMorePosts()', () => {
		it('Adds posts when offline fetchMorePosts is fulfilled', () => {
			// given
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
			const action = createAction(thunks.downloadedSearchForm.fetchMorePosts.fulfilled.type, posts);
			const state: PostsState = {
				...initialState,
				posts: { posts: [], favorites: [], mostViewed: [] },
				selectedIndices: { posts: 123 },
			};

			// when
			const result = reducer(state, action);

			// then
			expect(result.posts.posts).toHaveLength(posts.length);
		});
		it('Sets activePostIndex to first new post', () => {
			// given
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
			const currentPosts = [mPost({ id: 4 }), mPost({ id: 5 }), mPost({ id: 6 })];
			const action = createAction(thunks.downloadedSearchForm.fetchMorePosts.fulfilled.type, posts);
			const state: PostsState = {
				...initialState,
				posts: { posts: currentPosts, favorites: [], mostViewed: [] },
				selectedIndices: { posts: undefined },
			};

			// when
			const result = reducer(state, action);

			// then
			expect(result.selectedIndices.posts).toBe(3);
		});
		it('Sets activePostIndex to last post if no posts were fetched', () => {
			// given
			const posts: Post[] = [];
			const currentPosts = [mPost({ id: 4 }), mPost({ id: 5 }), mPost({ id: 6 })];
			const action = createAction(thunks.downloadedSearchForm.fetchMorePosts.fulfilled.type, posts);
			const state: PostsState = {
				...initialState,
				posts: { posts: currentPosts, favorites: [], mostViewed: [] },
				selectedIndices: { posts: undefined },
			};

			// when
			const result = reducer(state, action);

			// then
			expect(result.selectedIndices.posts).toBe(2);
		});
		it('Sets activePostIndex to 0 ifposts were fetched, but no posts were currently in state', () => {
			// given
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
			const currentPosts: Post[] = [];
			const action = createAction(thunks.downloadedSearchForm.fetchMorePosts.fulfilled.type, posts);
			const state: PostsState = {
				...initialState,
				posts: { posts: currentPosts, favorites: [], mostViewed: [] },
				selectedIndices: { posts: undefined },
			};

			// when
			const result = reducer(state, action);

			// then
			expect(result.selectedIndices.posts).toBe(0);
		});
	});
	describe('onlineSearchForm.fetchMorePosts()', () => {
		it('Sets activePostIndex to first new post', () => {
			// given
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
			const currentPosts = [mPost({ id: 4 }), mPost({ id: 5 }), mPost({ id: 6 })];
			const checkAction = createAction(thunks.onlineSearchForm.checkPostsAgainstDb.fulfilled.type, posts);
			const action = createAction(thunks.onlineSearchForm.fetchMorePosts.fulfilled.type, posts);
			const state: PostsState = {
				...initialState,
				posts: { posts: currentPosts, favorites: [], mostViewed: [] },
				selectedIndices: { posts: undefined },
			};

			// when
			const result = reducer(reducer(state, checkAction), action);

			// then
			expect(result.selectedIndices.posts).toBe(3);
		});
		it('Sets activePostIndex to last post if no posts were fetched', () => {
			// given
			const posts: Post[] = [];
			const currentPosts = [mPost({ id: 4 }), mPost({ id: 5 }), mPost({ id: 6 })];
			const action = createAction(thunks.onlineSearchForm.fetchMorePosts.fulfilled.type, posts);
			const state: PostsState = {
				...initialState,
				posts: { posts: currentPosts, favorites: [], mostViewed: [] },
				selectedIndices: { posts: undefined },
			};

			// when
			const result = reducer(state, action);

			// then
			expect(result.selectedIndices.posts).toBe(2);
		});
		it('Sets activePostIndex to 0 ifposts were fetched, but no posts were currently in state', () => {
			// given
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
			const currentPosts: Post[] = [];
			const action = createAction(thunks.onlineSearchForm.fetchMorePosts.fulfilled.type, posts);
			const state: PostsState = {
				...initialState,
				posts: { posts: currentPosts, favorites: [], mostViewed: [] },
				selectedIndices: { posts: undefined },
			};

			// when
			const result = reducer(state, action);

			// then
			expect(result.selectedIndices.posts).toBe(0);
		});
	});
	it('Adds posts when favorites fetchPostsInDirectory is fulfilled', () => {
		// given
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createAction(thunks.favorites.fetchPostsInDirectory.fulfilled.type, posts);
		const state: PostsState = {
			...initialState,
			posts: { posts: [], favorites: [], mostViewed: [] },
			selectedIndices: { posts: 123 },
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.posts.favorites).toHaveLength(posts.length);
	});
	it('Removes blacklisted posts when blacklistPosts is fulfilled', () => {
		// given
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createAction(thunks.posts.blacklistPosts.fulfilled.type, [posts[0], posts[1]]);
		const state: PostsState = {
			...initialState,
			posts: { posts, favorites: [], mostViewed: [] },
			selectedIndices: { posts: 123 },
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.posts.posts).toHaveLength(1);
		expect(result.posts.posts[0].id).toBe(3);
	});
	it('Sets most viewed posts when fetchMostViewedPosts() is fulfiled', () => {
		//given
		const mostviewedPosts = [mPost({ id: 1 }), mPost({ id: 2 })];
		const action = createAction(thunks.dashboard.fetchMostViewedPosts.fulfilled.type, mostviewedPosts);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.posts.mostViewed).toStrictEqual(mostviewedPosts);
	});
});
