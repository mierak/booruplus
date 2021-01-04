import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { actions } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../helpers/store.helper';

import Layout from '../../../src/components/layout/Layout';
import { ActiveModal } from '@appTypes/modalTypes';
import { mPost } from '../../helpers/test.helper';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('layout/Layout', () => {
	it('Renders menu', () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<Layout />
			</Provider>
		);

		// then
		expect(screen.getByText('Dashboard')).not.toBeNull();
		expect(screen.getByText('Search')).not.toBeNull();
		expect(screen.getByText('Saved Searches')).not.toBeNull();
		expect(screen.getByText('Favorites')).not.toBeNull();
		expect(screen.getByText('Tag List')).not.toBeNull();
		expect(screen.getByText('Downloads')).not.toBeNull();
		expect(screen.getByText('Settings')).not.toBeNull();
		expect(screen.queryByText('Check Later')).toBeNull();
	});
	it('Renders Check Later queue', () => {
		// given
		const store = mockStore(
			mState({
				searchContexts: {
					checkLaterQueue: {
						posts: [mPost()],
					},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<Layout />
			</Provider>
		);

		// then
		expect(screen.getByText('Check Later')).not.toBeNull();
	});
	it('Switches to Dashboard', () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<Layout />
			</Provider>
		);
		fireEvent.click(screen.getByText('Dashboard'));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: actions.system.setActiveView.type, payload: 'dashboard' });
	});
	it('Switches to Searches', () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<Layout />
			</Provider>
		);
		fireEvent.click(screen.getByText('Search'));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.system.setActiveView.type,
			payload: 'searches',
		});
	});
	it('Switches to Saved Searches', () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<Layout />
			</Provider>
		);
		fireEvent.click(screen.getByText('Saved Searches'));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.system.setActiveView.type,
			payload: 'saved-searches',
		});
	});
	it('Switches to Favorites', () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<Layout />
			</Provider>
		);
		fireEvent.click(screen.getByText('Favorites'));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: actions.system.setActiveView.type, payload: 'favorites' });
	});
	it('Switches to Tag List', () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<Layout />
			</Provider>
		);
		fireEvent.click(screen.getByText('Tag List'));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: actions.system.setActiveView.type, payload: 'tag-list' });
	});
	it('Opens Downloads Drawer', () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<Layout />
			</Provider>
		);
		fireEvent.click(screen.getByText('Downloads'));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: actions.system.setTasksDrawerVisible.type, payload: true });
	});
	it('Opens Settings Modal', () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<Layout />
			</Provider>
		);
		fireEvent.click(screen.getByText('Settings'));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.modals.showModal.type,
			payload: { modal: ActiveModal.SETTINGS, modalState: {} },
		});
	});
	it('Switches to Tag List', () => {
		// given
		const store = mockStore(
			mState({
				searchContexts: {
					checkLaterQueue: { posts: [mPost()] },
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<Layout />
			</Provider>
		);
		fireEvent.click(screen.getByText('Check Later'));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.system.setActiveView.type,
			payload: 'check-later',
		});
	});
});
