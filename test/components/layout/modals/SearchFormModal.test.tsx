import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { RootState, AppDispatch } from '../../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../../helpers/store.helper';

import SearchFormModal from '../../../../src/components/layout/modals/SearchFormModal';
import '@testing-library/jest-dom';
import { mTag } from '../../../helpers/test.helper';
import { actions, thunks } from '@store/';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('SearchFormModal', () => {
	const context = 'ctx';
	const state = mState({
		searchContexts: {
			[context]: {
				mode: 'online',
				page: 0,
				sort: 'rating',
				rating: 'questionable',
				sortOrder: 'asc',
				selectedTags: [mTag({ id: 1, tag: 'tag1' })],
				excludedTags: [mTag({ id: 2, tag: 'tag2' })],
			},
		},
	});
	it('Renders correctly', () => {
		// given
		const store = mockStore(state);

		// when
		render(
			<Provider store={store}>
				<SearchFormModal context={context} />
			</Provider>
		);

		// then
		expect(screen.getByText('Online Search')).not.toBeNull();
		expect(screen.getByText('Offline Search')).not.toBeNull();
		expect(screen.getByRole('button', { name: 'Search' })).not.toBeNull();
		expect(screen.getByRole('button', { name: 'Clear' })).not.toBeNull();
		expect(screen.getAllByRole('button', { name: 'Close' })).toHaveLength(2);
	});
	it('Switches tabs corrrectly', () => {
		// given
		const store = mockStore(state);

		// when
		render(
			<Provider store={store}>
				<SearchFormModal context={context} />
			</Provider>
		);
		fireEvent.click(screen.getByText('Offline Search'));
		fireEvent.click(screen.getByText('Online Search'));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.searchContexts.updateContext.type,
			payload: { context, data: { mode: 'offline' } },
		});
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.searchContexts.updateContext.type,
			payload: { context, data: { mode: 'online' } },
		});
	});
	it('Submit hides modal, switches context and fetches posts', () => {
		// given
		const store = mockStore(state);

		// when
		render(
			<Provider store={store}>
				<SearchFormModal context={context} />
			</Provider>
		);
		fireEvent.click(screen.getByText('Offline Search'));
		fireEvent.click(screen.getByText('Search'));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.searchContexts.updateContext.type,
			payload: { context, data: { mode: 'offline' } },
		});
		expect(dispatchedActions).toContainMatchingAction({ type: actions.modals.setVisible.type, payload: false });
		expect(dispatchedActions).toContainMatchingAction({
			type: thunks.onlineSearches.fetchPosts.pending.type,
			meta: { arg: { context } },
		});
	});
	it('Submit hides modal, deletes context and switches to previous tab on close', () => {
		// given
		const store = mockStore(state);

		// when
		render(
			<Provider store={store}>
				<SearchFormModal context={context} deleteOnClose />
			</Provider>
		);
		fireEvent.click(screen.getAllByRole('button', { name: 'Close' })[1]);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: actions.modals.setVisible.type, payload: false });
		expect(dispatchedActions).toContainMatchingAction({ type: 'common/deletePostsContext', payload: { context } });
	});
	it('Submit hides modal, and does not delete context without deleteOnClose prop', () => {
		// given
		const store = mockStore(state);

		// when
		render(
			<Provider store={store}>
				<SearchFormModal context={context} />
			</Provider>
		);
		fireEvent.click(screen.getAllByRole('button', { name: 'Close' })[1]);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: actions.modals.setVisible.type, payload: false });
		expect(dispatchedActions).not.toContainMatchingAction({ type: 'common/deletePostsContext', payload: { context } });
	});
	it('Dispatches clear() when CLear button is pressed', () => {
		// given
		const store = mockStore(mState(state));

		// when
		render(
			<Provider store={store}>
				<SearchFormModal context={context} />
			</Provider>
		);
		fireEvent.click(screen.getByRole('button', { name: 'Clear' }));

		// then
		expect(store.getActions()).toContainMatchingAction({
			type: actions.searchContexts.clear.type,
			payload: { context },
		});
	});
});
