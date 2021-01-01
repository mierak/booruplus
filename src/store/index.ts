import { AnyAction, combineReducers, Dispatch, Middleware, MiddlewareAPI } from 'redux';
import { configureStore, PayloadAction } from '@reduxjs/toolkit';
import thunk, { ThunkMiddleware } from 'redux-thunk';

import searchContextsReducer, {
	actions as searchContexts,
	initialState as searchContextsState,
} from './searchContexts';
import postsReducer, { actions as posts, initialState as postsInitialState } from './posts';
import systemReducer, { actions as system, initialState as systemInitialState } from './system';
import savedSearchesReducer, {
	actions as savedSearches,
	initialState as savedSearchesInitialState,
} from './savedSearches';
import tagsReducer, { actions as tags, initialState as tagsInitialState } from './tags';
import settingsReducer, { actions as settings, initialState as settingsInitialState } from './settings';
import dashboardReducer, { actions as dashboard, initialState as dashboardInitialState } from './dashboard';
import tasksReducer, { actions as tasks, initialState as tasksInitialState } from './tasks';
import loadingStatesReducer, {
	actions as loadingStates,
	initialState as loadingStatesInitialState,
} from './loadingStates';
import favoritesReducer, { actions as favorites, initialState as favoritesInitialState } from './favorites';
import modalsReducer, { actions as modals, initialState as modalsInitialState } from './modals';

import * as allThunks from './thunks';

export const mainReducer = combineReducers({
	system: systemReducer,
	posts: postsReducer,
	savedSearches: savedSearchesReducer,
	tags: tagsReducer,
	searchContexts: searchContextsReducer,
	settings: settingsReducer,
	dashboard: dashboardReducer,
	tasks: tasksReducer,
	loadingStates: loadingStatesReducer,
	favorites: favoritesReducer,
	modals: modalsReducer,
});

export const initialState = {
	system: systemInitialState,
	posts: postsInitialState,
	savedSearches: savedSearchesInitialState,
	tags: tagsInitialState,
	searchContexts: searchContextsState,
	settings: settingsInitialState,
	dashboard: dashboardInitialState,
	tasks: tasksInitialState,
	loadingStates: loadingStatesInitialState,
	favorites: favoritesInitialState,
	modals: modalsInitialState,
};

export const actions = {
	posts,
	system,
	searchContexts,
	savedSearches,
	tags,
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

const loggerMiddleware: Middleware = <D extends Dispatch<AnyAction>, S>(api: MiddlewareAPI<D, S>) => {
	return (next) => {
		return <A extends PayloadAction<unknown, string> & { meta?: { arg?: unknown } }>(action: A): A => {
			if (action.type.endsWith('rejected')) {
				window.log.error(`[${action.type}]`, action);
				window.log.error('State before error', api.getState());
			} else {
				window.log.debug(
					`[${action.type}]`,
					...(action.payload ? ['-', 'Payload:', action.payload] : []),
					...(action?.meta?.arg ? ['-', 'Arg:', action.meta.arg] : [])
				);
			}
			return next(action);
		};
	};
};

export const store = configureStore({
	reducer: mainReducer,
	middleware: [thunk as ThunkMiddleware<ReturnType<typeof mainReducer>>, loggerMiddleware],
});
