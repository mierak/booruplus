import { createAsyncThunk } from '@reduxjs/toolkit';

import { db } from '@db';
import { ThunkApi, Task } from '@store/types';
import { thunkLoggerFactory } from '@util/logger';

const thunkLogger = thunkLoggerFactory();

export const rehydrateFromDb = createAsyncThunk<Task[], void, ThunkApi>(
	'tasks/rehydrateFromDb',
	async (): Promise<Task[]> => {
		thunkLogger.getActionLogger(rehydrateFromDb);
		return await db.tasks.getAll();
	}
);

export const cancel = createAsyncThunk<Task, number, ThunkApi>(
	'tasks/cancel',
	async (id, thunkApi): Promise<Task> => {
		const logger = thunkLogger.getActionLogger(cancel);
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
		const logger = thunkLogger.getActionLogger(removeTask);
		logger.debug('Removing task id', id);
		const newId = typeof id === 'string' ? parseInt(id) : id;
		await db.tasks.remove(newId);
		return newId;
	}
);
