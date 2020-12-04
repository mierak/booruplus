import { doDatabaseMock } from '../helpers/database.mock';
doDatabaseMock();
import reducer, { actions } from '../../src/store/dashboard';
import { thunks } from '../../src/store/';
import { RatingCounts, TagHistory } from '../../src/store/types';
import { createAction, mTag } from '../helpers/test.helper';

describe('store/dashboard', () => {
	it('Sets total downloaded posts', () => {
		//given
		const action = createAction(actions.setTotalDownloadedPosts.type, 123);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.totalDownloadedPosts).toEqual(123);
	});
	it('Sets total blacklisted posts', () => {
		//given
		const action = createAction(actions.setTotalBlacklistedPosts.type, 123);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.totalBlacklistedPosts).toEqual(123);
	});
	it('Sets total favorite posts', () => {
		//given
		const action = createAction(actions.setTotalFavoritePosts.type, 123);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.totalFavoritesPosts).toEqual(123);
	});
	it('Sets total tags', () => {
		//given
		const action = createAction(actions.setTotalTags.type, 123);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.totalTags).toEqual(123);
	});
	it('Sets rating counts', () => {
		//given
		const ratingCounts: RatingCounts = {
			safe: 1,
			questionable: 2,
			explicit: 3,
		};
		const action = createAction(actions.setRatingCounts.type, ratingCounts);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.ratingCounts).toEqual(ratingCounts);
	});
	it('Sets most searched tags', () => {
		//given
		const mostSearchedTags: TagHistory[] = [
			{
				tag: mTag({ tag: 'tag1' }),
				count: 1,
				date: 'date1',
			},
			{
				tag: mTag({ tag: 'tag2' }),
				count: 2,
				date: 'date2',
			},
		];
		const action = createAction(actions.setMostsearchedTags.type, mostSearchedTags);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.mostSearchedTags).toStrictEqual(mostSearchedTags);
	});
	it('Sets most favorited tags', () => {
		//given
		const mosFavoritedTags = [
			{
				tag: mTag({ id: 1 }),
				count: 1,
			},
			{
				tag: mTag({ id: 2 }),
				count: 2,
			},
		];
		const action = createAction(actions.setMostFavoritedTags.type, mosFavoritedTags);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.mostFavoritedTags).toStrictEqual(mosFavoritedTags);
	});
	it('Sets total downloaded posts when fetchDownloadedPostCount() is fullfiled', () => {
		//given
		const action = createAction(thunks.dashboard.fetchDownloadedPostCount.fulfilled.type, 123);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.totalDownloadedPosts).toStrictEqual(123);
	});
	it('Sets total blacklisted posts when fetchBlacklistedPostCount() is fullfiled', () => {
		//given
		const action = createAction(thunks.dashboard.fetchBlacklistedPostCount.fulfilled.type, 123);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.totalBlacklistedPosts).toStrictEqual(123);
	});
	it('Sets total favorite posts when fetchFavoritePostCount() is fullfiled', () => {
		//given
		const action = createAction(thunks.dashboard.fetchFavoritePostCount.fulfilled.type, 123);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.totalFavoritesPosts).toStrictEqual(123);
	});
	it('Sets total tags when fetchTagCount() is fullfiled', () => {
		//given
		const action = createAction(thunks.dashboard.fetchTagCount.fulfilled.type, 123);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.totalTags).toStrictEqual(123);
	});
	it('Sets rating counts fetchRatingCounts() is fullfiled', () => {
		//given
		const ratingCounts: RatingCounts = {
			safe: 1,
			questionable: 2,
			explicit: 3,
		};
		const action = createAction(thunks.dashboard.fetchRatingCounts.fulfilled.type, ratingCounts);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.ratingCounts).toStrictEqual(ratingCounts);
	});
	it('Sets most searched tags to empty array when fetchMostSearchedTags() is pending', () => {
		//given
		const action = createAction(thunks.dashboard.fetchMostSearchedTags.pending.type);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.mostSearchedTags).toStrictEqual([]);
	});
	it('Sets most searched tags when fetchMostSearchedTags() is fulfiled', () => {
		//given
		const mostSearchedTags: TagHistory[] = [
			{
				tag: mTag({ tag: 'tag1' }),
				count: 1,
				date: 'date1',
			},
			{
				tag: mTag({ tag: 'tag2' }),
				count: 2,
				date: 'date2',
			},
		];
		const action = createAction(thunks.dashboard.fetchMostSearchedTags.fulfilled.type, mostSearchedTags);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.mostSearchedTags).toStrictEqual(mostSearchedTags);
	});
	it('Sets most favorited tags to empty array when fetchMostFavoritedTags() is pending', () => {
		//given
		const action = createAction(thunks.dashboard.fetchMostFavoritedTags.pending.type);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.mostFavoritedTags).toStrictEqual([]);
	});
	it('Sets most favorited tags when fetchMostFavoritedTags() is fulfiled', () => {
		//given
		const mosFavoritedTags = [
			{
				tag: mTag({ id: 1 }),
				count: 1,
			},
			{
				tag: mTag({ id: 2 }),
				count: 2,
			},
		];
		const action = createAction(thunks.dashboard.fetchMostFavoritedTags.fulfilled.type, mosFavoritedTags);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.mostFavoritedTags).toStrictEqual(mosFavoritedTags);
	});
});
