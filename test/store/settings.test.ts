import { doDatabaseMock } from '../helpers/database.mock';
doDatabaseMock();
import reducer, { actions, initialState } from '../../src/store/settings';
import { thunks } from '../../src/store/';
import { Settings } from '../../src/store/types';
import { createAction, mSettings } from '../helpers/test.helper';

describe('store/settings', () => {
	it('Sets API key', () => {
		// given
		const key = 'api_key';
		const action = createAction(actions.setApiKey.type, key);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.apiKey).toStrictEqual(key);
	});
	it('Sets mostViewedCount', () => {
		// given
		const count = 123;
		const action = createAction(actions.setMostViewedCount.type, count);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.dashboard.mostViewedCount).toStrictEqual(count);
	});
	it('Sets loadMostSearchedTags', () => {
		// given
		const action = createAction(actions.setLoadMostSearchedTags.type, false);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.dashboard.loadMostSearchedTags).toStrictEqual(false);
	});
	it('Sets loadMostFavoritedTags', () => {
		// given
		const action = createAction(actions.setLoadMostFavoritedTags.type, false);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.dashboard.loadMostFavoritedTags).toStrictEqual(false);
	});
	it('Sets loadMostViewedPosts', () => {
		// given
		const action = createAction(actions.setLoadMostViewedPosts.type, false);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.dashboard.loadMostViewedPosts).toStrictEqual(false);
	});
	it('Sets loadTagStatistics', () => {
		// given
		const action = createAction(actions.setLoadTagStatistics.type, false);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.dashboard.loadTagStatistics).toStrictEqual(false);
	});
	it('Sets loadRatingDistributionChart', () => {
		// given
		const action = createAction(actions.setLoadRatingDistribution.type, false);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.dashboard.loadRatingDistributionChart).toStrictEqual(false);
	});
	it('Sets saveTagsNotFoundInDb', () => {
		// given
		const action = createAction(actions.setSaveTagsNotFoundInDb.type, false);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.dashboard.saveTagsNotFoundInDb).toStrictEqual(false);
	});
	it('Updates imagesPath when updateImagePath is fulfilled', () => {
		// given
		const path = 'img_path';
		const action = createAction(thunks.settings.updateImagePath.fulfilled.type, path);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.imagesFolderPath).toStrictEqual(path);
	});
	it('Updates theme when updateTheme is fulfilled', () => {
		// given
		const theme = 'light';
		const action = createAction(thunks.settings.updateTheme.fulfilled.type, theme);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.theme).toStrictEqual(theme);
	});
	it('Updates whole state when loadSettings is fulfilled and settings exist', () => {
		// given
		const settings: Partial<Settings> = {
			...mSettings({
				apiKey: 'asdasfasf',
				gelbooruUsername: 'asdasd',
				imagesFolderPath: 'aasdasdasdff',
				theme: 'light',
			}),
			dashboard: undefined,
		};
		const action = createAction(thunks.settings.loadSettings.fulfilled.type, settings);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result).toStrictEqual({ ...settings, dashboard: initialState.dashboard });
	});
});
