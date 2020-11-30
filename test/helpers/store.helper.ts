import { initialState } from '../../src/store';
import { RootState, Settings } from '@store/types';
import { PostsState } from '@store/posts';
import { DashboardState } from '@store/dashboard';
import { DownloadedSearchFormState } from '@store/types';
import { SearchFormState } from '@store/onlineSearchForm';
import { FavoritesState } from '@store/favorites';
import { LoadingStates } from '@store/loadingStates';
import { TasksState } from '@store/tasks';
import { SystemState } from '@store/system';
import { SavedSearchesState } from '@store/savedSearches';
import { TagsState } from '@store/tags';
import Modals from '@store/modals';

type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends Array<infer U>
		? Array<DeepPartial<U>>
		: T[P] extends ReadonlyArray<infer U>
		? ReadonlyArray<DeepPartial<U>>
		: DeepPartial<T[P]>;
};

const mPostsState = (ps?: Partial<PostsState>): PostsState => {
	return {
		selectedIndices: ps?.selectedIndices ?? {
			posts: ps?.selectedIndices?.posts ?? initialState.posts.selectedIndices.posts,
			favorites: ps?.selectedIndices?.favorites ?? initialState.posts.selectedIndices.favorites,
		},
		posts: ps?.posts ?? {
			favorites: ps?.posts?.favorites ?? initialState.posts.posts.posts,
			posts: ps?.posts?.posts ?? initialState.posts.posts.favorites,
		},
		hoveredPost: ps?.hoveredPost ?? {
			post: ps?.hoveredPost?.post ?? initialState.posts.hoveredPost.post,
			visible: ps?.hoveredPost?.visible ?? initialState.posts.hoveredPost.visible,
		},
	};
};

const mDashboardState = (ds?: Partial<DashboardState>): DashboardState => {
	return {
		mostDownloadedTag: ds?.mostDownloadedTag ?? initialState.dashboard.mostDownloadedTag,
		mostFavoritedTags: ds?.mostFavoritedTags ?? initialState.dashboard.mostFavoritedTags,
		mostSearchedTags: ds?.mostSearchedTags ?? initialState.dashboard.mostSearchedTags,
		mostViewedPosts: ds?.mostViewedPosts ?? initialState.dashboard.mostViewedPosts,
		ratingCounts: ds?.ratingCounts ?? initialState.dashboard.ratingCounts,
		totalBlacklistedPosts: ds?.totalBlacklistedPosts ?? initialState.dashboard.totalBlacklistedPosts,
		totalDownloadedPosts: ds?.totalDownloadedPosts ?? initialState.dashboard.totalDownloadedPosts,
		totalFavoritesPosts: ds?.totalFavoritesPosts ?? initialState.dashboard.totalFavoritesPosts,
		totalTags: ds?.totalTags ?? initialState.dashboard.totalTags,
	};
};

const mDownloadedSearchFormState = (ds?: Partial<DownloadedSearchFormState>): DownloadedSearchFormState => {
	return {
		excludedTags: ds?.excludedTags ?? initialState.downloadedSearchForm.excludedTags,
		page: ds?.page ?? initialState.downloadedSearchForm.page,
		postLimit: ds?.postLimit ?? initialState.downloadedSearchForm.postLimit,
		rating: ds?.rating ?? initialState.downloadedSearchForm.rating,
		selectedTags: ds?.selectedTags ?? initialState.downloadedSearchForm.selectedTags,
		showBlacklisted: ds?.showBlacklisted ?? initialState.downloadedSearchForm.showBlacklisted,
		showFavorites: ds?.showFavorites ?? initialState.downloadedSearchForm.showFavorites,
		showGifs: ds?.showGifs ?? initialState.downloadedSearchForm.showGifs,
		showImages: ds?.showImages ?? initialState.downloadedSearchForm.showImages,
		showNonBlacklisted: ds?.showNonBlacklisted ?? initialState.downloadedSearchForm.showNonBlacklisted,
		showVideos: ds?.showVideos ?? initialState.downloadedSearchForm.showVideos,
		sort: ds?.sort ?? initialState.downloadedSearchForm.sort,
		sortOrder: ds?.sortOrder ?? initialState.downloadedSearchForm.sortOrder,
		tagOptions: ds?.tagOptions ?? initialState.downloadedSearchForm.tagOptions,
	};
};

const mOnlineSearchFormState = (os?: Partial<SearchFormState>): SearchFormState => {
	return {
		excludedTags: os?.excludedTags ?? initialState.onlineSearchForm.excludedTags,
		page: os?.page ?? initialState.onlineSearchForm.page,
		limit: os?.limit ?? initialState.onlineSearchForm.limit,
		rating: os?.rating ?? initialState.onlineSearchForm.rating,
		selectedTags: os?.selectedTags ?? initialState.onlineSearchForm.selectedTags,
		sort: os?.sort ?? initialState.onlineSearchForm.sort,
		sortOrder: os?.sortOrder ?? initialState.onlineSearchForm.sortOrder,
		tagOptions: os?.tagOptions ?? initialState.onlineSearchForm.tagOptions,
	};
};

const mFavoritesState = (fs?: Partial<FavoritesState>): FavoritesState => {
	return {
		activeNodeKey: fs?.activeNodeKey ?? initialState.favorites.activeNodeKey,
		expandedKeys: fs?.expandedKeys ?? initialState.favorites.expandedKeys,
		rootNode: fs?.rootNode ?? initialState.favorites.rootNode,
		selectedNodeKey: fs?.selectedNodeKey ?? initialState.favorites.selectedNodeKey,
	};
};

