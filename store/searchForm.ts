import { Tag, Rating } from '../types/gelbooruTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk } from './main';
import { getTagsByPattern } from '../service/apiService';
import { saveTags } from '../db';

export type SearchMode = 'online' | 'offline';

export interface SearchFormState {
	selectedTags: Tag[];
	limit: number;
	rating: Rating;
	page: number;
	loading: boolean;
	searchMode: SearchMode;
	tagOptions: Tag[];
}

export const initialState: SearchFormState = {
	selectedTags: [],
	limit: 100,
	rating: 'any',
	page: 0,
	loading: false,
	searchMode: 'online',
	tagOptions: []
};

const searchFormSlice = createSlice({
	name: 'searchForm',
	initialState: initialState,
	reducers: {
		addTag: (state, action: PayloadAction<Tag>): void => {
			!state.selectedTags.includes(action.payload) && state.selectedTags.push(action.payload);
		},
		removeTag: (state, action: PayloadAction<Tag>): void => {
			const index = state.selectedTags.findIndex((t) => t.id === action.payload.id);
			state.selectedTags.splice(index, 1);
		},
		clearTags: (state): void => {
			state.selectedTags = [];
		},
		setLimit: (state, action: PayloadAction<number>): void => {
			state.limit = action.payload;
		},
		setRating: (state, action: PayloadAction<Rating>): void => {
			state.rating = action.payload;
		},
		setPage: (state, action: PayloadAction<number>): void => {
			state.page = action.payload;
		},
		setLoading: (state, action: PayloadAction<boolean>): void => {
			state.loading = action.payload;
		},
		setSelectedTags: (state, action: PayloadAction<Tag[]>): void => {
			state.selectedTags = action.payload;
		},
		setSearchMode: (state, action: PayloadAction<SearchMode>): void => {
			state.searchMode = action.payload;
		},
		setTagOptions: (state, action: PayloadAction<Tag[]>): void => {
			state.tagOptions = action.payload;
		}
	}
});

export const {
	addTag,
	removeTag,
	clearTags,
	setLimit,
	setRating,
	setPage,
	setLoading,
	setSelectedTags,
	setSearchMode,
	setTagOptions
} = searchFormSlice.actions;

export const getTagsByPatternFromApi = (value: string): AppThunk => async (dispatch): Promise<void> => {
	try {
		const tags = await getTagsByPattern(value);
		saveTags(tags);
		dispatch(setTagOptions(tags));
	} catch (err) {
		console.error('Error occured while fetching posts from api by pattern', err);
	}
};

export default searchFormSlice.reducer;
