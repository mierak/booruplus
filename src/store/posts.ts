import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Post } from '@appTypes/gelbooruTypes';

import * as thunks from './thunks';
import { PostsContext } from './types';

interface HoveredPost {
	visible: boolean;
	post: Post | undefined;
}

type WithContext<T = null> = {
	context: PostsContext;
} & (T extends null ? {} : {
	data: T;
})

export interface PostsState {
	selectedIndices: { [K in PostsContext]?: number };
	posts: { [K in PostsContext]: Post[] };
	hoveredPost: HoveredPost;
}

export const initialState: PostsState = {
	selectedIndices: {},
	posts: {
		posts: [],
		favorites: [],
		mostViewed: [],
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
			const selectedIndexes = state.posts[ctx].reduce<number[]>((acc, post, index): number[] => {
				return post.selected ? [...acc, index] : acc;
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
						? state.posts.posts.length - 1
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
		builder.addCase(thunks.onlineSearchForm.fetchPosts.pending, (state, _) => {
			state.posts.posts = [];
			state.selectedIndices.posts = undefined;
		});
		builder.addCase(thunks.downloadedSearchForm.fetchPosts.pending, (state) => {
			state.posts.posts = [];
			state.selectedIndices.posts = undefined;
		});
		builder.addCase(thunks.onlineSearchForm.fetchMorePosts.fulfilled, (state, action) => {
			const index = state.posts.posts.length - action.payload.length;
			if (index < state.posts.posts.length && index >= 0) {
				state.selectedIndices.posts = index;
			} else if (index < 0) {
				state.selectedIndices.posts = 0;
			} else if (index >= state.posts.posts.length) {
				state.selectedIndices.posts = state.posts.posts.length - 1;
			}
		});
		builder.addCase(thunks.posts.fetchPostsByIds.pending, (state) => {
			state.posts.posts = [];
			state.selectedIndices.posts = undefined;
		});
		builder.addCase(thunks.posts.fetchPostsByIds.fulfilled, (state, action) => {
			for (const post of action.payload) {
				state.posts.posts.push(post);
			}
		});
		builder.addCase(thunks.onlineSearchForm.checkPostsAgainstDb.fulfilled, (state, action) => {
			for (const post of action.payload) {
				post.blacklisted !== 1 && state.posts.posts.push(post);
			}
		});
		builder.addCase(thunks.favorites.fetchPostsInDirectory.pending, (state) => {
			state.posts.favorites = [];
			state.selectedIndices.favorites = undefined;
		});
		builder.addCase(thunks.favorites.fetchPostsInDirectory.fulfilled, (state, action) => {
			state.posts.favorites = action.payload;
		});
		builder.addCase(thunks.downloadedSearchForm.fetchPosts.fulfilled, (state, action) => {
			for (const post of action.payload) {
				state.posts.posts.push(post);
			}
		});
		builder.addCase(thunks.downloadedSearchForm.fetchMorePosts.fulfilled, (state, action) => {
			for (const post of action.payload) {
				state.posts.posts.push(post);
			}
			const index = state.posts.posts.length - action.payload.length;
			if (index < state.posts.posts.length && index >= 0) {
				state.selectedIndices.posts = index;
			} else if (index < 0) {
				state.selectedIndices.posts = 0;
			} else if (index >= state.posts.posts.length) {
				state.selectedIndices.posts = state.posts.posts.length - 1;
			}
		});
		builder.addCase(thunks.posts.blacklistPosts.fulfilled, (state, action) => {
			const idsToRemove = action.payload.map((post) => post.id);
			state.posts.posts = state.posts.posts.filter((post) => !idsToRemove.includes(post.id));
		});
		builder.addCase(thunks.dashboard.fetchMostViewedPosts.fulfilled, (state, action) => {
			state.posts.mostViewed = action.payload;
		});
	},
});

export default postsSlice.reducer;

export const actions = postsSlice.actions;
