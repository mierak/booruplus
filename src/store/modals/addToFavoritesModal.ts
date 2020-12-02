import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AddToFavoritesModalState {
	postIdsToFavorite: number[];
}

export const initialState: AddToFavoritesModalState = {
	postIdsToFavorite: [],
};

const addToFavoritesModalSlice = createSlice({
	name: 'addToFavoritesModal',
	initialState: initialState,
	reducers: {
		setPostIds: (state, action: PayloadAction<number[]>): void => {
			state.postIdsToFavorite = action.payload;
		},
	},
});

export const actions = { ...addToFavoritesModalSlice.actions };

export default addToFavoritesModalSlice.reducer;
