import { createAsyncThunk } from '@reduxjs/toolkit';

import type { Task, ThunkApi } from '@store/types';

import { db } from '@db';
import { getActionLogger } from '@util/logger';

export const rehydrateFromDb = createAsyncThunk<Task[], void, ThunkApi>(
	'tasks/rehydrateFromDb',
	async (): Promise<Task[]> => {
		return await db.tasks.getAll();
	}
);

export const cancel = createAsyncThunk<Task, number, ThunkApi>(
	'tasks/cancel',
	async (id, thunkApi): Promise<Task> => {
		const logger = getActionLogger(cancel);
		const task = thunkApi.getState().tasks.tasks[id];
		const clone = { ...task };
		clone.state = 'canceled';
		logger.debug('State of Task id', clone.id, 'set to cancelled. Saving.');
		await db.tasks.save(clone);
		return clone;
	}
);

export const removeTask = createAsyncThunk<number, string | number, ThunkApi>(
	'tasks/remove',
	async (id): Promise<number> => {
		const logger = getActionLogger(removeTask);
		logger.debug('Removing task id', id);
		const newId = typeof id === 'string' ? parseInt(id) : id;
		await db.tasks.remove(newId);
		return newId;
	}
);
