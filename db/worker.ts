import { expose } from 'comlink';

import * as posts from './posts';
import * as tags from './tags';
import * as savedSearches from './savedSearches';
import * as settings from './settings';
import * as tagSearchHistory from './tagSearchHistory';
import * as favoritesTree from './favoritesTree';

export const dbWorker = {
	posts,
	tags,
	savedSearches,
	settings,
	tagSearchHistory,
	favoritesTree
};

expose(dbWorker);
