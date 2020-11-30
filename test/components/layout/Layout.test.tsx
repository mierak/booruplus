import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { actions } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../helpers/store.helper';

import Layout from '../../../src/components/layout/Layout';

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
		expect(screen.getByText('Thumbnails')).not.toBeNull();
		expect(screen.getByText('Saved Searches')).not.toBeNull();
		expect(screen.getByText('Favorites')).not.toBeNull();
		expect(screen.getByText('Tag List')).not.toBeNull();
		expect(screen.getByText('Online Search')).not.toBeNull();
		expect(screen.getByText('Offline Search')).not.toBeNull();
		expect(screen.getByText('Downloads')).not.toBeNull();
		expect(screen.getByText('Settings')).not.toBeNull();
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
	it('Switches to Thumbnails', () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<Layout />
			</Provider>
		);
		fireEvent.click(screen.getByText('Thumbnails'));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: actions.system.setActiveView.type, payload: 'thumbnails' });
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
		expect(dispatchedActions).toContainMatchingAction({ type: actions.system.setActiveView.type, payload: 'saved-searches' });
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
	it('Opens Online Search Drawer', () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<Layout />
			</Provider>
		);
		fireEvent.click(screen.getByText('Online Search'));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: actions.system.setSearchFormDrawerVisible.type, payload: true });
	});
	it('Opens Offline Search Drawer', () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<Layout />
			</Provider>
		);
		fireEvent.click(screen.getByText('Offline Search'));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: actions.system.setDownloadedSearchFormDrawerVisible.type, payload: true });
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
		expect(dispatchedActions).toContainMatchingAction({ type: actions.modals.showModal.type, payload: 'settings' });
	});
});
