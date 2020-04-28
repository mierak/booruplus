import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Tag } from '../types/gelbooruTypes';
import { thunks } from './internal';

export interface TagsState {
	tags: Tag[];
}

const initialState: TagsState = {
	tags: [],
};

const tagsSlice = createSlice({
	name: 'tags',
	initialState: initialState,
	reducers: {
		setTags: (state, action: PayloadAction<Tag[]>): void => {
			state.tags = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder.addCase(thunks.tags.loadAllTagsFromDb.fulfilled, (state, action) => {
			state.tags = action.payload;
		});
		builder.addCase(thunks.tags.loadAllTagsFromDbWithStats.fulfilled, (state, action) => {
			state.tags = action.payload;
		});
		builder.addCase(thunks.tags.loadByPatternFromDb.fulfilled, (state, action) => {
			state.tags = action.payload;
		});
	},
});

export default tagsSlice.reducer;

export const actions = tagsSlice.actions;
