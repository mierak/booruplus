import { createSlice, AsyncThunk, ActionReducerMapBuilder } from '@reduxjs/toolkit';
import * as thunks from './thunks';
import { thunkLoggerFactory } from '../util/logger';
import { ThunkApi } from './types';

const thunkLogger = thunkLoggerFactory();

type MyThunk = AsyncThunk<unknown, unknown, ThunkApi>;

interface ThunkType {
	[key: string]: unknown;
}

const registerErrorLogger = (builder: ActionReducerMapBuilder<{}>, action: MyThunk): void => {
	builder.addCase(action.rejected, (_, result) => {
		thunkLogger.getActionLogger(action, { logPending: false }).error(result?.error?.message);
	});
};

const registerAllFunctions = (thunk: ThunkType, builder: ActionReducerMapBuilder<{}>): void => {
	const keys = Object.keys(thunk);
	keys.forEach((key) => {
		const func = thunk[key];
		if (Object.prototype.hasOwnProperty.call(func, 'rejected')) {
			registerErrorLogger(builder, (thunk[key] as unknown) as MyThunk);
		}
	});
};

const errorsSlice = createSlice({
	name: 'errors',
	initialState: {},
	reducers: {},
	extraReducers: (builder) => {
		registerAllFunctions(thunks.dashboard, builder);
		registerAllFunctions(thunks.downloadedSearchForm, builder);
		registerAllFunctions(thunks.favorites, builder);
		registerAllFunctions(thunks.onlineSearchForm, builder);
		registerAllFunctions(thunks.posts, builder);
		registerAllFunctions(thunks.savedSearches, builder);
		registerAllFunctions(thunks.settings, builder);
		registerAllFunctions(thunks.tags, builder);
		registerAllFunctions(thunks.tasks, builder);
	},
});

export default errorsSlice.reducer;
