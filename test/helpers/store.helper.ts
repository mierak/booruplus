import { initialState } from '../../src/store';
import { PostsContext, RootState, Settings, DownloadedSearchFormState } from '@store/types';
import { PostsState } from '@store/posts';
import { DashboardState } from '@store/dashboard';
import { FavoritesState } from '@store/favorites';
import { LoadingStates } from '@store/loadingStates';
import { TasksState } from '@store/tasks';
import { SystemState } from '@store/system';
import { SavedSearchesState } from '@store/savedSearches';
import { TagsState } from '@store/tags';
import Modals from '@store/modals';
import { Post } from '@appTypes/gelbooruTypes';
import { OnlineSearchFormState } from '@store/onlineSearchForm';

type DeepPartial<T> = {
	[P in keyof T]?: DeepPartial<T[P]>;
};

export const mPostsPostsState = (
	ps?: DeepPartial<{ [K in PostsContext]?: Post[] }>
): { [K in PostsContext]: Post[] } => {
	return {
		...ps,
		posts: (ps?.posts as Post[]) ?? initialState.posts.posts.favorites,
		favorites: (ps?.favorites as Post[]) ?? initialState.posts.posts.posts,
		mostViewed: (ps?.mostViewed as Post[]) ?? initialState.posts.posts.mostViewed,
		checkLaterQueue: (ps?.checkLaterQueue as Post[]) ?? initialState.posts.posts.checkLaterQueue,
	};
};

const mHoveredPostState = (
	hp?: DeepPartial<{ post: Post | undefined; visible: boolean }>
): { post: Post | undefined; visible: boolean } => {
	return {
		post: (hp?.post as Post) ?? initialState.posts.hoveredPost.post,
		visible: hp?.visible ?? initialState.posts.hoveredPost.visible,
	};
};

const mPostsState = (ps?: DeepPartial<PostsState>): PostsState => {
	return {
		selectedIndices: ps?.selectedIndices ?? {
			posts: ps?.selectedIndices?.posts ?? initialState.posts.selectedIndices.posts,
			favorites: ps?.selectedIndices?.favorites ?? initialState.posts.selectedIndices.favorites,
		},
		posts: mPostsPostsState(ps?.posts),
		hoveredPost: mHoveredPostState(ps?.hoveredPost),
	};
};

const mDashboardState = (ds?: Partial<DashboardState>): DashboardState => {
	return {
		mostDownloadedTag: ds?.mostDownloadedTag ?? initialState.dashboard.mostDownloadedTag,
		mostFavoritedTags: ds?.mostFavoritedTags ?? initialState.dashboard.mostFavoritedTags,
		mostSearchedTags: ds?.mostSearchedTags ?? initialState.dashboard.mostSearchedTags,
		ratingCounts: ds?.ratingCounts ?? initialState.dashboard.ratingCounts,
		totalBlacklistedPosts: ds?.totalBlacklistedPosts ?? initialState.dashboard.totalBlacklistedPosts,
		totalDownloadedPosts: ds?.totalDownloadedPosts ?? initialState.dashboard.totalDownloadedPosts,
		totalFavoritesPosts: ds?.totalFavoritesPosts ?? initialState.dashboard.totalFavoritesPosts,
		totalTags: ds?.totalTags ?? initialState.dashboard.totalTags,
	};
};

const mOnlineSearchFormState = (ds?: { [key: string]: Partial<DownloadedSearchFormState> }): OnlineSearchFormState => {
	if (ds) {
		const newObj: OnlineSearchFormState = {};
		for (const [key, value] of Object.entries(ds)) {
			newObj[key] = {
				...initialState.onlineSearchForm.default,
				...value,
			};
		}
		return newObj;
	}
	return { default: initialState.onlineSearchForm.default };
};

const mFavoritesState = (fs?: Partial<FavoritesState>): FavoritesState => {
	return {
		activeNodeKey: fs?.activeNodeKey ?? initialState.favorites.activeNodeKey,
		expandedKeys: fs?.expandedKeys ?? initialState.favorites.expandedKeys,
		rootNode: fs?.rootNode ?? initialState.favorites.rootNode,
	};
};

const mLoadingStates = (ls?: Partial<LoadingStates>): LoadingStates => {
	return {
		isFullImageLoading: ls?.isFullImageLoading ?? initialState.loadingStates.isFullImageLoading,
		isMostFavoritedTagsLoading: ls?.isMostFavoritedTagsLoading ?? initialState.loadingStates.isMostFavoritedTagsLoading,
		isMostSearchedTagsLoading: ls?.isMostSearchedTagsLoading ?? initialState.loadingStates.isMostSearchedTagsLoading,
		isRatingDistributionChartLoading:
			ls?.isRatingDistributionChartLoading ?? initialState.loadingStates.isRatingDistributionChartLoading,
		isFullscreenLoadingMaskVisible:
			ls?.isFullscreenLoadingMaskVisible ?? initialState.loadingStates.isFullscreenLoadingMaskVisible,
		fullscreenLoadingMaskMessage: ls?.fullscreenLoadingMaskMessage,
		isScrolling: ls?.isScrolling ?? false,
		isFetchingPosts: ls?.isFetchingPosts ?? initialState.loadingStates.isFetchingPosts,
		isSearchDisabled: ls?.isSearchDisabled ?? initialState.loadingStates.isSearchDisabled,
		fullscreenLoadingMaskPercentProgress:
			ls?.fullscreenLoadingMaskPercentProgress ?? initialState.loadingStates.fullscreenLoadingMaskPercentProgress,
	};
};

