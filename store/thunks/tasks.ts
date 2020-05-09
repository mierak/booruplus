import { createAsyncThunk } from '@reduxjs/toolkit';

import { db } from 'db';

import { ThunkApi, Task } from 'store/types';

export const create = createAsyncThunk<number, void, ThunkApi>(
	'tasks/create',
	async (_, thunkApi): Promise<number> => {
		const newId = thunkApi.getState().tasks.lastId + 1;
		return newId;
	}
);

export const rehydrateFromDb = createAsyncThunk<Task[], void, ThunkApi>(
	'tasks/rehydrateFromDb',
	async (): Promise<Task[]> => {
		return await db.tasks.getAll();
	}
);

export const cancel = createAsyncThunk<Task, number, ThunkApi>(
	'tasks/cancel',
	async (id, thunkApi): Promise<Task> => {
		const task = thunkApi.getState().tasks.tasks[id];
		const clone = { ...task };
		clone.state = 'canceled';
		await db.tasks.save(clone);
		return clone;
	}
);
