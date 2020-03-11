import { combineReducers, Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import posts from './posts';
import system from './system';
import searchFormReducer from './searchForm';
import savedSearches from './savedSearches';

export const mainReducer = combineReducers({
	system: system,
	posts: posts,
	searchForm: searchFormReducer,
	savedSearches: savedSearches
});

export const store = configureStore({
	reducer: mainReducer,
	middleware: [...getDefaultMiddleware<RootState>()]
});

export type RootState = ReturnType<typeof mainReducer>;

export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>;

export type AppDispatch = typeof store.dispatch;
