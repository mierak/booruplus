import { doDatabaseMock } from '../helpers/database.mock';
doDatabaseMock();
import reducer, { actions, initialState } from '../../src/store/settings';
import { thunks } from '../../src/store/';
import { Settings } from '../../src/store/types';
import { createAction, mSettings } from '../helpers/test.helper';
jest.mock('../../src/types/components', () => {
	return {
		openNotificationWithIcon: jest.fn(),
	};
});
import { openNotificationWithIcon } from '../../src/types/components';

describe('store/settings', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});
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
	it('Sets setFavoritesSiderWidth', () => {
		// given
		const action = createAction(actions.setFavoritesSiderWidth.type, 333);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.favorites.siderWidth).toBe(333);
	});
	it('Sets setFavoritesExpandedKeys', () => {
		// given
		const keys = ['1', '2', '123'];
		const action = createAction(actions.setFavoritesExpandedKeys.type, keys);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.favorites.expandedKeys).toEqual(keys);
	});
	it('Toggles downloadMissingImages', () => {
		// given
		const action = createAction(actions.toggleDownloadMissingImages.type);

		// when
		const result = reducer({ ...initialState, downloadMissingImages: false }, action);

		// then
		expect(result.downloadMissingImages).toEqual(true);
	});
	it('Toggles imageHover', () => {
		// given
		const action = createAction(actions.toggleImageHover.type);

		// when
		const result = reducer({ ...initialState, imageHover: false }, action);

		// then
		expect(result.imageHover).toEqual(true);
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
			favorites: undefined,
		};
		const action = createAction(thunks.settings.loadSettings.fulfilled.type, settings);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result).toStrictEqual({ ...settings, dashboard: initialState.dashboard, favorites: initialState.favorites });
	});
	it('Opens notification when importDatabase is fulfilled', () => {
		// given
		const action = createAction(thunks.settings.importDatabase.fulfilled.type, true);

		// when
		reducer(undefined, action);

		// then
		expect(openNotificationWithIcon).toBeCalledWith('success', 'Import finished', 'Database was succesfully restored!');
	});
	it('Does not open notification when importDatabase dialog is closed without selecing a file', () => {
		// given
		const action = createAction(thunks.settings.importDatabase.fulfilled.type, false);

		// when
		reducer(undefined, action);

		// then
		expect(openNotificationWithIcon).toBeCalledTimes(0);
	});
	it('Opens notification when importDatabase is rejected', () => {
		// given
		const action = createAction(thunks.settings.importDatabase.rejected.type, true);

		// when
		reducer(undefined, action);

		// then
		expect(openNotificationWithIcon).toBeCalledWith(
			'error',
			'Could not import database',
			'Error occured while trying to restore backup.',
			5
		);
	});
	it('Opens notification when exportDatabase is fulfilled', () => {
		// given
		const action = createAction(thunks.settings.exportDatabase.fulfilled.type, true);

		// when
		reducer(undefined, action);

		// then
		expect(openNotificationWithIcon).toBeCalledWith('success', 'Export finished', 'Database was succesfully exported!');
	});
	it('Does not open notification when exportDatabase dialog is closed without selecing a file', () => {
		// given
		const action = createAction(thunks.settings.exportDatabase.fulfilled.type, false);

		// when
		reducer(undefined, action);

		// then
		expect(openNotificationWithIcon).toBeCalledTimes(0);
	});
	it('Opens notification when exportDatabase is rejected', () => {
		// given
		const action = createAction(thunks.settings.exportDatabase.rejected.type, true);

		// when
		reducer(undefined, action);

		// then
		expect(openNotificationWithIcon).toBeCalledWith(
			'error',
			'Could not export database',
			'Error occured while trying to create a database backup.',
			5
		);
	});
});
