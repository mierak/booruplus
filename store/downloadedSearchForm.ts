import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import * as db from '../db';

import { AppThunk } from './types';
import { actions as globalActions } from '.';

import { Tag, Rating, Post } from '../types/gelbooruTypes';
import { isExtensionVideo, getRatingName } from '../util/utils';

export interface DownloadedSearchFormState {
	selectedTags: Tag[];
	tagOptions: Tag[];
	rating: Rating;
	postLimit: number;
	page: number;
	showNonBlacklisted: boolean;
	showBlacklisted: boolean;
	showFavorites: boolean;
	showVideos: boolean;
	showImages: boolean;
	showGifs: boolean;
}

const initialState: DownloadedSearchFormState = {
	selectedTags: [],
	tagOptions: [],
	rating: 'any',
	postLimit: 0,
	page: 0,
	showNonBlacklisted: true,
	showBlacklisted: false,
	showFavorites: true,
	showVideos: true,
	showImages: true,
	showGifs: true
};

const downloadedSearchFormSlice = createSlice({
	name: 'downloadedSearchForm',
	initialState: initialState,
	reducers: {
		addTag: (state, action: PayloadAction<Tag>): void => {
			state.selectedTags.push(action.payload);
		},
		removeTag: (state, action: PayloadAction<Tag>): void => {
			const index = state.selectedTags.findIndex((t) => t.id === action.payload.id);
			state.selectedTags.splice(index, 1);
		},
		setTags: (state, action: PayloadAction<Tag[]>): void => {
			state.selectedTags = action.payload;
		},
		setTagOptions: (state, action: PayloadAction<Tag[]>): void => {
			state.tagOptions = action.payload;
		},
		setRating: (state, action: PayloadAction<Rating>): void => {
			state.rating = action.payload;
		},
		setPostLimit: (state, action: PayloadAction<number>): void => {
			state.postLimit = action.payload;
		},
		setPage: (state, action: PayloadAction<number>): void => {
			state.page = action.payload;
		},
		setShowNonBlacklisted: (state, action: PayloadAction<boolean>): void => {
			state.showNonBlacklisted = action.payload;
		},
		toggleShowNonBlacklisted: (state): void => {
			state.showNonBlacklisted = !state.showNonBlacklisted;
		},
		setShowBlacklisted: (state, action: PayloadAction<boolean>): void => {
			state.showBlacklisted = action.payload;
		},
		toggleShowBlacklisted: (state): void => {
			state.showBlacklisted = !state.showBlacklisted;
		},
		setShowFavorites: (state, action: PayloadAction<boolean>): void => {
			state.showFavorites = action.payload;
		},
		toggleShowFavorites: (state): void => {
			state.showFavorites = !state.showFavorites;
		},
		setShowVideos: (state, action: PayloadAction<boolean>): void => {
			state.showVideos = action.payload;
		},
		toggleShowVideos: (state): void => {
			state.showVideos = !state.showVideos;
		},
		setShowImages: (state, action: PayloadAction<boolean>): void => {
			state.showImages = action.payload;
		},
		toggleShowImages: (state): void => {
			state.showImages = !state.showImages;
		},
		setShowGifs: (state, action: PayloadAction<boolean>): void => {
			state.showGifs = action.payload;
		},
		toggleShowGifs: (state): void => {
			state.showGifs = !state.showGifs;
		},
		clearForm: (state): void => {
			state = initialState; //TODO FIX - not working
		}
	}
});

const loadByPatternFromDb = (pattern: string): AppThunk => async (dispatch): Promise<void> => {
	try {
		const tags = await db.tags.getByPattern(pattern);
		dispatch(globalActions.downloadedSearchForm.setTagOptions(tags));
	} catch (err) {
		console.error('Error while loading tags by pattern from db', err);
	}
};

const fetchPosts = (): AppThunk => async (dispatch, getState): Promise<void> => {
	try {
		dispatch(globalActions.system.setFetchingPosts(true));
		dispatch(globalActions.system.setDownloadedSearchFormDrawerVisible(false));
		dispatch(globalActions.system.setActiveView('thumbnails'));
		const state = getState().downloadedSearchForm;
		const tags = state.selectedTags.map((tag) => tag.tag);

		setTimeout(async () => {
			const posts: Post[] = [];
			if (state.showNonBlacklisted) {
				const nonBlacklisted = (tags.length === 0 && (await db.posts.getAllDownloaded())) || (await db.posts.getForTags(...tags));
				posts.push(...nonBlacklisted);
			}
			if (state.showBlacklisted) {
				const blacklistedPosts = await db.posts.getAllBlacklisted();
				posts.push(...blacklistedPosts);
			}
			const filteredPosts = posts.filter((post) => {
				if (state.rating !== 'any' && getRatingName(state.rating) !== post.rating) {
					return false;
				}

				const favorite = post.favorite === 1 ? true : false;
				if (!state.showFavorites && favorite) {
					return false;
				}

				if (post.extension === 'gif') {
					return state.showGifs;
				} else if (isExtensionVideo(post.extension)) {
					return state.showVideos;
				} else {
					return state.showImages;
				}
			});
			dispatch(globalActions.posts.setPosts(filteredPosts));
			dispatch(globalActions.system.setFetchingPosts(false));
		}, 500);
	} catch (err) {
		console.error('Error while fetching tags from db', err);
	}
};

export const actions = { ...downloadedSearchFormSlice.actions, loadByPatternFromDb, fetchPosts };

export default downloadedSearchFormSlice.reducer;
