import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AppThunk } from '../../store/types';

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

const setPostIdsToFavorite = (type: 'selected' | 'all'): AppThunk => async (dispatch, getState): Promise<void> => {
	try {
		const posts = getState().posts.posts;
		switch (type) {
			case 'all':
				dispatch(addToFavoritesModalSlice.actions.setPostIds(posts.map((post) => post.id)));
				break;
			case 'selected':
				dispatch(addToFavoritesModalSlice.actions.setPostIds(posts.filter((post) => post.selected).map((post) => post.id)));
				break;
		}
	} catch (err) {
		console.error('Error while setting posts to favorite', err);
	}
};

export const actions = { ...addToFavoritesModalSlice.actions, setPostIdsToFavorite };

export default addToFavoritesModalSlice.reducer;
