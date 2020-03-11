import { Tag, Rating } from '../types/gelbooruTypes';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SearchFormState {
	selectedTags: Tag[];
	limit: number;
	rating: Rating;
	page: number;
	loading: boolean;
}

export const initialState: SearchFormState = {
	selectedTags: [],
	limit: 100,
	rating: 'any',
	page: 0,
	loading: false
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
		}
	}
});

export const { addTag, removeTag, clearTags, setLimit, setRating, setPage, setLoading, setSelectedTags } = searchFormSlice.actions;

export default searchFormSlice.reducer;
