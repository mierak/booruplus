import { ThunkApi } from 'store/types';
import { createAsyncThunk } from '@reduxjs/toolkit';

const create = createAsyncThunk<number, void, ThunkApi>(
	'tasks/create',
	async (_, thunkApi): Promise<number> => {
		const newId = thunkApi.getState().tasks.lastId + 1;
		return newId;
	}
);

export const tasksThunk = { create };
