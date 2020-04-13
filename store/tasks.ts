import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { AppThunk } from './types';

interface Task {
	id: number;
	progressPercent: number;
	isCanceled: boolean;
}
interface TasksState {
	tasks: {
		[id: number]: Task;
	};
	lastId: number;
}

const initialState: TasksState = {
	tasks: {},
	lastId: 1,
};

const tasksSlice = createSlice({
	name: 'tasks',
	initialState: initialState,
	reducers: {
		add: (state, action: PayloadAction<number>): void => {
			(state.tasks[action.payload] = {
				id: action.payload,
				progressPercent: 0,
				isCanceled: false,
			}),
				(state.lastId = action.payload);
		},
		remove: (state, action: PayloadAction<number>): void => {
			delete state.tasks[action.payload];
		},
		setProgress: (state, action: PayloadAction<{ id: number; progress: number }>): void => {
			state.tasks[action.payload.id].progressPercent = action.payload.progress;
		},
		setCanceled: (state, action: PayloadAction<{ id: number; value: boolean }>): void => {
			state.tasks[action.payload.id].isCanceled = action.payload.value;
		},
	},
});

const create = (): AppThunk<number> => async (dispatch, getState): Promise<number> => {
	const newId = getState().tasks.lastId + 1;
	dispatch(tasksSlice.actions.add(newId));
	return newId;
};

export const actions = { ...tasksSlice.actions, create };

export default tasksSlice.reducer;