const mTasksState = (ts?: Partial<TasksState>): TasksState => {
	return {
		lastId: ts?.lastId ?? initialState.tasks.lastId,
		tasks: ts?.tasks ?? initialState.tasks.tasks,
	};
};

const mSystemState = (ss?: Partial<SystemState>): SystemState => {
	return { ...initialState.system, ...ss };
};

const mDashboardSettingsState = (
	dss?: Partial<typeof initialState.settings.dashboard>
): typeof initialState.settings.dashboard => {
	return {
		loadMostFavoritedTags: dss?.loadMostFavoritedTags ?? initialState.settings.dashboard.loadMostFavoritedTags,
		loadMostSearchedTags: dss?.loadMostSearchedTags ?? initialState.settings.dashboard.loadMostSearchedTags,
		loadMostViewedPosts: dss?.loadMostViewedPosts ?? initialState.settings.dashboard.loadMostViewedPosts,
		loadRatingDistributionChart:
			dss?.loadRatingDistributionChart ?? initialState.settings.dashboard.loadRatingDistributionChart,
		loadTagStatistics: dss?.loadTagStatistics ?? initialState.settings.dashboard.loadTagStatistics,
		mostViewedCount: dss?.mostViewedCount ?? initialState.settings.dashboard.mostViewedCount,
		saveTagsNotFoundInDb: dss?.saveTagsNotFoundInDb ?? initialState.settings.dashboard.saveTagsNotFoundInDb,
	};
};

const mSettingsState = (ss?: DeepPartial<Settings>): Settings => {
	return {
		apiKey: ss?.apiKey ?? initialState.settings.apiKey,
		imagesFolderPath: ss?.imagesFolderPath ?? initialState.settings.imagesFolderPath,
		theme: ss?.theme ?? initialState.settings.theme,
		gelbooruUsername: ss?.gelbooruUsername ?? initialState.settings.gelbooruUsername,
		downloadMissingImages: ss?.downloadMissingImages ?? initialState.settings.downloadMissingImages,
		imageHover: ss?.imageHover ?? initialState.settings.imageHover,
		dashboard: mDashboardSettingsState(ss?.dashboard) ?? initialState.settings.dashboard,
		favorites: {
			siderWidth: ss?.favorites?.siderWidth ?? initialState.settings.favorites.siderWidth,
			expandedKeys: (ss?.favorites?.expandedKeys as string[] | undefined) ?? initialState.settings.favorites.expandedKeys,
		},
	};
};

const mSavedSearchesState = (sss?: Partial<SavedSearchesState>): SavedSearchesState => {
	return {
		activeSavedSearch: sss?.activeSavedSearch ?? initialState.savedSearches.activeSavedSearch,
		savedSearches: sss?.savedSearches ?? initialState.savedSearches.savedSearches,
	};
};

const mTagsState = (ts?: Partial<TagsState>): TagsState => {
	return {
		tags: ts?.tags ?? initialState.tags.tags,
	};
};

const mModalsState = (ms?: Partial<ReturnType<typeof Modals>>): ReturnType<typeof Modals> => {
	return {
		activeModal: ms?.activeModal ?? initialState.modals.activeModal,
		isVisible: ms?.isVisible ?? initialState.modals.isVisible,
		modalProps: ms?.modalProps ?? initialState.modals.modalProps,
	};
};

type PartialRootState = {
	dashboard?: Partial<DashboardState>;
	onlineSearchForm?: { [key: string]: Partial<DownloadedSearchFormState> };
	favorites?: Partial<FavoritesState>;
	loadingStates?: Partial<LoadingStates>;
	tasks?: Partial<TasksState>;
	posts?: DeepPartial<PostsState>;
	settings?: DeepPartial<Settings>;
	system?: Partial<SystemState>;
	savedSearches?: Partial<SavedSearchesState>;
	tags?: Partial<TagsState>;
	modals?: Partial<ReturnType<typeof Modals>>;
};

export const mState = (state?: PartialRootState): RootState => {
	return {
		dashboard: mDashboardState(state?.dashboard),
		onlineSearchForm: mOnlineSearchFormState(state?.onlineSearchForm),
		favorites: mFavoritesState(state?.favorites),
		loadingStates: mLoadingStates(state?.loadingStates),
		tasks: mTasksState(state?.tasks),
		posts: mPostsState(state?.posts),
		settings: mSettingsState(state?.settings),
		system: mSystemState(state?.system),
		savedSearches: mSavedSearchesState(state?.savedSearches),
		tags: mTagsState(state?.tags),
		modals: mModalsState(state?.modals),
	};
};
