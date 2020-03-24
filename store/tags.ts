import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import * as db from '../db';
import { Tag } from '../types/gelbooruTypes';
import { AppThunk } from '.';

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

export const { setTags } = tagsSlice.actions;

export default tagsSlice.reducer;

export const loadAllTagsFromDb = (): AppThunk => async (dispatch): Promise<void> => {
	try {
		const tags = await db.tags.getAll();
		tags && dispatch(setTags(tags));
	} catch (err) {
		console.error('Error while loading tags from db', err);
	}
};

export const loadAllTagsFromDbWithStats = (): AppThunk => async (dispatch): Promise<void> => {
	try {
		const tags = await db.tags.getAll();
		if (tags) {
			const tagsWithStats = await Promise.all(
				tags.map(async (tag) => {
					tag.blacklistedCount = await db.tags.getBlacklistedCount(tag.tag);
					tag.downloadedCount = await db.tags.getDownloadedCount(tag.tag);
					tag.favoriteCount = await db.tags.getFavoriteCount(tag.tag);
					return tag;
				})
			);
			dispatch(setTags(tagsWithStats));
		}
	} catch (err) {
		console.error('Error while loading tags with stats from db', err);
	}
};

export const loadByPatternFromDb = (pattern: string): AppThunk => async (dispatch): Promise<void> => {
	try {
		const tags = await db.tags.getByPattern(pattern);
		dispatch(setTags(tags));
	} catch (err) {
		console.error('Error while loading tags by pattern from db', err);
	}
};

export const actions = { ...tagsSlice.actions, loadAllTagsFromDb, loadAllTagsFromDbWithStats, loadByPatternFromDb };
