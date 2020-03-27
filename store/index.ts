import { combineReducers } from 'redux';
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';

import postsReducer, { actions as posts } from './posts';
import systemReducer, { actions as system } from './system';
import onlineSearchFormReducer, { actions as onlineSearchForm } from './onlineSearchForm';
import savedSearchesReducer, { actions as savedSearches } from './savedSearches';
import tagsReducer, { actions as tags } from './tags';
import downloadedSearchFormReducer, { actions as downloadedSearchForm } from './downloadedSearchForm';
import settingsReducer, { actions as settings } from './settings';
import { RootState } from './types';

export const mainReducer = combineReducers({
	system: systemReducer,
	posts: postsReducer,
	savedSearches: savedSearchesReducer,
	tags: tagsReducer,
	downloadedSearchForm: downloadedSearchFormReducer,
	onlineSearchForm: onlineSearchFormReducer,
	settings: settingsReducer
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
	downloadedSearchForm,
	settings
};
