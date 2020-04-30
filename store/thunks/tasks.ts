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
