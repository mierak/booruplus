import { combineReducers } from 'redux';
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';

import { dashboardThunk } from './thunks/dashboard';
import { postsThunk } from './thunks/posts';
import { savedSearchesThunk } from './thunks/savedSearches';
import { settingsThunk } from './thunks/settings';
import { tagsThunk } from './thunks/tags';
import { tasksThunk } from './thunks/tasks';
import { favoritesThunk } from './thunks/favorites';
import { downloadedSearchFormThunk } from './thunks/downloadedSearchForm';
import { onlineSearchFormThunk } from './thunks/onlineSearchForm';

import onlineSearchFormReducer from './onlineSearchForm';
import postsReducer from './posts';
import systemReducer from './system';
import savedSearchesReducer from './savedSearches';
import tagsReducer from './tags';
import downloadedSearchFormReducer from './downloadedSearchForm';
import settingsReducer from './settings';
import dashboardReducer from './dashboard';
import tasksReducer from './tasks';
import loadingStatesReducer from './loadingStates';
import favoritesReducer from './favorites';
import modalsReducer from './modals/index';
import { RootState } from './types';

import { actions as posts } from './posts';
import { actions as onlineSearchForm } from './onlineSearchForm';
import { actions as system } from './system';
import { actions as savedSearches } from './savedSearches';
import { actions as tags } from './tags';
import { actions as downloadedSearchForm } from './downloadedSearchForm';
import { actions as settings } from './settings';
import { actions as dashboard } from './dashboard';
import { actions as tasks } from './tasks';
import { actions as loadingStates } from './loadingStates';
import { actions as favorites } from './favorites';
import { actions as modals } from './modals/index';

export const mainReducer = combineReducers({
	system: systemReducer,
	posts: postsReducer,
	savedSearches: savedSearchesReducer,
	tags: tagsReducer,
	downloadedSearchForm: downloadedSearchFormReducer,
	onlineSearchForm: onlineSearchFormReducer,
	settings: settingsReducer,
	dashboard: dashboardReducer,
	tasks: tasksReducer,
	loadingStates: loadingStatesReducer,
	favorites: favoritesReducer,
	modals: modalsReducer,
});

export const store = configureStore({
	reducer: mainReducer,
	middleware: [...getDefaultMiddleware<RootState>()],
});

export const actions = {
	posts,
	system,
	onlineSearchForm,
	savedSearches,
	tags,
	downloadedSearchForm,
	settings,
	dashboard,
	tasks,
	loadingStates,
	favorites,
	modals,
};

export const thunks = {
	onlineSearchForm: onlineSearchFormThunk,
	downloadedSearchForm: downloadedSearchFormThunk,
	favorites: favoritesThunk,
	dashboard: dashboardThunk,
	posts: postsThunk,
	savedSearches: savedSearchesThunk,
	settings: settingsThunk,
	tags: tagsThunk,
	tasks: tasksThunk,
};
