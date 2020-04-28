import { dashboardThunk } from './thunks/dashboard';
import { postsThunk } from './thunks/posts';
import { savedSearchesThunk } from './thunks/savedSearches';
import { settingsThunk } from './thunks/settings';
import { tagsThunk } from './thunks/tags';
import { tasksThunk } from './thunks/tasks';
import { favoritesThunk } from './thunks/favorites';
import { downloadedSearchFormThunk } from './thunks/downloadedSearchForm';
import { onlineSearchFormThunk } from './thunks/onlineSearchForm';

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
