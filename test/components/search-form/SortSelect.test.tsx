import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { actions } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../helpers/store.helper';

import SortSelect from '../../../src/components/search-form/SortSelect';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('search-form/SortSelect', () => {
	it('Renders correctly with online mode', () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<SortSelect mode="online" />
			</Provider>
		);

		// then
		expect(screen.getByText('Date Uploaded')).not.toBeNull();
	});
	it('Renders correctly with offline mode', () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<SortSelect mode="offline" />
			</Provider>
		);

		// then
		expect(screen.getByText('Date Downloaded')).not.toBeNull();
	});
	it('Renders all options for online mode when select box is opened', () => {
		// given
		const store = mockStore(mState());

		// when
		const { unmount } = render(
			<Provider store={store}>
				<SortSelect mode="online" open />
			</Provider>
		);

		// then
		const anyOption = screen.getAllByText('Date Uploaded');
		expect(anyOption[1]).not.toBeNull();
		expect(anyOption).toHaveLength(2);
		expect(screen.getByText('Date Updated')).not.toBeNull();
		expect(screen.getByText('Rating')).not.toBeNull();
		unmount();
	});
	it('Renders all options for offline mode when select box is opened', () => {
		// given
		const store = mockStore(mState());

		// when
		const { unmount } = render(
			<Provider store={store}>
				<SortSelect mode="offline" open />
			</Provider>
		);

		// then
		const anyOption = screen.getAllByText('Date Downloaded');
		expect(anyOption[1]).not.toBeNull();
		expect(anyOption).toHaveLength(2);
		expect(screen.getByText('Date Updated')).not.toBeNull();
		expect(screen.getByText('Rating')).not.toBeNull();
		unmount();
	});
	it('Dispatches setSort() for onlineSearchForm', () => {
		// given
		const store = mockStore(mState());

		// when
		const { unmount } = render(
			<Provider store={store}>
				<SortSelect mode="online" open />
			</Provider>
		);
		fireEvent.click(screen.getByText('Rating'));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: actions.onlineSearchForm.setSort.type, payload: 'rating' });
		unmount();
	});
	it('Dispatches setSort() for downloadedSearchForm', () => {
		// given
		const store = mockStore(mState());

		// when
		const { unmount } = render(
			<Provider store={store}>
				<SortSelect mode="offline" open />
			</Provider>
		);
		fireEvent.click(screen.getByText('Rating'));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: actions.downloadedSearchForm.setSort.type, payload: 'rating' });
		unmount();
	});
});
