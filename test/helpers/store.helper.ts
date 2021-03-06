import { RootState, SearchContext, Settings } from '@store/types';
import { SearchContextsState } from '@store/searchContexts';
import { initialState } from '../../src/store';
import { DashboardState } from '@store/dashboard';
import { FavoritesState } from '@store/favorites';
import { LoadingStates } from '@store/loadingStates';
import { TasksState } from '@store/tasks';
import { SystemState } from '@store/system';
import { SavedSearchesState } from '@store/savedSearches';
import { TagsState } from '@store/tags';
import Modals from '@store/modals';

type DeepPartial<T> = {
	[P in keyof T]?: DeepPartial<T[P]>;
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

const mSearchContextsState = (ds?: { [key: string]: Partial<SearchContext> }): SearchContextsState => {
	if (ds) {
		const newObj: SearchContextsState = {
			checkLaterQueue: { ...initialState.searchContexts.default, mode: 'system' },
			favorites: { ...initialState.searchContexts.default, mode: 'system' },
			mostViewed: { ...initialState.searchContexts.default, mode: 'system' },
		};
		for (const [key, value] of Object.entries(ds)) {
			newObj[key] = {
				...initialState.searchContexts.default,
				...value,
			};
		}
		return newObj;
	}
	return { ...initialState.searchContexts };
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
	searchContexts?: { [key: string]: Partial<SearchContext> };
	favorites?: Partial<FavoritesState>;
	loadingStates?: Partial<LoadingStates>;
	tasks?: Partial<TasksState>;
	settings?: DeepPartial<Settings>;
	system?: Partial<SystemState>;
	savedSearches?: Partial<SavedSearchesState>;
	tags?: Partial<TagsState>;
	modals?: Partial<ReturnType<typeof Modals>>;
};

export const mState = (state?: PartialRootState): RootState => {
	return {
		dashboard: mDashboardState(state?.dashboard),
		searchContexts: mSearchContextsState(state?.searchContexts),
		favorites: mFavoritesState(state?.favorites),
		loadingStates: mLoadingStates(state?.loadingStates),
		tasks: mTasksState(state?.tasks),
		settings: mSettingsState(state?.settings),
		system: mSystemState(state?.system),
		savedSearches: mSavedSearchesState(state?.savedSearches),
		tags: mTagsState(state?.tags),
		modals: mModalsState(state?.modals),
	};
};