const mLoadingStates = (ls?: Partial<LoadingStates>): LoadingStates => {
	return {
		isFullImageLoading: ls?.isFullImageLoading ?? initialState.loadingStates.isFullImageLoading,
		isMostFavoritedTagsLoading: ls?.isMostFavoritedTagsLoading ?? initialState.loadingStates.isMostFavoritedTagsLoading,
		isMostSearchedTagsLoading: ls?.isMostSearchedTagsLoading ?? initialState.loadingStates.isMostSearchedTagsLoading,
		isRatingDistributionChartLoading: ls?.isRatingDistributionChartLoading ?? initialState.loadingStates.isRatingDistributionChartLoading,
		isFullscreenLoadingMaskVisible: ls?.isFullscreenLoadingMaskVisible ?? initialState.loadingStates.isFullscreenLoadingMaskVisible,
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
	return {
		activeView: ss?.activeView ?? initialState.system.activeView,
		imageViewContext: ss?.imageViewContext ?? initialState.system.imageViewContext,
		isDownloadedSearchFormDrawerVisible:
			ss?.isDownloadedSearchFormDrawerVisible ?? initialState.system.isDownloadedSearchFormDrawerVisible,
		isImageViewThumbnailsCollapsed:
			ss?.isImageViewThumbnailsCollapsed ?? initialState.system.isImageViewThumbnailsCollapsed,
		isFavoritesDirectoryTreeCollapsed:
			ss?.isFavoritesDirectoryTreeCollapsed ?? initialState.system.isFavoritesDirectoryTreeCollapsed,
		isSearchFormDrawerVsibile: ss?.isSearchFormDrawerVsibile ?? initialState.system.isSearchFormDrawerVsibile,
		isTagOptionsLoading: ss?.isTagOptionsLoading ?? initialState.system.isTagOptionsLoading,
		isTagTableLoading: ss?.isTagTableLoading ?? initialState.system.isTagTableLoading,
		isTagsPopoverVisible: ss?.isTagsPopoverVisible ?? initialState.system.isTagsPopoverVisible,
		isTasksDrawerVisible: ss?.isTasksDrawerVisible ?? initialState.system.isTasksDrawerVisible,
		searchMode: ss?.searchMode ?? initialState.system.searchMode,
	};
};

const mDashboardSettingsState = (dss?: Partial<typeof initialState.settings.dashboard>): typeof initialState.settings.dashboard => {
	return {
		loadMostFavoritedTags: dss?.loadMostFavoritedTags ?? initialState.settings.dashboard.loadMostFavoritedTags,
		loadMostSearchedTags: dss?.loadMostSearchedTags ?? initialState.settings.dashboard.loadMostSearchedTags,
		loadMostViewedPosts: dss?.loadMostViewedPosts ?? initialState.settings.dashboard.loadMostViewedPosts,
		loadRatingDistributionChart: dss?.loadRatingDistributionChart ?? initialState.settings.dashboard.loadRatingDistributionChart,
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
			expandedKeys: ss?.favorites?.expandedKeys ?? initialState.settings.favorites.expandedKeys,
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
		addToFavoritesModal: ms?.addToFavoritesModal ?? {
			postIdsToFavorite: ms?.addToFavoritesModal?.postIdsToFavorite ?? initialState.modals.addToFavoritesModal.postIdsToFavorite,
		},
		common: ms?.common ?? {
			activeModal: ms?.common?.activeModal ?? initialState.modals.common.activeModal,
			addToFavorites: ms?.common?.addToFavorites ?? {
				postIdsToFavorite: ms?.common?.addToFavorites.postIdsToFavorite ?? initialState.modals.common.addToFavorites.postIdsToFavorite,
			},
			isVisible: ms?.common?.isVisible ?? initialState.modals.common.isVisible,
		},
	};
};

interface PartialRootState {
	dashboard?: Partial<DashboardState>;
	downloadedSearchForm?: Partial<DownloadedSearchFormState>;
	onlineSearchForm?: Partial<SearchFormState>;
	favorites?: Partial<FavoritesState>;
	loadingStates?: Partial<LoadingStates>;
	tasks?: Partial<TasksState>;
	posts?: Partial<PostsState>;
	settings?: DeepPartial<Settings>;
	system?: Partial<SystemState>;
	savedSearches?: Partial<SavedSearchesState>;
	tags?: Partial<TagsState>;
	modals?: Partial<ReturnType<typeof Modals>>;
}

export const mState = (state?: PartialRootState): RootState => {
	return {
		dashboard: mDashboardState(state?.dashboard),
		downloadedSearchForm: mDownloadedSearchFormState(state?.downloadedSearchForm),
		onlineSearchForm: mOnlineSearchFormState(state?.onlineSearchForm),
		favorites: mFavoritesState(state?.favorites),
		loadingStates: mLoadingStates(state?.loadingStates),
		tasks: mTasksState(state?.tasks),
		posts: mPostsState(state?.posts),
		settings: mSettingsState(state?.settings),
		system: mSystemState(state?.system),
		savedSearches: mSavedSearchesState(state?.savedSearches),
		tags: mTagsState(state?.tags),
		errors: {},
		modals: mModalsState(state?.modals),
	};
};
