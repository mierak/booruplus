import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { actions } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import '@testing-library/jest-dom';
import { mState } from '../../helpers/store.helper';

import Dashboard from '../../../src/components/settings/Dashboard';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('settings/Dashboard', () => {
	it('Renders correctly', () => {
		// given
		const store = mockStore(
			mState({
				settings: {
					dashboard: {
						mostViewedCount: 100,
						loadMostFavoritedTags: false,
						loadMostSearchedTags: false,
						loadMostViewedPosts: false,
						loadRatingDistributionChart: false,
						loadTagStatistics: false,
						saveTagsNotFoundInDb: false,
					},
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
		expect(screen.getByText('Load on app start')).not.toBeNull();
		expect(screen.getByRole('checkbox', { name: 'Most Searched Tags' })).not.toBeNull();
		expect(screen.getByRole('checkbox', { name: 'Most Favorited Tags' })).not.toBeNull();
		expect(screen.getByRole('checkbox', { name: 'Most Viewed Posts' })).not.toBeNull();
		expect(screen.getByRole('checkbox', { name: 'Tag Statistics' })).not.toBeNull();
		expect(screen.getByRole('checkbox', { name: 'Rating Distribution Chart' })).not.toBeNull();
		expect(screen.getByRole('checkbox', { name: 'Download Tags Not Found in DB' })).not.toBeNull();
		expect(screen.getByDisplayValue('100')).not.toBeNull();
	});
	it('Dispatches correct action on checkbox change', () => {
		// given
		const store = mockStore(
			mState({
				settings: {
					dashboard: {
						mostViewedCount: 100,
						loadMostFavoritedTags: false,
						loadMostSearchedTags: false,
						loadMostViewedPosts: false,
						loadRatingDistributionChart: false,
						loadTagStatistics: false,
						saveTagsNotFoundInDb: false,
					},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<Dashboard />
			</Provider>
		);
		fireEvent.click(screen.getByRole('checkbox', { name: 'Most Searched Tags' }));
		fireEvent.click(screen.getByRole('checkbox', { name: 'Most Favorited Tags' }));
		fireEvent.click(screen.getByRole('checkbox', { name: 'Most Viewed Posts' }));
		fireEvent.click(screen.getByRole('checkbox', { name: 'Tag Statistics' }));
		fireEvent.click(screen.getByRole('checkbox', { name: 'Rating Distribution Chart' }));
		fireEvent.click(screen.getByRole('checkbox', { name: 'Download Tags Not Found in DB' }));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: actions.settings.setLoadMostSearchedTags.type, payload: true });
		expect(dispatchedActions).toContainMatchingAction({ type: actions.settings.setLoadMostFavoritedTags.type, payload: true });
		expect(dispatchedActions).toContainMatchingAction({ type: actions.settings.setLoadMostViewedPosts.type, payload: true });
		expect(dispatchedActions).toContainMatchingAction({ type: actions.settings.setLoadTagStatistics.type, payload: true });
		expect(dispatchedActions).toContainMatchingAction({ type: actions.settings.setLoadRatingDistribution.type, payload: true });
		expect(dispatchedActions).toContainMatchingAction({ type: actions.settings.setSaveTagsNotFoundInDb.type, payload: true });
	});
	it('Dispatches setMostViewedCount()', () => {
		// given
		const store = mockStore(
			mState({
				settings: {
					dashboard: {
						mostViewedCount: 50,
					},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<Dashboard />
			</Provider>
		);
		fireEvent.mouseDown(screen.getByRole('button', { name: 'Increase Value' }));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.settings.setMostViewedCount.type,
			payload: store.getState().settings.dashboard.mostViewedCount + 1,
		});
	});
});
