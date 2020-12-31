import { doDatabaseMock } from '../helpers/database.mock';
doDatabaseMock();
import reducer, { actions, initialState, PostsState } from '../../src/store/posts';
import { thunks } from '../../src/store/';
import { createAction, mPost, createPendingAction, createFulfilledAction } from '../helpers/test.helper';
import { mPostsPostsState } from '../helpers/store.helper';
import { Post } from '../../src/types/gelbooruTypes';

describe('store/posts', () => {
	const context = 'ctx';
	it('Sets activePostIndex', () => {
		// given
		const index = 123;
		const action = createAction(actions.setActivePostIndex.type, { data: index, context });
		const state: PostsState = {
			...initialState,
			selectedIndices: { [context]: 0 },
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.selectedIndices[context]).toBe(index);
	});
	it('Sets posts', () => {
		// given
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createAction(actions.setPosts.type, { data: posts, context });
		const state: PostsState = {
			...initialState,
			posts: mPostsPostsState({ [context]: posts }),
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.posts[context]).toHaveLength(posts.length);
	});
	it('Adds post(s)', () => {
		const post = mPost();
		const action = createAction(actions.addPosts.type, { data: post, context });
		const action2 = createAction(actions.addPosts.type, { data: [mPost(), mPost()], context });
		const state: PostsState = {
			...initialState,
			posts: mPostsPostsState({ [context]: [] }),
		};

		// when
		const result = reducer(state, action);
		const result2 = reducer(state, action2);

		// then
		expect(result.posts[context]).toHaveLength(1);
		expect(result2.posts[context]).toHaveLength(2);
	});
	it('Removes post(s)', () => {
		const posts = [mPost({ id: 0 }), mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 }), mPost({ id: 4 })];
		const action = createAction(actions.removePosts.type, { data: posts[2], context });
		const action2 = createAction(actions.removePosts.type, { data: [posts[1], posts[3]], context });
		const state: PostsState = {
			...initialState,
			posts: mPostsPostsState({ [context]: posts }),
		};

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
	it('Sets post selected', () => {
		// given
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createAction(actions.setPostSelected.type, { data: { post: posts[1], selected: true }, context });
		const state: PostsState = {
			...initialState,
			posts: mPostsPostsState({ [context]: posts }),
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.posts[context][1].selected).toBe(true);
	});
	it('Correctly sets next index when nextPost', () => {
		// given
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createAction(actions.nextPost.type, { context });
		const state: PostsState = {
			...initialState,
			posts: mPostsPostsState({ [context]: posts }),
			selectedIndices: { [context]: 0 },
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.selectedIndices[context]).toBe(1);
	});
	it('Correctly sets next index when nextPost and current post is last', () => {
		// given
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createAction(actions.nextPost.type, { context });
		const state: PostsState = {
			...initialState,
			posts: mPostsPostsState({ [context]: posts }),
			selectedIndices: { [context]: 2 },
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.selectedIndices[context]).toBe(0);
	});
	it('Correctly sets previous index when previousPost', () => {
		// given
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createAction(actions.previousPost.type, { context });
		const state: PostsState = {
			...initialState,
			posts: mPostsPostsState({ [context]: posts }),
			selectedIndices: { [context]: 2 },
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.selectedIndices[context]).toBe(1);
	});
	it('Correctly sets previous index when previousPost and current post is first', () => {
		// given
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createAction(actions.previousPost.type, { context });
		const state: PostsState = {
			...initialState,
			posts: mPostsPostsState({ [context]: posts }),
			selectedIndices: { [context]: 0 },
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.selectedIndices[context]).toBe(2);
	});
	it('Unselects all posts on unselectAllPosts', () => {
		// given
		const posts = [mPost({ id: 1, selected: true }), mPost({ id: 2, selected: true }), mPost({ id: 3, selected: true })];
		const action = createAction(actions.unselectAllPosts.type, { context });
		const state: PostsState = {
			...initialState,
			posts: mPostsPostsState({ [context]: posts }),
		};

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
			const index = 1;
			const posts = [
				mPost({ id: 1, selected: false }),
				mPost({ id: 2, selected: false }),
				mPost({ id: 3, selected: false }),
			];
			const action = createAction(actions.selectMultiplePosts.type, { data: index, context });
			const state: PostsState = {
				...initialState,
				posts: mPostsPostsState({ [context]: posts }),
			};

			// when
			const result = reducer(state, action);

			// then
			expect(result.posts[context][index].selected).toBe(true);
		});
		it('Does not do anything when index is higher or equal than posts length', () => {
			// given
			const index = 5;
			const posts = [
				mPost({ id: 1, selected: false }),
				mPost({ id: 2, selected: false }),
				mPost({ id: 3, selected: false }),
			];
			const action = createAction(actions.selectMultiplePosts.type, { data: index, context });
			const state: PostsState = {
				...initialState,
				posts: mPostsPostsState({ [context]: posts }),
			};

			// when
			const result = reducer(state, action);

			// then
			result.posts[context].forEach((post, i) => {
				expect(post).toMatchObject(posts[i]);
			});
		});
		it('Does not do anything when index is lower than 0', () => {
			// given
			const index = -1;
			const posts = [
				mPost({ id: 1, selected: false }),
				mPost({ id: 2, selected: false }),
				mPost({ id: 3, selected: false }),
			];
			const action = createAction(actions.selectMultiplePosts.type, { data: index, context });
			const state: PostsState = {
				...initialState,
				posts: mPostsPostsState({ [context]: posts }),
			};

			// when
			const result = reducer(state, action);

			// then
			result.posts[context].forEach((post, i) => {
				expect(post).toMatchObject(posts[i]);
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
				posts: mPostsPostsState({ [context]: posts }),
			};

			// when
			const result = reducer(state, action);

			// then
			expect(result.posts[context][0].selected).toBe(false);
			expect(result.posts[context][1].selected).toBe(false);
			result.posts[context].slice(2).forEach((post) => {
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
				posts: mPostsPostsState({ [context]: posts }),
			};

			// when
			const result = reducer(state, action);

			// then
			expect(result.posts[context][0].selected).toBe(false);
			result.posts[context].slice(1, 5).forEach((post) => {
				expect(post.selected).toBe(true);
			});
			result.posts[context].slice(6).forEach((post) => {
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
				posts: mPostsPostsState({ [context]: posts }),
			};

			// when
			const result = reducer(state, action);

			// then
			result.posts[context].slice(0, 4).forEach((post) => {
				expect(post.selected).toBe(true);
			});
			result.posts[context].slice(5, 10).forEach((post) => {
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
				posts: mPostsPostsState({ [context]: posts }),
			};

			// when
			const result = reducer(state, action);

			// then
			expect(result.posts[context][0].selected).toBe(true);
			result.posts[context].slice(1, 6).forEach((post) => {
				expect(post.selected).toBe(false);
			});
			result.posts[context].slice(7).forEach((post) => {
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
	describe('extraReducers', () => {
		it('Initializes new posts context', () => {
			// given
			const action = createAction('common/initPostsContext', { context });

			// when
			const result = reducer(undefined, action);

			// then
			expect(result.posts[context]).toEqual([]);
		});
		it('Deletes posts context', () => {
			// given
			const action = createAction('common/deletePostsContext', { context });

			// when
			const result = reducer(
				{
					...initialState,
					posts: mPostsPostsState({ [context]: [], second: [] }),
					selectedIndices: { [context]: 123, second: 1 },
				},
				action
			);

			// then
			expect(result.posts[context]).toBeUndefined();
			expect(result.selectedIndices[context]).toBeUndefined();
		});
		it('Does not delete posts context when its the last one', () => {
			// given
			const action = createAction('common/deletePostsContext', { context });

			// when
			const result = reducer(
				{ ...initialState, posts: mPostsPostsState({ [context]: [] }), selectedIndices: { [context]: 123 } },
				action
			);

			// then
			expect(result.posts[context]).toMatchObject([]);
			expect(result.selectedIndices[context]).toBe(123);
		});
		it('Resets state when online fetchPosts is pending', () => {
			// given
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
			const action = createPendingAction(thunks.onlineSearches.fetchPosts.pending.type, { arg: { context } });
			const state: PostsState = {
				...initialState,
				posts: mPostsPostsState({ [context]: posts }),
				selectedIndices: { [context]: 123 },
			};

			// when
			const result = reducer(state, action);

			// then
			expect(result.posts[context]).toHaveLength(0);
			expect(result.selectedIndices[context]).toBe(undefined);
		});
		it('Resets state when offline fetchPosts is pending', () => {
			// given
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
			const action = createPendingAction(thunks.offlineSearches.fetchPosts.pending.type, { arg: { context } });
			const state: PostsState = {
				...initialState,
				posts: mPostsPostsState({ [context]: posts }),
				selectedIndices: { [context]: 123 },
			};

			// when
			const result = reducer(state, action);

			// then
			expect(result.posts[context]).toHaveLength(0);
			expect(result.selectedIndices[context]).toBe(undefined);
		});
		it('Resets state when fetchPostsById is pending', () => {
			// given
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
			const action = createPendingAction(thunks.posts.fetchPostsByIds.pending.type, {
				arg: { context, ids: posts.map((p) => p.id) },
			});
			const state: PostsState = {
				...initialState,
				posts: mPostsPostsState({ [context]: posts }),
				selectedIndices: { [context]: 123 },
			};

			// when
			const result = reducer(state, action);

			// then
			expect(result.posts[context]).toHaveLength(0);
			expect(result.selectedIndices[context]).toBe(undefined);
		});
		it('Adds posts when fetchPostsById is fulfilled', () => {
			// given
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
			const action = createFulfilledAction(thunks.posts.fetchPostsByIds.fulfilled.type, posts, {
				arg: { context, ids: posts.map((p) => p.id) },
			});
			const state: PostsState = {
				...initialState,
				posts: mPostsPostsState({ [context]: [] }),
				selectedIndices: { posts: 123 },
			};

			// when
			const result = reducer(state, action);

			// then
			expect(result.posts[context]).toHaveLength(posts.length);
		});

		it('Resets state when fetchPostsInDirectory is pending', () => {
			// given
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
			const action = createPendingAction(thunks.favorites.fetchPostsInDirectory.pending.type);
			const state: PostsState = {
				...initialState,
				posts: mPostsPostsState({ favorites: posts }),
				selectedIndices: { favorites: 123 },
			};

			// when
			const result = reducer(state, action);

			// then
			expect(result.posts.favorites).toHaveLength(0);
			expect(result.selectedIndices.favorites).toBe(undefined);
		});
		it('Removes posts from active directory', () => {
			// given
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
			const action = createFulfilledAction(thunks.favorites.removePostsFromActiveDirectory.fulfilled.type, undefined, {
				arg: [posts[0]],
			});
			const state: PostsState = {
				...initialState,
				posts: mPostsPostsState({ favorites: posts }),
			};

			// when
			const result = reducer(state, action);

			// then
			expect(result.posts.favorites).toHaveLength(2);
			expect(result.posts.favorites[0].id).toBe(2);
			expect(result.posts.favorites[1].id).toBe(3);
		});
		it('Adds posts when online fetchPosts - checkPostsAgainstDb is fulfilled', () => {
			// given
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
			const action = createFulfilledAction(thunks.onlineSearches.checkPostsAgainstDb.fulfilled.type, posts, {
				arg: { context },
			});
			const state: PostsState = {
				...initialState,
				posts: mPostsPostsState({ [context]: [] }),
				selectedIndices: { posts: 123 },
			};

			// when
			const result = reducer(state, action);

			// then
			expect(result.posts[context]).toHaveLength(posts.length);
		});
		it('Adds posts when offline fetchPosts is fulfilled', () => {
			// given
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
			const action = createFulfilledAction(thunks.offlineSearches.fetchPosts.fulfilled.type, posts, {
				arg: { context },
			});
			const state: PostsState = {
				...initialState,
				posts: mPostsPostsState({ [context]: [] }),
				selectedIndices: { [context]: 123 },
			};

			// when
			const result = reducer(state, action);

			// then
			expect(result.posts[context]).toHaveLength(posts.length);
		});
		describe('downloadedSearchForm.fetchMorePosts()', () => {
			it('Adds posts when offline fetchMorePosts is fulfilled', () => {
				// given
				const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
				const action = createFulfilledAction(thunks.offlineSearches.fetchMorePosts.fulfilled.type, posts, {
					arg: { context },
				});
				const state: PostsState = {
					...initialState,
					posts: mPostsPostsState({ [context]: [] }),
					selectedIndices: { [context]: 123 },
				};

				// when
				const result = reducer(state, action);

				// then
				expect(result.posts[context]).toHaveLength(posts.length);
			});
			it('Sets activePostIndex to first new post', () => {
				// given
				const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
				const currentPosts = [mPost({ id: 4 }), mPost({ id: 5 }), mPost({ id: 6 })];
				const action = createFulfilledAction(thunks.offlineSearches.fetchMorePosts.fulfilled.type, posts, {
					arg: { context },
				});
				const state: PostsState = {
					...initialState,
					posts: mPostsPostsState({ [context]: currentPosts }),
					selectedIndices: { [context]: undefined },
				};

				// when
				const result = reducer(state, action);

				// then
				expect(result.selectedIndices[context]).toBe(3);
			});
			it('Sets activePostIndex to last post if no posts were fetched', () => {
				// given
				const posts: Post[] = [];
				const currentPosts = [mPost({ id: 4 }), mPost({ id: 5 }), mPost({ id: 6 })];
				const action = createFulfilledAction(thunks.offlineSearches.fetchMorePosts.fulfilled.type, posts, {
					arg: { context },
				});
				const state: PostsState = {
					...initialState,
					posts: mPostsPostsState({ [context]: currentPosts }),
					selectedIndices: { [context]: undefined },
				};

				// when
				const result = reducer(state, action);

				// then
				expect(result.selectedIndices[context]).toBe(2);
			});
			it('Sets activePostIndex to 0 if posts were fetched, but no posts were currently in state', () => {
				// given
				const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
				const currentPosts: Post[] = [];
				const action = createFulfilledAction(thunks.offlineSearches.fetchMorePosts.fulfilled.type, posts, {
					arg: { context },
				});
				const state: PostsState = {
					...initialState,
					posts: mPostsPostsState({ [context]: currentPosts }),
					selectedIndices: { [context]: undefined },
				};

				// when
				const result = reducer(state, action);

				// then
				expect(result.selectedIndices[context]).toBe(0);
			});
		});
		describe('onlineSearchForm.fetchMorePosts()', () => {
			it('Sets activePostIndex to first new post', () => {
				// given
				const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
				const currentPosts = [mPost({ id: 4 }), mPost({ id: 5 }), mPost({ id: 6 })];
				const checkAction = createFulfilledAction(thunks.onlineSearches.checkPostsAgainstDb.fulfilled.type, posts, {
					arg: { context },
				});
				const action = createFulfilledAction(thunks.onlineSearches.fetchMorePosts.fulfilled.type, posts, {
					arg: { context },
				});
				const state: PostsState = {
					...initialState,
					posts: mPostsPostsState({ [context]: currentPosts }),
					selectedIndices: { [context]: undefined },
				};

				// when
				const result = reducer(reducer(state, checkAction), action);

				// then
				expect(result.selectedIndices[context]).toBe(3);
			});
			it('Sets activePostIndex to last post if no posts were fetched', () => {
				// given
				const posts: Post[] = [];
				const currentPosts = [mPost({ id: 4 }), mPost({ id: 5 }), mPost({ id: 6 })];
				const action = createFulfilledAction(thunks.onlineSearches.fetchMorePosts.fulfilled.type, posts, {
					arg: { context },
				});
				const state: PostsState = {
					...initialState,
					posts: mPostsPostsState({ [context]: currentPosts }),
					selectedIndices: { [context]: undefined },
				};

				// when
				const result = reducer(state, action);

				// then
				expect(result.selectedIndices[context]).toBe(2);
			});
			it('Sets activePostIndex to 0 if posts were fetched, but no posts were currently in state', () => {
				// given
				const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
				const currentPosts: Post[] = [];
				const action = createFulfilledAction(thunks.onlineSearches.fetchMorePosts.fulfilled.type, posts, {
					arg: { context },
				});
				const state: PostsState = {
					...initialState,
					posts: mPostsPostsState({ [context]: currentPosts }),
					selectedIndices: { [context]: undefined },
				};

				// when
				const result = reducer(state, action);

				// then
				expect(result.selectedIndices[context]).toBe(0);
			});
		});
		it('Adds posts when favorites fetchPostsInDirectory is fulfilled', () => {
			// given
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
			const action = createAction(thunks.favorites.fetchPostsInDirectory.fulfilled.type, posts);
			const state: PostsState = {
				...initialState,
				posts: mPostsPostsState({ favorites: [] }),
				selectedIndices: { favorites: 123 },
			};

			// when
			const result = reducer(state, action);

			// then
			expect(result.posts.favorites).toHaveLength(posts.length);
		});
		it('Removes blacklisted posts when blacklistPosts is fulfilled', () => {
			// given
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
			const action = createFulfilledAction(thunks.posts.blacklistPosts.fulfilled.type, [posts[0], posts[1]], {
				arg: { context },
			});
			const state: PostsState = {
				...initialState,
				posts: mPostsPostsState({ [context]: posts }),
				selectedIndices: { [context]: 123 },
			};

			// when
			const result = reducer(state, action);

			// then
			expect(result.posts[context]).toHaveLength(1);
			expect(result.posts[context][0].id).toBe(3);
		});
		it('Switches posts downloaded status when downloadPost is fulfilled', () => {
			// given
			const posts = [mPost({ id: 1, downloaded: 0 }), mPost({ id: 2, downloaded: 0 }), mPost({ id: 3, downloaded: 0 })];
			const action = createFulfilledAction(thunks.posts.downloadPost.fulfilled.type, posts[0], {
				arg: { context },
			});
			const state: PostsState = {
				...initialState,
				posts: mPostsPostsState({ [context]: posts }),
				selectedIndices: { [context]: 123 },
			};

			// when
			const result = reducer(state, action);

			// then
			expect(result.posts[context]).toHaveLength(3);
			expect(result.posts[context][0].downloaded).toBe(1);
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
});
