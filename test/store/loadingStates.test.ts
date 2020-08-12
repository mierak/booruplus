import { doDatabaseMock } from '../helpers/database.mock';
doDatabaseMock();
import reducer, { actions, initialState, LoadingStates } from '../../src/store/loadingStates';
import { thunks } from '../../src/store/';
import { setFullscreenLoadingMaskMessage } from '../../src/store/commonActions';
import { createAction } from '../helpers/test.helper';

describe('store/loadingStates', () => {
	it('Sets fullImageLoading', () => {
		// given
		const action = createAction(actions.setFullImageLoading.type, true);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.isFullImageLoading).toEqual(true);
	});
	it('Sets isScrolling', () => {
		// given
		const action = createAction(actions.setScrolling.type, true);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.isScrolling).toEqual(true);
	});
	it('Sets isRatingDistributionChartLoading to true on fetchRatingCounts pending', () => {
		// given
		const action = createAction(thunks.dashboard.fetchRatingCounts.pending.type, true);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.isRatingDistributionChartLoading).toEqual(true);
	});
	it('Sets isRatingDistributionChartLoading to true on fetchRatingCounts fulfilled', () => {
		// given
		const action = createAction(thunks.dashboard.fetchRatingCounts.fulfilled.type, true);

		// when
		const result = reducer({ ...initialState, isRatingDistributionChartLoading: true }, action);

		// then
		expect(result.isRatingDistributionChartLoading).toEqual(false);
	});
	it('Sets isRatingDistributionChartLoading to false on fetchRatingCounts rejected', () => {
		// given
		const action = createAction(thunks.dashboard.fetchRatingCounts.rejected.type, true);

		// when
		const result = reducer({ ...initialState, isRatingDistributionChartLoading: true }, action);

		// then
		expect(result.isRatingDistributionChartLoading).toEqual(false);
	});
	it('Sets isMostSearchedTagsLoading to true on fetchMostSearchedTags pending', () => {
		// given
		const action = createAction(thunks.dashboard.fetchMostSearchedTags.pending.type, true);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.isMostSearchedTagsLoading).toEqual(true);
	});
	it('Sets isRatingDistributionChartLoading to false on fetchMostSearchedTags fulfilled', () => {
		// given
		const action = createAction(thunks.dashboard.fetchMostSearchedTags.fulfilled.type, true);

		// when
		const result = reducer({ ...initialState, isMostSearchedTagsLoading: true }, action);

		// then
		expect(result.isMostSearchedTagsLoading).toEqual(false);
	});
	it('Sets isRatingDistributionChartLoading to false on fetchMostSearchedTags rejected', () => {
		// given
		const action = createAction(thunks.dashboard.fetchMostSearchedTags.rejected.type, true);

		// when
		const result = reducer({ ...initialState, isMostSearchedTagsLoading: true }, action);

		// then
		expect(result.isMostSearchedTagsLoading).toEqual(false);
	});
	it('Sets isMostSearchedTagsLoading to true on fetchMostFavoritedTags pending', () => {
		// given
		const action = createAction(thunks.dashboard.fetchMostFavoritedTags.pending.type, true);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.isMostFavoritedTagsLoading).toEqual(true);
	});
	it('Sets isRatingDistributionChartLoading to false on fetchMostFavoritedTags fulfilled', () => {
		// given
		const action = createAction(thunks.dashboard.fetchMostFavoritedTags.fulfilled.type, true);

		// when
		const result = reducer({ ...initialState, isMostFavoritedTagsLoading: true }, action);

		// then
		expect(result.isMostFavoritedTagsLoading).toEqual(false);
	});
	it('Sets isRatingDistributionChartLoading to false on fetchMostFavoritedTags rejected', () => {
		// given
		const action = createAction(thunks.dashboard.fetchMostFavoritedTags.rejected.type, true);

		// when
		const result = reducer({ ...initialState, isMostFavoritedTagsLoading: true }, action);

		// then
		expect(result.isMostFavoritedTagsLoading).toEqual(false);
	});
	it('Sets isMostSearchedTagsLoading to true on fetchMostFavoritedTags pending', () => {
		// given
		const action = createAction(thunks.dashboard.fetchMostFavoritedTags.pending.type, true);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.isMostFavoritedTagsLoading).toEqual(true);
	});
	it('Sets isRatingDistributionChartLoading to false on fetchMostFavoritedTags fulfilled', () => {
		// given
		const action = createAction(thunks.dashboard.fetchMostFavoritedTags.fulfilled.type, true);

		// when
		const result = reducer({ ...initialState, isMostFavoritedTagsLoading: true }, action);

		// then
		expect(result.isMostFavoritedTagsLoading).toEqual(false);
	});
	it('Sets isRatingDistributionChartLoading to false on fetchMostFavoritedTags rejected', () => {
		// given
		const action = createAction(thunks.dashboard.fetchMostFavoritedTags.rejected.type, true);

		// when
		const result = reducer({ ...initialState, isMostFavoritedTagsLoading: true }, action);

		// then
		expect(result.isMostFavoritedTagsLoading).toEqual(false);
	});
	it('Sets loading message and loadingMaskVisible on importDatabase pending', () => {
		// given
		const action = createAction(thunks.settings.importDatabase.pending.type, true);

		// when
		const result = reducer({ ...initialState, fullscreenLoadingMaskMessage: '', isFullscreenLoadingMaskVisible: false }, action);

		// then
		expect(result.fullscreenLoadingMaskMessage).toEqual('Importing data...');
		expect(result.isFullscreenLoadingMaskVisible).toEqual(true);
	});
	it('Sets loading message and loadingMaskVisible on importDatabase fulfilled', () => {
		// given
		const action = createAction(thunks.settings.importDatabase.fulfilled.type, true);

		// when
		const result = reducer({ ...initialState, fullscreenLoadingMaskMessage: 'asdf', isFullscreenLoadingMaskVisible: true }, action);

		// then
		expect(result.fullscreenLoadingMaskMessage).toEqual(undefined);
		expect(result.isFullscreenLoadingMaskVisible).toEqual(false);
	});
	it('Sets loading message and loadingMaskVisible on importDatabase rejected', () => {
		// given
		const action = createAction(thunks.settings.importDatabase.rejected.type, true);

		// when
		const result = reducer({ ...initialState, fullscreenLoadingMaskMessage: 'asdf', isFullscreenLoadingMaskVisible: true }, action);

		// then
		expect(result.fullscreenLoadingMaskMessage).toEqual(undefined);
		expect(result.isFullscreenLoadingMaskVisible).toEqual(false);
	});
	it('Sets loading message and loadingMaskVisible on exportDatabase pending', () => {
		// given
		const action = createAction(thunks.settings.exportDatabase.pending.type, true);

		// when
		const result = reducer({ ...initialState, fullscreenLoadingMaskMessage: '', isFullscreenLoadingMaskVisible: false }, action);

		// then
		expect(result.fullscreenLoadingMaskMessage).toEqual('Exporting data...');
		expect(result.isFullscreenLoadingMaskVisible).toEqual(true);
	});
	it('Sets loading message and loadingMaskVisible on exportDatabase fulfilled', () => {
		// given
		const action = createAction(thunks.settings.exportDatabase.fulfilled.type, true);

		// when
		const result = reducer({ ...initialState, fullscreenLoadingMaskMessage: 'asdf', isFullscreenLoadingMaskVisible: true }, action);

		// then
		expect(result.fullscreenLoadingMaskMessage).toEqual(undefined);
		expect(result.isFullscreenLoadingMaskVisible).toEqual(false);
	});
	it('Sets loading message and loadingMaskVisible on exportDatabase rejected', () => {
		// given
		const action = createAction(thunks.settings.exportDatabase.rejected.type, true);

		// when
		const result = reducer({ ...initialState, fullscreenLoadingMaskMessage: 'asdf', isFullscreenLoadingMaskVisible: true }, action);

		// then
		expect(result.fullscreenLoadingMaskMessage).toEqual(undefined);
		expect(result.isFullscreenLoadingMaskVisible).toEqual(false);
	});
	it('Sets loading mask message on setFullscreenLoadingMaskMessage', () => {
		// given
		const message = 'testmessage';
		const action = createAction(setFullscreenLoadingMaskMessage.type, message);

		// when
		const result = reducer({ ...initialState, fullscreenLoadingMaskMessage: '' }, action);

		// then
		expect(result.fullscreenLoadingMaskMessage).toEqual(message);
	});
	it('Correctly changes state when online fetchPosts is initiated', () => {
		// given
		const action = createAction(thunks.onlineSearchForm.fetchPosts.pending.type);
		const state: LoadingStates = {
			...initialState,
			isSearchDisabled: false,
			isFetchingPosts: false,
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.isSearchDisabled).toBe(true);
		expect(result.isFetchingPosts).toBe(true);
	});
	it('Correctly changes state when online fetchPosts is rejected', () => {
		// given
		const action = createAction(thunks.onlineSearchForm.fetchPosts.rejected.type);
		const state: LoadingStates = {
			...initialState,
			isSearchDisabled: true,
			isFetchingPosts: true,
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.isSearchDisabled).toBe(false);
		expect(result.isFetchingPosts).toBe(false);
	});
	it('Correctly changes state when online fetchMorePosts is initiated', () => {
		// given
		const action = createAction(thunks.onlineSearchForm.fetchMorePosts.pending.type);
		const state: LoadingStates = {
			...initialState,
			isSearchDisabled: false,
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.isSearchDisabled).toBe(true);
	});
	it('Correctly changes state when online fetchMorePosts is rejected', () => {
		// given
		const action = createAction(thunks.onlineSearchForm.fetchMorePosts.rejected.type);
		const state: LoadingStates = {
			...initialState,
			isSearchDisabled: true,
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.isSearchDisabled).toBe(false);
	});
	it('Correctly changes state when offline fetchPosts is initiated', () => {
		// given
		const action = createAction(thunks.downloadedSearchForm.fetchPosts.pending.type);
		const state: LoadingStates = {
			...initialState,
			isSearchDisabled: false,
			isFetchingPosts: false,
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.isSearchDisabled).toBe(true);
		expect(result.isFetchingPosts).toBe(true);
	});
	it('Correctly changes state when offline fetchMorePosts is initiated', () => {
		// given
		const action = createAction(thunks.downloadedSearchForm.fetchMorePosts.pending.type);

		// when
		const result = reducer({ ...initialState, isSearchDisabled: true }, action);

		// then
		expect(result.isSearchDisabled).toBe(true);
	});
	it('Correctly changes state when offline fetchPosts is fulfilled', () => {
		// given
		const action = createAction(thunks.downloadedSearchForm.fetchPosts.fulfilled.type);

		// when
		const result = reducer({ ...initialState, isSearchDisabled: true, isFetchingPosts: true }, action);

		// then
		expect(result.isSearchDisabled).toBe(false);
		expect(result.isFetchingPosts).toBe(false);
	});
	it('Correctly changes state when offline fetchMorePosts is fulfilled', () => {
		// given
		const action = createAction(thunks.downloadedSearchForm.fetchMorePosts.fulfilled.type);

		// when
		const result = reducer({ ...initialState, isSearchDisabled: true, isFetchingPosts: true }, action);

		// then
		expect(result.isSearchDisabled).toBe(false);
		expect(result.isFetchingPosts).toBe(false);
	});
	it('Correctly changes when checkPostsAgainstDb is fulfilled', () => {
		// given
		const action = createAction(thunks.onlineSearchForm.checkPostsAgainstDb.fulfilled.type);
		const state: LoadingStates = {
			...initialState,
			isSearchDisabled: true,
			isFetchingPosts: true,
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.isSearchDisabled).toBe(false);
		expect(result.isFetchingPosts).toBe(false);
	});
	it('Correctly changes when checkPostsAgainstDb is rejected', () => {
		// given
		const action = createAction(thunks.onlineSearchForm.checkPostsAgainstDb.rejected.type);
		const state: LoadingStates = {
			...initialState,
			isSearchDisabled: true,
			isFetchingPosts: true,
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.isSearchDisabled).toBe(false);
		expect(result.isFetchingPosts).toBe(false);
	});
	it('Correctly changes state when posts.fetchPostsByIds is initiated', () => {
		// given
		const action = createAction(thunks.posts.fetchPostsByIds.pending.type);
		const state: LoadingStates = {
			...initialState,
			isSearchDisabled: false,
			isFetchingPosts: false,
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.isSearchDisabled).toBe(true);
		expect(result.isFetchingPosts).toBe(true);
	});
	it('Correctly changes state when posts.fetchPostsByIds is fulfilled', () => {
		// given
		const action = createAction(thunks.posts.fetchPostsByIds.fulfilled.type);
		const state: LoadingStates = {
			...initialState,
			isSearchDisabled: true,
			isFetchingPosts: true,
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.isSearchDisabled).toBe(false);
		expect(result.isFetchingPosts).toBe(false);
	});
});
