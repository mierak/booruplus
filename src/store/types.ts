import { mainReducer, store } from '.';
import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';

export type RootState = ReturnType<typeof mainReducer>;

export type AppThunk<T = void> = ThunkAction<Promise<T>, RootState, unknown, Action<string>>;

export type AppDispatch = typeof store.dispatch;

export type RejectWithValue<V> = {
	value: V;
};

export type ThunkApi<Rejected = void> = {
	dispatch: AppDispatch;
	state: RootState;
	rejectValue: Rejected;
};

import type { Tag, Rating } from '@appTypes/gelbooruTypes';

export type View = 'searches' | 'image' | 'dashboard' | 'saved-searches' | 'favorites' | 'tag-list' | 'check-later';

export type Sort = 'date-downloaded' | 'date-uploaded' | 'rating' | 'resolution' | 'date-updated' | 'none';

export type SortOrder = 'asc' | 'desc';

export type SearchMode = 'online' | 'offline';

export type OfflineOptions = {
	blacklisted: boolean;
	favorite: boolean;
};

export type PostPropertyOptions = {
	blacklisted?: 0 | 1;
	favorite?: 0 | 1;
	downloaded?: 0 | 1;
};

export type DashboardSettings = {
	mostViewedCount: number;
	loadMostSearchedTags: boolean;
	loadMostFavoritedTags: boolean;
	loadMostViewedPosts: boolean;
	loadTagStatistics: boolean;
	loadRatingDistributionChart: boolean;
	saveTagsNotFoundInDb: boolean;
};

export type Settings = {
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
};

export type DownloadTaskState = {
	taskId: number;
	skipped: number;
	downloaded: number;
	canceled: boolean;
};

export type TagHistory = {
	tag: Tag;
	date: string;
	count: number;
};

export type TreeNode = {
	title: string | React.ReactNode;
	key: string;
	children: TreeNode[];
	postIds: number[];
};

export type TreeData = TreeNode[];

export type RatingCounts = {
	[key: string]: number;
};

export type TaskState = 'preparing' | 'downloading' | 'completed' | 'failed' | 'canceled';

export type Task = {
	id: number;
	timestampStarted: number;
	timestampDone?: number;
	items: number;
	itemsDone: number;
	state: TaskState;
	postIds: number[];
};

export type FoundTags = {
	tag: Tag;
	count: number;
};

export type NotFoundTags = {
	tag: string;
	count: number;
};

export type SearchFormState = {
	mode: SearchMode;
	savedSearchId?: number;
	selectedTags: Tag[];
	excludedTags: Tag[];
	limit: number;
	rating: Rating;
	page: number;
	tagOptions: Tag[];
	sort: Sort;
	sortOrder: SortOrder;
};

export type DownloadedSearchFormState = SearchFormState & {
	showNonBlacklisted: boolean;
	showBlacklisted: boolean;
	showFavorites: boolean;
	showVideos: boolean;
	showImages: boolean;
	showGifs: boolean;
};

export type PostsContext = 'posts' | 'favorites' | 'mostViewed' | 'checkLaterQueue';

export type WithContext<T = null> = { context: PostsContext | string } & (T extends null ? unknown : { data: T });