import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { actions } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import '@testing-library/jest-dom';
import { mState } from '../../helpers/store.helper';

import Checkboxes from '../../../src/components/search-form/Checkboxes';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('search-from/Checkboxes', () => {
	it('Renders correctly', () => {
		// given
		const context = 'ctx';
		const store = mockStore(
			mState({
				onlineSearchForm: {
					[context]: {
						showBlacklisted: true,
						showFavorites: true,
						showGifs: true,
						showImages: true,
						showNonBlacklisted: true,
						showVideos: true,
					},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<Checkboxes context={context} />
			</Provider>
		);

		// then
		expect(screen.getByRole('checkbox', { name: 'Non-Blacklisted' })).not.toBeNull();
		expect(screen.getByRole('checkbox', { name: 'Blacklisted' })).not.toBeNull();
		expect(screen.getByRole('checkbox', { name: 'Favorites' })).not.toBeNull();
		expect(screen.getByRole('checkbox', { name: 'Images' })).not.toBeNull();
		expect(screen.getByRole('checkbox', { name: 'Gifs' })).not.toBeNull();
		expect(screen.getByRole('checkbox', { name: 'Videos' })).not.toBeNull();
	});
	it('Dispatches correct action', () => {
		// given
		const context = 'ctx';
		const store = mockStore(
			mState({
				onlineSearchForm: {
					[context]: {
						showBlacklisted: true,
						showFavorites: true,
						showGifs: true,
						showImages: true,
						showNonBlacklisted: true,
						showVideos: true,
					},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<Checkboxes context={context} />
			</Provider>
		);
		const nonBlacklisted = screen.getByRole('checkbox', { name: 'Non-Blacklisted' });
		const blacklisted = screen.getByRole('checkbox', { name: 'Blacklisted' });
		const favorites = screen.getByRole('checkbox', { name: 'Favorites' });
		const images = screen.getByRole('checkbox', { name: 'Images' });
		const gifs = screen.getByRole('checkbox', { name: 'Gifs' });
		const videos = screen.getByRole('checkbox', { name: 'Videos' });
		fireEvent.click(nonBlacklisted);
		fireEvent.click(blacklisted);
		fireEvent.click(favorites);
		fireEvent.click(images);
		fireEvent.click(gifs);
		fireEvent.click(videos);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.onlineSearchForm.updateContext.type,
			payload: { context, data: { showNonBlacklisted: false } },
		});
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.onlineSearchForm.updateContext.type,
			payload: { context, data: { showBlacklisted: false } },
		});
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.onlineSearchForm.updateContext.type,
			payload: { context, data: { showFavorites: false } },
		});
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.onlineSearchForm.updateContext.type,
			payload: { context, data: { showImages: false } },
		});
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.onlineSearchForm.updateContext.type,
			payload: { context, data: { showGifs: false } },
		});
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.onlineSearchForm.updateContext.type,
			payload: { context, data: { showVideos: false } },
		});
	});
});
