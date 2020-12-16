import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ActiveModal, PerModalState } from '@appTypes/modalTypes';

export interface ModalsState {
	activeModal: ActiveModal;
	isVisible: boolean;
	modalProps: {
		[K in ActiveModal]: PerModalState[K];
	};
}

export const initialState: ModalsState = {
	activeModal: ActiveModal.NONE,
	isVisible: false,
	modalProps: {
		[ActiveModal.ADD_FAVORITES_DIRECTORY]: { selectedNodeKey: 1 },
		[ActiveModal.ADD_POSTS_TO_FAVORITES]: { postsToFavorite: [] },
		[ActiveModal.DELETE_FAVORITES_DIRECTORY]: { selectedNodeKey: 1 },
		[ActiveModal.MOVE_POSTS_TO_DIRECTORY_CONFIRMATION]: { postsToMove: [], targetDirectoryKey: 1 },
		[ActiveModal.MOVE_POSTS_TO_DIRECTORY_SELECTION]: { postsToMove: [] },
		[ActiveModal.RENAME_FAVORITES_DIRECTORY]: { targetDirectoryKey: 1 },
		[ActiveModal.SETTINGS]: undefined,
		[ActiveModal.NONE]: undefined,
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
			state.modalProps = initialState.modalProps;
			if (!action.payload) {
				state.activeModal = ActiveModal.NONE;
			}
			state.isVisible = action.payload;
		},
	},
});

type ShowModalAction = ReturnType<typeof modalSlice.actions.showModal>;
const showModal = <K extends ActiveModal>(modal: K, modalState: PerModalState[K]): ShowModalAction => {
	return modalSlice.actions.showModal({
		modal,
		modalState: {
			[modal]: modalState,
		},
	});
};
showModal.type = modalSlice.actions.showModal.type;

export const actions = { ...modalSlice.actions, showModal };

export default modalSlice.reducer;
