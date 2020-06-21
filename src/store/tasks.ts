import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import * as thunks from './thunks';
import { Task, TaskState } from './types';

export interface TasksState {
	tasks: {
		[id: number]: Task;
	};
	lastId: number;
}

export const initialState: TasksState = {
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
			const tasks: { [id: number]: Task } = {};
			action.payload.forEach((task) => {
				const id = task.id;
				tasks[id] = task;
			});
			state.tasks = tasks;

			state.lastId = Math.max(...action.payload.map((task) => task.id), 0);
		});
		builder.addCase(thunks.tasks.cancel.fulfilled, (state, action) => {
			state.tasks[action.payload.id] = action.payload;
		});
		builder.addCase(thunks.tasks.cancel.rejected, (_, action) => {
			console.error(action.error.message);
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
