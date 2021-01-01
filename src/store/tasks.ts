import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import type { Task, TaskState } from './types';

import * as thunks from './thunks';

const log = window.log;

export type Tasks = {
	[id: number]: Task;
}

export type TasksState = {
	tasks: Tasks;
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
			log.error('Error occured while trying to cancel a task', action.error.message);
		});
		builder.addCase(thunks.tasks.removeTask.fulfilled, (state, action) => {
			const copy = state.tasks;
			delete copy[action.payload];
			state.tasks = copy;
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

				if (task.state !== 'canceled') {
					task.state = 'downloading';
				}
			}
		});
		builder.addCase(thunks.posts.persistTask.fulfilled, (state, action) => {
			const task = action.payload;

			if (task) {
				state.tasks[task.id] = task;
			}
		});
	},
});

export const actions = tasksSlice.actions;

export default tasksSlice.reducer;
