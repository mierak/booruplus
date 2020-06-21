import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { thunks } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../helpers/store.helper';

import Dashboard from '../../../src/pages/Dashboard';
import '@testing-library/jest-dom';
import { mTag } from '../../helpers/test.helper';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('pages/Dashboard', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});
	it('Renders correctly', () => {
		// given
		const store = mockStore(
			mState({
				dashboard: {
					totalDownloadedPosts: 123,
					totalBlacklistedPosts: 456,
					totalFavoritesPosts: 789,
					totalTags: 999,
					mostSearchedTags: [
						{ tag: mTag({ tag: 'downloaded1', id: 1 }), count: 1, date: '' },
						{ tag: mTag({ tag: 'downloaded2', id: 2 }), count: 2, date: '' },
					],
					mostFavoritedTags: [
						{ tag: mTag({ tag: 'favorited1', id: 3 }), count: 1 },
						{ tag: mTag({ tag: 'favorited2', id: 4 }), count: 2 },
					],
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<Dashboard />
			</Provider>
		);

		// then
		expect(screen.getByText('Downloaded Posts')).not.toBeNull();
		expect(screen.getByText('Blacklisted Posts')).not.toBeNull();
		expect(screen.getByText('Favorite Posts')).not.toBeNull();
		expect(screen.getByText('Tags in Database')).not.toBeNull();
		expect(screen.getByText('Most Searched Tags')).not.toBeNull();
		expect(screen.getByText('Most Favorited Tags')).not.toBeNull();
		expect(screen.getByText('Rating Distribution of Downloaded Posts')).not.toBeNull();
		expect(screen.getByText('downloaded1')).not.toBeNull();
		expect(screen.getByText('downloaded2')).not.toBeNull();
		expect(screen.getByText('favorited1')).not.toBeNull();
		expect(screen.getByText('favorited2')).not.toBeNull();
	});
	it('Fetches statistics when loadTagStatistics is true', () => {
		// given
		const store = mockStore(
			mState({
				settings: {
					dashboard: {
						loadTagStatistics: true,
					},
				},
			})
		);
		const downloadedPostCountSpy = jest.spyOn(thunks.dashboard, 'fetchDownloadedPostCount');
		const blacklistedPostCountSpy = jest.spyOn(thunks.dashboard, 'fetchBlacklistedPostCount');
		const favoritePostCountSpy = jest.spyOn(thunks.dashboard, 'fetchFavoritePostCount');
		const tagCountSpy = jest.spyOn(thunks.dashboard, 'fetchTagCount');

		// when
		render(
			<Provider store={store}>
				<Dashboard />
			</Provider>
		);

		// then
		expect(downloadedPostCountSpy).toBeCalledTimes(1);
		expect(blacklistedPostCountSpy).toBeCalledTimes(1);
		expect(favoritePostCountSpy).toBeCalledTimes(1);
		expect(tagCountSpy).toBeCalledTimes(1);
	});
	it('Does not fetch statistics when loadTagStatistics is false', () => {
		// given
		const store = mockStore(
			mState({
				settings: {
					dashboard: {
						loadTagStatistics: false,
					},
				},
			})
		);
		const downloadedPostCountSpy = jest.spyOn(thunks.dashboard, 'fetchDownloadedPostCount');
		const blacklistedPostCountSpy = jest.spyOn(thunks.dashboard, 'fetchBlacklistedPostCount');
		const favoritePostCountSpy = jest.spyOn(thunks.dashboard, 'fetchFavoritePostCount');
		const tagCountSpy = jest.spyOn(thunks.dashboard, 'fetchTagCount');

		// when
		render(
			<Provider store={store}>
				<Dashboard />
			</Provider>
		);

		// then
		expect(downloadedPostCountSpy).toBeCalledTimes(0);
		expect(blacklistedPostCountSpy).toBeCalledTimes(0);
		expect(favoritePostCountSpy).toBeCalledTimes(0);
		expect(tagCountSpy).toBeCalledTimes(0);
	});
});
