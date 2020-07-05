import { combineReducers } from 'redux';
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';

// import { dashboardThunk } from './thunks/dashboard';
// import { postsThunk } from './thunks/posts';
// import { savedSearchesThunk } from './thunks/savedSearches';
// import { settingsThunk } from './thunks/settings';
// import { tagsThunk } from './thunks/tags';
// import { tasksThunk } from './thunks/tasks';
// import { favoritesThunk } from './thunks/favorites';
// import { downloadedSearchFormThunk } from './thunks/downloadedSearchForm';
// import { onlineSearchFormThunk } from './thunks/onlineSearchForm';

// import { thunks as thunksObj } from './thunks';

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

import { actions as posts, initialState as postsInitialState } from './posts';
import { actions as onlineSearchForm, initialState as onlineSearchFormInitialState } from './onlineSearchForm';
import { actions as system, initialState as systemInitialState } from './system';
import { actions as savedSearches, initialState as savedSearchesInitialState } from './savedSearches';
import { actions as tags, initialState as tagsInitialState } from './tags';
import { actions as downloadedSearchForm, initialState as downloadedSearchFormInitialState } from './downloadedSearchForm';
import { actions as settings, initialState as settingsInitialState } from './settings';
import { actions as dashboard, initialState as dashboardInitialState } from './dashboard';
import { actions as tasks, initialState as tasksInitialState } from './tasks';
import { actions as loadingStates, initialState as loadingStatesInitialState } from './loadingStates';
import { actions as favorites, initialState as favoritesInitialState } from './favorites';
import { actions as modals, initialState as modalsInitialState } from './modals/index';
import { initialState as addToFavoritesModalInitialState } from './modals/addToFavoritesModal';

import * as allThunks from './thunks';

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

export const initialState = {
	system: systemInitialState,
	posts: postsInitialState,
	savedSearches: savedSearchesInitialState,
	tags: tagsInitialState,
	downloadedSearchForm: downloadedSearchFormInitialState,
	onlineSearchForm: onlineSearchFormInitialState,
	settings: settingsInitialState,
	dashboard: dashboardInitialState,
	tasks: tasksInitialState,
	loadingStates: loadingStatesInitialState,
	favorites: favoritesInitialState,
	modals: { common: modalsInitialState, addToFavoritesModal: addToFavoritesModalInitialState },
};

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
	...allThunks,
};