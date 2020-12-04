import { mainReducer, store } from '.';
import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';

import { Tag, Rating } from '@appTypes/gelbooruTypes';

export type RootState = ReturnType<typeof mainReducer>;

export type AppThunk<T = void> = ThunkAction<Promise<T>, RootState, unknown, Action<string>>;

export type AppDispatch = typeof store.dispatch;

export interface RejectWithValue<V> {
	value: V;
}

export interface ThunkApi<Rejected = void> {
	dispatch: AppDispatch;
	state: RootState;
	rejectValue: Rejected;
}

export type View = 'search-results' | 'image' | 'dashboard' | 'saved-searches' | 'favorites' | 'tag-list';

export type Sort = 'date-downloaded' | 'date-uploaded' | 'rating' | 'resolution' | 'date-updated' | 'none';

export type SortOrder = 'asc' | 'desc';

export type SearchMode =
	| 'online'
	| 'offline'
	| 'favorites'
	| 'saved-search-offline'
	| 'saved-search-online'
	| 'most-viewed'
	| 'open-download';

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
	saveTagsNotFoundInDb: boolean;
}

export interface Settings {
	imagesFolderPath: string;
	theme: 'dark' | 'light';
	apiKey: string | undefined;
	gelbooruUsername?: string;
	downloadMissingImages: boolean;
	imageHover: boolean;
	dashboard: DashboardSettings;
	favorites: {
		siderWidth: number | undefined;
		expandedKeys: string[];
	};
}

export interface DownloadedSearchFormState {
	selectedTags: Tag[];
	excludedTags: Tag[];
	tagOptions: Tag[];
	rating: Rating;
	postLimit: number;
	page: number;
	sort: Sort;
	sortOrder: SortOrder;
	showNonBlacklisted: boolean;
	showBlacklisted: boolean;
	showFavorites: boolean;
	showVideos: boolean;
	showImages: boolean;
	showGifs: boolean;
}

export interface DownloadTaskState {
	taskId: number;
	skipped: number;
	downloaded: number;
	canceled: boolean;
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

export type PostsContext = 'posts' | 'favorites' | 'mostViewed';