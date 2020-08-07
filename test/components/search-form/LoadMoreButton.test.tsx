import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { thunks } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../helpers/store.helper';

import LoadMoreButton from '../../../src/components/search-form/LoadMoreButton';
import '@testing-library/jest-dom';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('search-form/LoadMoreButton', () => {
	it('Renders correctly', () => {
		// given
		const store = mockStore(
			mState({
				system: {
					searchMode: 'online',
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<LoadMoreButton />
			</Provider>
		);

		// then
		expect(screen.getByRole('button', { name: 'Load More' })).not.toBeNull();
	});
	it('Disables correctly when isSearchDisabled is true', () => {
		// given
		const store = mockStore(
			mState({
				system: {
					searchMode: 'online',
				},
				loadingStates: {
					isSearchDisabled: true,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<LoadMoreButton />
			</Provider>
		);

		// then
		expect(screen.getByRole('button', { name: 'Load More' })).toBeDisabled();
	});
	it('Dispatches fetchMorePosts() for online mode', () => {
		// given
		const store = mockStore(
			mState({
				system: {
					searchMode: 'online',
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<LoadMoreButton />
			</Provider>
		);
		fireEvent.click(screen.getByRole('button', { name: 'Load More' }));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: thunks.onlineSearchForm.fetchMorePosts.pending.type });
	});
	it('Dispatches fetchMorePosts() for offline mode', () => {
		// given
		const store = mockStore(
			mState({
				system: {
					searchMode: 'offline',
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<LoadMoreButton />
			</Provider>
		);
		fireEvent.click(screen.getByRole('button', { name: 'Load More' }));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: thunks.downloadedSearchForm.fetchMorePosts.pending.type });
	});
	it('Dispatches fetchMorePosts() for saved-search-online mode', () => {
		// given
		const store = mockStore(
			mState({
				system: {
					searchMode: 'saved-search-online',
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<LoadMoreButton />
			</Provider>
		);
		fireEvent.click(screen.getByRole('button', { name: 'Load More' }));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: thunks.onlineSearchForm.fetchMorePosts.pending.type });
	});
	it('Dispatches fetchMorePosts() for saved-search-offline mode', () => {
		// given
		const store = mockStore(
			mState({
				system: {
					searchMode: 'saved-search-offline',
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<LoadMoreButton />
			</Provider>
		);
		fireEvent.click(screen.getByRole('button', { name: 'Load More' }));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: thunks.downloadedSearchForm.fetchMorePosts.pending.type });
	});
	it('Does not dispatch anything for other modes', () => {
		// given
		const store = mockStore(
			mState({
				system: {
					searchMode: 'most-viewed',
				},
			})
		);
		const onlineSpy = jest.spyOn(thunks.onlineSearchForm, 'fetchMorePosts').mockImplementation();
		const offlineSpy = jest.spyOn(thunks.downloadedSearchForm, 'fetchMorePosts').mockImplementation();

		// when
		render(
			<Provider store={store}>
				<LoadMoreButton />
			</Provider>
		);
		fireEvent.click(screen.getByRole('button', { name: 'Load More' }));

		// then
		expect(onlineSpy).toBeCalledTimes(0);
		expect(offlineSpy).toBeCalledTimes(0);
		onlineSpy.mockReset();
		offlineSpy.mockReset();
	});
});
