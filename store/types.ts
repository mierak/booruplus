import { mainReducer, store } from '.';
import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { Tag } from '../types/gelbooruTypes';

export type RootState = ReturnType<typeof mainReducer>;

export type AppThunk<T = void> = ThunkAction<Promise<T>, RootState, unknown, Action<string>>;

export type AppDispatch = typeof store.dispatch;

export interface ThunkApi {
	dispatch: AppDispatch;
	state: RootState;
}

export type View = 'thumbnails' | 'image' | 'dashboard' | 'online-search' | 'saved-searches' | 'favorites' | 'tag-list';

export type SearchMode =
	| 'online'
	| 'offline'
	| 'favorites'
	| 'saved-search-offline'
	| 'saved-search-online'
	| 'most-viewed'
	| 'open-download';

export type ActiveModal =
	| 'none'
	| 'add-to-favorites'
	| 'add-favorites-directory'
	| 'delete-favorites-directory'
	| 'move-to-directory'
	| 'settings';

export interface OfflineOptions {
	blacklisted: boolean;
	favorite: boolean;
}

export interface PostPropertyOptions {
	blacklisted?: 0 | 1;
	favorite?: 0 | 1;
	downloaded?: 0 | 1;
}

export interface DashboardSettings {
	mostViewedCount: number;
	loadMostSearchedTags: boolean;
	loadMostFavoritedTags: boolean;
	loadMostViewedPosts: boolean;
	loadTagStatistics: boolean;
	loadRatingDistributionChart: boolean;
}

export interface Settings {
	imagesFolderPath: string;
	theme: 'dark' | 'light';
	apiKey?: string;
	gelbooruUsername?: string;
	dashboard: DashboardSettings;
}

export interface TagHistory {
	tag: Tag;
	date: string;
	count: number;
}

export interface TreeNode {
	title: string | React.ReactNode;
	key: string;
	children: TreeNode[];
	postIds: number[];
}

export type TreeData = TreeNode[];

export interface RatingCounts {
	[key: string]: number;
}

export type TaskState = 'preparing' | 'downloading' | 'completed' | 'failed' | 'canceled';

export interface Task {
	id: number;
	timestampStarted: number;
	timestampDone?: number;
	items: number;
	itemsDone: number;
	state: TaskState;
	postIds: number[];
}

export interface FoundTags {
	tag: Tag;
	count: number;
}

export interface NotFoundTags {
	tag: string;
	count: number;
}
