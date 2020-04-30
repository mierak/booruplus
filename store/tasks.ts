import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import * as thunks from './thunks';
import { Task, TaskState } from './types';

interface TasksState {
	tasks: {
		[id: number]: Task;
	};
	lastId: number;
}

const initialState: TasksState = {
	tasks: {},
	lastId: 0,
};

const tasksSlice = createSlice({
	name: 'tasks',
	initialState: initialState,
	reducers: {
		remove: (state, action: PayloadAction<number>): void => {
			delete state.tasks[action.payload];
		},
		setState: (state, action: PayloadAction<{ id: number; value: TaskState }>): void => {
			state.tasks[action.payload.id].state = action.payload.value;
			state.tasks[action.payload.id].timestampDone = Date.now();
		},
	},
	extraReducers: (builder) => {
		builder.addCase(thunks.tasks.rehydrateFromDb.fulfilled, (state, action) => {
			state.tasks = action.payload;
		});
		builder.addCase(thunks.tasks.create.fulfilled, (state, action) => {
			state.lastId = action.payload;
		});
		builder.addCase(thunks.posts.downloadPosts.pending, (state, action) => {
			const newId = state.lastId + 1;
			state.lastId = newId;
			state.tasks[newId] = {
				id: newId,
				timestampStarted: Date.now(),
				items: action.meta.arg.posts.length,
				itemsDone: 0,
				state: 'preparing',
				postIds: action.meta.arg.posts.map((post) => post.id),
			};
		});
		builder.addCase(thunks.posts.downloadPost.fulfilled, (state, action) => {
			const id = action.meta.arg.taskId;
			if (id) {
				const task = state.tasks[id];
				task.itemsDone = task.itemsDone + 1;
				if (task.itemsDone / task.items >= 1) {
					task.state = 'completed';
					task.timestampDone = Date.now();
				} else if (task.state !== 'canceled') {
					task.state = 'downloading';
				}
			}
		});
	},
});

export const actions = tasksSlice.actions;

export default tasksSlice.reducer;
