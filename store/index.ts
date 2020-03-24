import { combineReducers, Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';

import postsReducer, { actions as posts } from './posts';
import systemReducer, { actions as system } from './system';
import searchFormReducer, { actions as onlineSearchForm } from './searchForm';
import savedSearchesReducer, { actions as savedSearches } from './savedSearches';
import tagsReducer, { actions as tags } from './tags';
import downloadedSearchFormReducer, { actions as downloadedSearchForm } from './downloadedSearchForm';

export const mainReducer = combineReducers({
	system: systemReducer,
	posts: postsReducer,
	searchForm: searchFormReducer,
	savedSearches: savedSearchesReducer,
	tags: tagsReducer,
	downloadedSearchForm: downloadedSearchFormReducer
});

export const store = configureStore({
	reducer: mainReducer,
	middleware: [...getDefaultMiddleware<RootState>()]
});

export const actions = {
	posts,
	system,
	onlineSearchForm,
	savedSearches,
	tags,
	downloadedSearchForm
};

export type RootState = ReturnType<typeof mainReducer>;

export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>;

export type AppDispatch = typeof store.dispatch;
