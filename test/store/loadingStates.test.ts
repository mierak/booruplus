import { doDatabaseMock } from '../helpers/database.mock';
doDatabaseMock();
import reducer, { actions, initialState } from '../../src/store/loadingStates';
import { thunks } from '../../src/store/';
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
});
