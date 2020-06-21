import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { thunks } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../helpers/store.helper';
import RatingDistributionsChart from '../../../src/components/dashboard/RatingDistributionsChart';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('RatingDistributionsChart', () => {
	it('Renders correctly', async () => {
		// given
		const store = mockStore(
			mState({
				dashboard: {
					ratingCounts: {
						safe: 128,
						questionable: 256,
						explicit: 512,
					},
				},
				loadingStates: {
					isRatingDistributionChartLoading: false,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<RatingDistributionsChart />
			</Provider>
		);
		await waitFor(() => screen.getByText('safe'));

		// then
		expect(screen.getByText('safe')).not.toBeNull();
		expect(screen.getByText('explicit')).not.toBeNull();
		expect(screen.getByText('questionable')).not.toBeNull();
		expect(screen.getByText('896')).not.toBeNull();
	});
	it('Loads data when mounted and shouldLoad is true', () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<RatingDistributionsChart />
			</Provider>
		);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions[0]).toMatchObject({ type: thunks.dashboard.fetchRatingCounts.pending.type });
	});
	it('Does not load data when mounted and shouldLoad is false', () => {
		// given
		const store = mockStore(
			mState({
				settings: {
					dashboard: {
						loadRatingDistributionChart: false,
					},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<RatingDistributionsChart />
			</Provider>
		);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toHaveLength(0);
	});
	it('Calls reload function when reload button is pressed', () => {
		// given
		const mStore = mockStore(mState());

		// when
		render(
			<Provider store={mStore}>
				<RatingDistributionsChart />
			</Provider>
		);
		fireEvent.click(
			screen.getByRole('img', {
				name: 'reload',
			})
		);

		// then
		const dispatchedActions = mStore.getActions();
		expect(dispatchedActions[0]).toMatchObject({ type: thunks.dashboard.fetchRatingCounts.pending.type });
	});
	it('Renders loading state correctly', () => {
		// given
		const mStore = mockStore(
			mState({
				loadingStates: {
					isRatingDistributionChartLoading: true,
				},
			})
		);

		// when
		render(
			<Provider store={mStore}>
				<RatingDistributionsChart />
			</Provider>
		);

		// then
		expect(screen.getByText('No Data')).not.toBeNull();
	});
});
