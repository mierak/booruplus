import { createSlice, PayloadAction, combineReducers } from '@reduxjs/toolkit';

import addToFavoritesModal, {
	actions as addToFavoritesActions,
	initialState as addToFavoritesInitialState,
	AddToFavoritesModalState,
} from './addToFavoritesModal';
import { ActiveModal } from '@store/types';

export interface ModalsState {
	activeModal: ActiveModal;
	isVisible: boolean;
	addToFavorites: AddToFavoritesModalState;
}

export const initialState: ModalsState = {
	activeModal: 'none',
	isVisible: false,
	addToFavorites: addToFavoritesInitialState,
};

const modalSlice = createSlice({
	name: 'modals',
	initialState: initialState,
	reducers: {
		showModal: (state, action: PayloadAction<ActiveModal>): void => {
			state.activeModal = action.payload;
			state.isVisible = true;
		},
		setVisible: (state, action: PayloadAction<boolean>): void => {
			if (!action.payload) {
				state.activeModal = 'none';
			}
			state.isVisible = action.payload;
		},
	},
});

export const actions = { ...modalSlice.actions, addToFavoritesModal: addToFavoritesActions };

export default combineReducers({
	common: modalSlice.reducer,
	addToFavoritesModal: addToFavoritesModal,
});
