import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { Post, Tag } from '@appTypes/gelbooruTypes';
import type { SearchContext as SearchContext, PostsContext, WithContext } from './types';

import * as thunks from './thunks';
import { deletePostsContext, initPostsContext } from './commonActions';

export type SearchContextsState = {
	[K in PostsContext]: SearchContext;
} & {
	[key: string]: SearchContext;
};

const defaultValues: SearchContext = {
	tabName: '',
	mode: 'online',
	selectedTags: [],
	excludedTags: [],
	limit: 100,
	rating: 'any',
	page: 0,
	tagOptions: [],
	sort: 'date-uploaded',
	sortOrder: 'desc',
	showBlacklisted: false,
	showFavorites: true,
	showGifs: true,
	showImages: true,
	showNonBlacklisted: true,
	showVideos: true,
	posts: [],
};

export const initialState: SearchContextsState = {
	default: defaultValues,
	checkLaterQueue: { ...defaultValues, mode: 'system' },
	favorites: { ...defaultValues, mode: 'system' },
	mostViewed: { ...defaultValues, mode: 'system' },
};

const searchContextsSlice = createSlice({
	name: 'searchContexts',
	initialState: initialState,
	reducers: {
		addTag: (state, action: PayloadAction<WithContext<Tag>>): void => {
			const ctx = action.payload.context;
			!state[ctx].selectedTags.includes(action.payload.data) && state[ctx].selectedTags.push(action.payload.data);
		},
		addExcludedTag: (state, action: PayloadAction<WithContext<Tag>>): void => {
			const ctx = action.payload.context;
			!state[ctx].excludedTags.includes(action.payload.data) && state[ctx].excludedTags.push(action.payload.data);
		},
		removeTag: (state, action: PayloadAction<WithContext<Tag>>): void => {
			const ctx = action.payload.context;
			const index = state[ctx].selectedTags.findIndex((t) => t.id === action.payload.data.id);
			state[ctx].selectedTags.splice(index, 1);
		},
		removeExcludedTag: (state, action: PayloadAction<WithContext<Tag>>): void => {
			const ctx = action.payload.context;
			const index = state[ctx].excludedTags.findIndex((t) => t.id === action.payload.data.id);
			state[ctx].excludedTags.splice(index, 1);
		},
		clearTagOptions: (state, action: PayloadAction<WithContext>): void => {
			state[action.payload.context].tagOptions = [];
		},
		clear: (state, action: PayloadAction<WithContext>): SearchContextsState => {
			return { ...state, [action.payload.context]: defaultValues };
		},
		updateContext: (state, action: PayloadAction<WithContext<Partial<SearchContext>>>): void => {
			state[action.payload.context] = { ...state[action.payload.context], ...action.payload.data };
		},
		addPosts: (state, action: PayloadAction<WithContext<Post[] | Post>>): void => {
			if (Array.isArray(action.payload.data)) {
				state[action.payload.context].posts.push(...action.payload.data);
			} else {
				state[action.payload.context].posts.push(action.payload.data);
			}
		},
		removePosts: (state, action: PayloadAction<WithContext<Post[] | Post>>): void => {
			const data = action.payload.data;
			if (Array.isArray(data)) {
				const ids = data.map((p) => p.id);
				state[action.payload.context].posts = state[action.payload.context].posts.filter((p) => !ids.includes(p.id));
			} else {
				state[action.payload.context].posts = state[action.payload.context].posts.filter((p) => p.id !== data.id);
			}
		},
		nextPost: (state, action: PayloadAction<WithContext>): void => {
			const ctx = action.payload.context;
			if (state[ctx].selectedIndex !== undefined) {
				const index = state[ctx].selectedIndex === state[ctx].posts.length - 1 ? 0 : (state[ctx].selectedIndex ?? 0) + 1;
				state[ctx].selectedIndex = index;
			}
		},
		previousPost: (state, action: PayloadAction<WithContext>): void => {
			const ctx = action.payload.context;
			if (state[ctx].selectedIndex !== undefined) {
				const index =
					state[ctx].selectedIndex === 0
						? state[ctx].posts.length - 1
						: (state[ctx].selectedIndex ?? state[ctx].posts.length) - 1;
				state[ctx].selectedIndex = index;
			}
		},
		setPostSelected: (state, action: PayloadAction<WithContext<{ post: Post; selected: boolean }>>): void => {
			const post = state[action.payload.context].posts.find((p) => p.id === action.payload.data.post.id);
			post && (post.selected = action.payload.data.selected);
		},
		unselectAllPosts: (state, action: PayloadAction<WithContext>): void => {
			state[action.payload.context].posts.forEach((post) => (post.selected = false));
		},
		selectMultiplePosts: (state, action: PayloadAction<WithContext<number>>): void => {
			const index = action.payload.data;
			const ctx = action.payload.context;
			if (index < 0 || index >= state[ctx].posts.length) {
				return;
			}

			const isSelected = state[ctx].posts[index].selected;
			const selectedIndexes = state[ctx].posts.reduce<number[]>((acc, post, i): number[] => {
				return post.selected ? [...acc, i] : acc;
			}, []);

			if (selectedIndexes.length === 0) {
				state[ctx].posts[index].selected = !isSelected;
				return;
			}

			const minIndex = Math.min(...selectedIndexes);
			const maxIndex = Math.max(...selectedIndexes);

			if (index > maxIndex) {
				for (let i = maxIndex; i <= index; i++) {
					state[ctx].posts[i].selected = !isSelected;
				}
			} else if (index < minIndex) {
				for (let i = index; i <= minIndex; i++) {
					state[ctx].posts[i].selected = !isSelected;
				}
			} else {
				const distanceFromMin = index - minIndex;
				const distanceFromMax = maxIndex - index;

				if (distanceFromMin < distanceFromMax) {
					for (let i = minIndex; i <= index; i++) {
						state[ctx].posts[i].selected = !isSelected;
					}
				} else {
					for (let i = index; i <= maxIndex; i++) {
						state[ctx].posts[i].selected = !isSelected;
					}
				}
			}
		},
	},
	extraReducers: (builder) => {
		builder.addCase(initPostsContext, (state, action) => {
			state[action.payload.context] = { ...defaultValues, ...action.payload.data };
		});
		builder.addCase(deletePostsContext, (state, action) => {
			const contexts = Object.keys(state).filter((ctx) => state[ctx].mode !== 'system');
			contexts.length > 1 && delete state[action.payload.context];
		});

		// Online Search
		builder.addCase(thunks.onlineSearches.fetchPosts.pending, (state, action) => {
			state[action.meta.arg.context].posts = [];
			state[action.meta.arg.context].selectedIndex = undefined;
		});
		builder.addCase(thunks.onlineSearches.checkPostsAgainstDb.fulfilled, (state, action) => {
			for (const post of action.payload) {
				post.blacklisted !== 1 && state[action.meta.arg.context].posts.push(post);
			}
		});
		builder.addCase(thunks.onlineSearches.fetchMorePosts.fulfilled, (state, action) => {
			const context = action.meta.arg.context;

			state[context].page = state[action.meta.arg.context].page + 1;
			const index = state[context].posts.length - action.payload.length;
			if (index < state[context].posts.length && index >= 0) {
				state[context].selectedIndex = index;
			} else if (index < 0) {
				state[context].selectedIndex = 0;
			} else if (index >= state[context].posts.length) {
				state[context].selectedIndex = state[context].posts.length - 1;
			}
		});
		builder.addCase(thunks.onlineSearches.getTagsByPatternFromApi.fulfilled, (state, action) => {
			state[action.meta.arg.context].tagOptions = action.payload;
		});

		// Offline search
		builder.addCase(thunks.offlineSearches.fetchPosts.pending, (state, action) => {
			state[action.meta.arg.context].posts = [];
			state[action.meta.arg.context].selectedIndex = undefined;
		});
		builder.addCase(thunks.offlineSearches.fetchPosts.fulfilled, (state, action) => {
			for (const post of action.payload) {
				state[action.meta.arg.context].posts.push(post);
			}
		});
		builder.addCase(thunks.offlineSearches.fetchMorePosts.fulfilled, (state, action) => {
			const context = action.meta.arg.context;

			state[context].page = state[context].page + 1;
			for (const post of action.payload) {
				state[context].posts.push(post);
			}
			const index = state[context].posts.length - action.payload.length;
			if (index < state[context].posts.length && index >= 0) {
				state[context].selectedIndex = index;
			} else if (index < 0) {
				state[context].selectedIndex = 0;
			} else if (index >= state[context].posts.length) {
				state[context].selectedIndex = state[context].posts.length - 1;
			}
		});
		builder.addCase(thunks.offlineSearches.loadTagsByPattern.fulfilled, (state, action) => {
			state[action.meta.arg.context].tagOptions = action.payload;
		});

		// Saved search
		builder.addCase(thunks.savedSearches.saveSearch.fulfilled, (state, action) => {
			state[action.meta.arg.context].savedSearchId = action.payload.id;
		});

		// Favorites
		builder.addCase(thunks.favorites.fetchPostsInDirectory.pending, (state) => {
			state.favorites.posts = [];
			state.favorites.selectedIndex = undefined;
		});
		builder.addCase(thunks.favorites.fetchPostsInDirectory.fulfilled, (state, action) => {
			state.favorites.posts = action.payload;
		});
		builder.addCase(thunks.favorites.removePostsFromActiveDirectory.fulfilled, (state, action) => {
			state.favorites.posts = state.favorites.posts.filter((post) => !action.meta.arg.find((p) => p.id === post.id));
		});

		// Posts
		builder.addCase(thunks.posts.blacklistPosts.fulfilled, (state, action) => {
			const context = action.meta.arg.context;
			const idsToRemove = action.payload.map((post) => post.id);
			state[context].posts = state[context].posts.filter((post) => !idsToRemove.includes(post.id));
		});
		builder.addCase(thunks.posts.downloadPost.fulfilled, (state, action) => {
			const context = action.meta.arg.context;
			const index = state[context].posts.findIndex((p) => p.id === action.payload.id);

			if (index !== -1) {
				state[context].posts[index] = { ...state[context].posts[index], downloaded: 1 };
			}
		});

		// Dashboard
		builder.addCase(thunks.dashboard.fetchMostViewedPosts.fulfilled, (state, action) => {
			state.mostViewed.posts = action.payload;
		});
		builder.addCase(thunks.posts.fetchPostsByIds.pending, (state, action) => {
			const context = action.meta.arg.context;
			state[context].posts = [];
			state[context].selectedIndex = undefined;
		});
		builder.addCase(thunks.posts.fetchPostsByIds.fulfilled, (state, action) => {
			const context = action.meta.arg.context;
			for (const post of action.payload) {
				state[context].posts.push(post);
			}
		});
	},
});

export const actions = searchContextsSlice.actions;

export default searchContextsSlice.reducer;
