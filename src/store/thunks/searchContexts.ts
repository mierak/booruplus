import { createAsyncThunk } from '@reduxjs/toolkit';

import type { ThunkApi } from '@store/types';

import { thunkLoggerFactory } from '@util/logger';

const thunkLogger = thunkLoggerFactory();

export const generateSearchContext = createAsyncThunk<string, void, ThunkApi>(
	'searchContexts/generate',
	async (_, { getState }): Promise<string> => {
		const logger = thunkLogger.getActionLogger(generateSearchContext);
		const currentContexts = Object.keys(getState().searchContexts).filter(
			(ctx) => getState().searchContexts[ctx].mode !== 'other'
		);

		const lastTabNumber = Math.max(...currentContexts.map((ctx) => Number(ctx.match(/\d+/)?.[0] ?? 0)), 0);
		const newContext = `tab${lastTabNumber + 1}`;
		logger.debug('Generated new search context', newContext);

		return newContext;
	}
);
