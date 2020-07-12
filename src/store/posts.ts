import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Post } from '../types/gelbooruTypes';
import * as thunks from './thunks';

export interface PostsState {
	activePostIndex: number | undefined;
	posts: Post[];
}

export const initialState: PostsState = {
	activePostIndex: undefined,
	posts: [],
};
const postsSlice = createSlice({
	name: 'posts',
	initialState: initialState,
	reducers: {
		setActivePostIndex: (state, action: PayloadAction<number | undefined>): void => {
			state.activePostIndex = action.payload;
		},
		setPosts: (state, action: PayloadAction<Post[]>): void => {
			state.posts = action.payload;
		},
		setPostSelected: (state, action: PayloadAction<{ post: Post; selected: boolean }>): void => {
			const post = state.posts.find((p) => p.id === action.payload.post.id);
			post && (post.selected = action.payload.selected);
		},
		nextPost: (state): void => {
			if (state.activePostIndex !== undefined) {
				const index = state.activePostIndex === state.posts.length - 1 ? 0 : state.activePostIndex + 1;
				state.activePostIndex = index;
			}
		},
		previousPost: (state): void => {
			if (state.activePostIndex !== undefined) {
				const index = state.activePostIndex === 0 ? state.posts.length - 1 : state.activePostIndex - 1;
				state.activePostIndex = index;
			}
		},
	},
	extraReducers: (builder) => {
		builder.addCase(thunks.onlineSearchForm.fetchPosts.pending, (state, _) => {
			state.posts = [];
			state.activePostIndex = undefined;
		});
		builder.addCase(thunks.downloadedSearchForm.fetchPosts.pending, (state) => {
			state.posts = [];
			state.activePostIndex = undefined;
		});
		builder.addCase(thunks.onlineSearchForm.fetchMorePosts.fulfilled, (state, action) => {
			const index = state.posts.length - action.payload.length;
			if (index < state.posts.length && index >= 0) {
				state.activePostIndex = index;
			} else if (index < 0) {
				state.activePostIndex = 0;
			} else if (index >= state.posts.length) {
				state.activePostIndex = state.posts.length - 1;
			}
		});
		builder.addCase(thunks.posts.fetchPostsByIds.pending, (state) => {
			state.posts = [];
			state.activePostIndex = undefined;
		});
		builder.addCase(thunks.posts.fetchPostsByIds.fulfilled, (state, action) => {
			for (const post of action.payload) {
				state.posts.push(post);
			}
		});
		builder.addCase(thunks.onlineSearchForm.checkPostsAgainstDb.fulfilled, (state, action) => {
			for (const post of action.payload) {
				post.blacklisted !== 1 && state.posts.push(post);
			}
		});
		builder.addCase(thunks.favorites.fetchPostsInDirectory.pending, (state) => {
			state.posts = [];
			state.activePostIndex = undefined;
		});
		builder.addCase(thunks.favorites.fetchPostsInDirectory.fulfilled, (state, action) => {
			state.posts = action.payload;
		});
		builder.addCase(thunks.downloadedSearchForm.fetchPosts.fulfilled, (state, action) => {
			for (const post of action.payload) {
				state.posts.push(post);
			}
		});
		builder.addCase(thunks.downloadedSearchForm.fetchMorePosts.fulfilled, (state, action) => {
			for (const post of action.payload) {
				state.posts.push(post);
			}
			const index = state.posts.length - action.payload.length;
			if (index < state.posts.length && index >= 0) {
				state.activePostIndex = index;
			} else if (index < 0) {
				state.activePostIndex = 0;
			} else if (index >= state.posts.length) {
				state.activePostIndex = state.posts.length - 1;
			}
		});
		builder.addCase(thunks.posts.blacklistPosts.fulfilled, (state, action) => {
			const idsToRemove = action.payload.map((post) => post.id);
			state.posts = state.posts.filter((post) => !idsToRemove.includes(post.id));
		});
	},
});

export default postsSlice.reducer;

export const actions = postsSlice.actions;
