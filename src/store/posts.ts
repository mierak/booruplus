import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { Post } from '@appTypes/gelbooruTypes';
import type { PostsContext, WithContext } from './types';

import * as thunks from './thunks';
import { deletePostsContext, initPostsContext } from './commonActions';

type HoveredPost = {
	visible: boolean;
	post: Post | undefined;
};

export type PostsState = {
	selectedIndices: {
		[K in PostsContext]?: number;
	} & {
		[key: string]: number | undefined;
	};
	posts: {
		[K in PostsContext]: Post[];
	} & {
		[key: string]: Post[];
	};
	hoveredPost: HoveredPost;
};

export const initialState: PostsState = {
	selectedIndices: {},
	posts: {
		posts: [],
		favorites: [],
		mostViewed: [],
		checkLaterQueue: [],
		default: [],
	},
	hoveredPost: {
		visible: false,
		post: undefined,
	},
};

const postsSlice = createSlice({
	name: 'posts',
	initialState: initialState,
	reducers: {
		setActivePostIndex: (state, action: PayloadAction<WithContext<number | undefined>>): void => {
			state.selectedIndices[action.payload.context] = action.payload.data;
		},
		setPosts: (state, action: PayloadAction<WithContext<Post[]>>): void => {
			state.posts[action.payload.context] = action.payload.data;
		},
		addPosts: (state, action: PayloadAction<WithContext<Post[] | Post>>): void => {
			if (Array.isArray(action.payload.data)) {
				state.posts[action.payload.context].push(...action.payload.data);
			} else {
				state.posts[action.payload.context].push(action.payload.data);
			}
		},
		removePosts: (state, action: PayloadAction<WithContext<Post[] | Post>>): void => {
			const data = action.payload.data;
			if (Array.isArray(data)) {
				const ids = data.map((p) => p.id);
				state.posts[action.payload.context] = state.posts[action.payload.context].filter((p) => !ids.includes(p.id));
			} else {
				state.posts[action.payload.context] = state.posts[action.payload.context].filter((p) => p.id !== data.id);
			}
		},
		setPostSelected: (state, action: PayloadAction<WithContext<{ post: Post; selected: boolean }>>): void => {
			const post = state.posts[action.payload.context].find((p) => p.id === action.payload.data.post.id);
			post && (post.selected = action.payload.data.selected);
		},
		unselectAllPosts: (state, action: PayloadAction<WithContext>): void => {
			state.posts[action.payload.context].forEach((post) => (post.selected = false));
		},
		selectMultiplePosts: (state, action: PayloadAction<WithContext<number>>): void => {
			const index = action.payload.data;
			const ctx = action.payload.context;
			if (index < 0 || index >= state.posts[ctx].length) {
				return;
			}

			const isSelected = state.posts[ctx][index].selected;
			const selectedIndexes = state.posts[ctx].reduce<number[]>((acc, post, i): number[] => {
				return post.selected ? [...acc, i] : acc;
			}, []);

			if (selectedIndexes.length === 0) {
				state.posts[ctx][index].selected = !isSelected;
				return;
			}

			const minIndex = Math.min(...selectedIndexes);
			const maxIndex = Math.max(...selectedIndexes);

			if (index > maxIndex) {
				for (let i = maxIndex; i <= index; i++) {
					state.posts[ctx][i].selected = !isSelected;
				}
			} else if (index < minIndex) {
				for (let i = index; i <= minIndex; i++) {
					state.posts[ctx][i].selected = !isSelected;
				}
			} else {
				const distanceFromMin = index - minIndex;
				const distanceFromMax = maxIndex - index;

				if (distanceFromMin < distanceFromMax) {
					for (let i = minIndex; i <= index; i++) {
						state.posts[ctx][i].selected = !isSelected;
					}
				} else {
					for (let i = index; i <= maxIndex; i++) {
						state.posts[ctx][i].selected = !isSelected;
					}
				}
			}
		},
		nextPost: (state, action: PayloadAction<WithContext>): void => {
			const ctx = action.payload.context;
			if (state.selectedIndices[ctx] !== undefined) {
				const index =
					state.selectedIndices[ctx] === state.posts[ctx].length - 1 ? 0 : (state.selectedIndices[ctx] ?? 0) + 1;
				state.selectedIndices[ctx] = index;
			}
		},
		previousPost: (state, action: PayloadAction<WithContext>): void => {
			const ctx = action.payload.context;
			if (state.selectedIndices[ctx] !== undefined) {
				const index =
					state.selectedIndices[ctx] === 0
						? state.posts[ctx].length - 1
						: (state.selectedIndices[ctx] ?? state.posts[ctx].length) - 1;
				state.selectedIndices[ctx] = index;
			}
		},
		setHoveredPost: (state, action: PayloadAction<Partial<HoveredPost>>): void => {
			state.hoveredPost.post = action.payload.post;
			action.payload.visible !== undefined && (state.hoveredPost.visible = action.payload.visible);
		},
	},
	extraReducers: (builder) => {
		builder.addCase(initPostsContext, (state, action) => {
			state.posts[action.payload.context] = [];
		});
		builder.addCase(deletePostsContext, (state, action) => {
			delete state.posts[action.payload.context];
			delete state.selectedIndices[action.payload.context];
		});
		builder.addCase(thunks.onlineSearches.fetchPosts.pending, (state, action) => {
			state.posts[action.meta.arg.context] = [];
			state.selectedIndices[action.meta.arg.context] = undefined;
		});
		builder.addCase(thunks.offlineSearches.fetchPosts.pending, (state, action) => {
			state.posts[action.meta.arg.context] = [];
			state.selectedIndices[action.meta.arg.context] = undefined;
		});
		builder.addCase(thunks.onlineSearches.fetchMorePosts.fulfilled, (state, action) => {
			const context = action.meta.arg.context;
			const index = state.posts[context].length - action.payload.length;
			if (index < state.posts[context].length && index >= 0) {
				state.selectedIndices[context] = index;
			} else if (index < 0) {
				state.selectedIndices[context] = 0;
			} else if (index >= state.posts[context].length) {
				state.selectedIndices[context] = state.posts[context].length - 1;
			}
		});
		builder.addCase(thunks.posts.fetchPostsByIds.pending, (state, action) => {
			const context = action.meta.arg.context;
			state.posts[context] = [];
			state.selectedIndices[context] = undefined;
		});
		builder.addCase(thunks.posts.fetchPostsByIds.fulfilled, (state, action) => {
			const context = action.meta.arg.context;
			for (const post of action.payload) {
				state.posts[context].push(post);
			}
		});
		builder.addCase(thunks.onlineSearches.checkPostsAgainstDb.fulfilled, (state, action) => {
			for (const post of action.payload) {
				post.blacklisted !== 1 && state.posts[action.meta.arg.context].push(post);
			}
		});
		builder.addCase(thunks.favorites.fetchPostsInDirectory.pending, (state) => {
			state.posts.favorites = [];
			state.selectedIndices.favorites = undefined;
		});
		builder.addCase(thunks.favorites.fetchPostsInDirectory.fulfilled, (state, action) => {
			state.posts.favorites = action.payload;
		});
		builder.addCase(thunks.favorites.removePostsFromActiveDirectory.fulfilled, (state, action) => {
			state.posts.favorites = state.posts.favorites.filter((post) => !action.meta.arg.find((p) => p.id === post.id));
		});
		builder.addCase(thunks.offlineSearches.fetchPosts.fulfilled, (state, action) => {
			for (const post of action.payload) {
				state.posts[action.meta.arg.context].push(post);
			}
		});
		builder.addCase(thunks.offlineSearches.fetchMorePosts.fulfilled, (state, action) => {
			const context = action.meta.arg.context;
			for (const post of action.payload) {
				state.posts[context].push(post);
			}
			const index = state.posts[context].length - action.payload.length;
			if (index < state.posts[context].length && index >= 0) {
				state.selectedIndices[context] = index;
			} else if (index < 0) {
				state.selectedIndices[context] = 0;
			} else if (index >= state.posts[context].length) {
				state.selectedIndices[context] = state.posts[context].length - 1;
			}
		});
		builder.addCase(thunks.posts.blacklistPosts.fulfilled, (state, action) => {
			const context = action.meta.arg.context;
			const idsToRemove = action.payload.map((post) => post.id);
			state.posts[context] = state.posts[context].filter((post) => !idsToRemove.includes(post.id));
		});
		builder.addCase(thunks.posts.downloadPost.fulfilled, (state, action) => {
			const context = action.meta.arg.context;
			const index = state.posts[context].findIndex((p) => p.id === action.payload.id);

			if (index !== -1) {
				state.posts[context][index] = { ...state.posts[context][index], downloaded: 1 };
			}
		});
		builder.addCase(thunks.dashboard.fetchMostViewedPosts.fulfilled, (state, action) => {
			state.posts.mostViewed = action.payload;
		});
	},
});

export default postsSlice.reducer;

export const actions = postsSlice.actions;
