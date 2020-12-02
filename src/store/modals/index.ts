import { createSlice, PayloadAction, combineReducers } from '@reduxjs/toolkit';

import addToFavoritesModal, {
	actions as addToFavoritesActions,
	initialState as addToFavoritesInitialState,
	AddToFavoritesModalState,
} from './addToFavoritesModal';
import { ActiveModal, PerModalState } from '@appTypes/modalTypes';

export interface ModalsState {
	activeModal: ActiveModal;
	isVisible: boolean;
	addToFavorites: AddToFavoritesModalState;
	modalProps: {
		[K in ActiveModal]: PerModalState[K];
	};
}

export const initialState: ModalsState = {
	activeModal: ActiveModal.NONE,
	isVisible: false,
	addToFavorites: addToFavoritesInitialState,
	modalProps: {
		[ActiveModal.ADD_FAVORITES_DIRECTORY]: { selectedNodeKey: 1 },
		[ActiveModal.ADD_POSTS_TO_FAVORITES]: { postIdsToFavorite: [] },
		[ActiveModal.DELETE_FAVORITES_DIRECTORY]: { selectedNodeKey: 1 },
		[ActiveModal.MOVE_POSTS_TO_DIRECTORY_CONFIRMATION]: { postIdsToMove: [], targetDirectoryKey: 1 },
		[ActiveModal.MOVE_POSTS_TO_DIRECTORY_SELECTION]: { postIdsToMove: [] },
		[ActiveModal.RENAME_FAVORITES_DIRECTORY]: { targetDirectoryKey: 1 },
		[ActiveModal.SETTINGS]: {},
		[ActiveModal.NONE]: {},
	},
};

const modalSlice = createSlice({
	name: 'modals',
	initialState: initialState,
	reducers: {
		showModal: (state, action: PayloadAction<{ modal: ActiveModal; modalState: Partial<PerModalState> }>): void => {
			state.activeModal = action.payload.modal;
			(state.modalProps[action.payload.modal] as unknown) = action.payload.modalState[action.payload.modal];
			state.isVisible = true;
		},
		setVisible: (state, action: PayloadAction<boolean>): void => {
			if (!action.payload) {
				state.activeModal = ActiveModal.NONE;
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
