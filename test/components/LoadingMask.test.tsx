import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { RootState, AppDispatch } from '../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../helpers/store.helper';

import LoadingMask from '../../src/components/LoadingMask';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('LoadingMask', () => {
	it('Renders correctly', async () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<LoadingMask visible={true} delay={0} fullscreen />
			</Provider>
		);

		// then
		await waitFor(() => expect(screen.getByRole('img', { name: 'loading' })).not.toBeNull());
	});
	it('Renders nothing when visible is false', async () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<LoadingMask visible={false} delay={0} fullscreen />
			</Provider>
		);

		// then
		await waitFor(() => expect(screen.queryByRole('img', { name: 'loading' })).toBeNull());
	});
	it('Renders message', async () => {
		// given
		const message = 'test message';
		const store = mockStore(
			mState({
				loadingStates: {
					fullscreenLoadingMaskMessage: message,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<LoadingMask visible={true} delay={0} fullscreen />
			</Provider>
		);

		// then
		expect(screen.findByText(message));
	});
	it('Renders progressbar', async () => {
		// given
		const message = 'test messageasdf';
		const progressPercent = 86;
		const store = mockStore(
			mState({
				loadingStates: {
					fullscreenLoadingMaskMessage: message,
					fullscreenLoadingMaskPercentProgress: progressPercent,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<LoadingMask visible={true} delay={0} fullscreen />
			</Provider>
		);

		// then
		expect(screen.findByText(message));
		expect(screen.findByText('86%'));
	});
});
