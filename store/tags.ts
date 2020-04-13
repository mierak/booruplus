import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AppThunk } from './types';
import { actions as globalActions } from '.';

import { db } from '../db';
import { Tag } from '../types/gelbooruTypes';
import * as api from 'service/apiService';

export interface TagsState {
	tags: Tag[];
}

const initialState: TagsState = {
	tags: []
};

const tagsSlice = createSlice({
	name: 'tags',
	initialState: initialState,
	reducers: {
		setTags: (state, action: PayloadAction<Tag[]>): void => {
			state.tags = action.payload;
		}
	}
});

export default tagsSlice.reducer;

const loadAllTagsFromDb = (): AppThunk => async (dispatch): Promise<void> => {
	try {
		const tags = await db.tags.getAll();
		tags && dispatch(tagsSlice.actions.setTags(tags));
	} catch (err) {
		console.error('Error while loading tags from db', err);
	}
};

const loadAllTagsFromDbWithStats = (): AppThunk => async (dispatch): Promise<void> => {
	try {
		dispatch(globalActions.system.setTagTableLoading(true));
		const tags = await db.tags.getAll();
		if (tags) {
			const tagsWithStats = await Promise.all(
				tags.map(async tag => {
					tag.blacklistedCount = await db.tags.getBlacklistedCount(tag.tag);
					tag.downloadedCount = await db.tags.getDownloadedCount(tag.tag);
					tag.favoriteCount = await db.tags.getFavoriteCount(tag.tag);
					return tag;
				})
			);
			dispatch(tagsSlice.actions.setTags(tagsWithStats));
		}
	} catch (err) {
		console.error('Error while loading tags with stats from db', err);
	}
	dispatch(globalActions.system.setTagTableLoading(false));
};

const loadByPatternFromDb = (pattern: string): AppThunk => async (dispatch): Promise<void> => {
	try {
		const tags = await db.tags.getByPattern(pattern);
		dispatch(tagsSlice.actions.setTags(tags));
	} catch (err) {
		console.error('Error while loading tags by pattern from db', err);
	}
};

const searcTagOnline = (tag: Tag): AppThunk => async (dispatch): Promise<void> => {
	try {
		dispatch(globalActions.onlineSearchForm.setSelectedTags([tag]));
		dispatch(globalActions.onlineSearchForm.fetchPosts());
		dispatch(globalActions.system.setActiveView('thumbnails'));
	} catch (err) {
		console.error('Error while searching online for Tag', err, tag);
	}
};

const searchTagOffline = (tag: Tag): AppThunk => async (dispatch): Promise<void> => {
	try {
		dispatch(globalActions.downloadedSearchForm.setSelectedTags([tag]));
		dispatch(globalActions.downloadedSearchForm.fetchPosts());
		dispatch(globalActions.system.setActiveView('thumbnails'));
	} catch (err) {
		console.error('Error while searching offline for Tag', err, tag);
	}
};

const fetchTags = (tags: string[]): AppThunk<Tag[]> => async (_, getState): Promise<Tag[]> => {
	try {
		const tagsFromDb: Tag[] = [];
		const notFoundTags: string[] = [];
		for (const tag of tags) {
			const tagFromDb = await db.tags.getTag(tag);
			if (!tagFromDb) {
				notFoundTags.push(tag);
			} else {
				tagsFromDb.push(tagFromDb);
			}
		}
		const tagsFromApi = await api.getTagsByNames(notFoundTags, getState().settings.apiKey);
		return [...tagsFromDb, ...tagsFromApi];
	} catch (err) {
		console.error('Error while loading multiple tags from DB', err);
		return Promise.reject(err);
	}
};

export const actions = {
	...tagsSlice.actions,
	loadAllTagsFromDb,
	loadAllTagsFromDbWithStats,
	loadByPatternFromDb,
	searcTagOnline,
	searchTagOffline,
	fetchTags
};
