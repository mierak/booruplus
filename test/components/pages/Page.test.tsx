import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { thunks } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../helpers/store.helper';

import Page from '../../../src/pages/Page';
import '@testing-library/jest-dom';
import { mTag, mSavedSearch, mTreeNode } from '../../helpers/test.helper';
jest.mock('../../../src/service/apiService', () => {
	return {
		__esModule: true,
		getLatestAppVersion: jest.fn(),
	};
});
import * as api from '../../../src/service/apiService';
import { globals } from '../../../src/globals';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('pages/Dashboard', () => {
	beforeEach(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(global as any).api = {
			send: jest.fn(),
		};
		jest.clearAllMocks();
	});
	it('Renders correctly on Dashboard page', async () => {
		// given
		const store = mockStore(
			mState({
				system: {
					activeView: 'dashboard',
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<Page />
			</Provider>
		);

		// then
		await waitFor(() => expect(screen.getByText('Downloaded Posts')).not.toBeNull());
	});
	it('Renders correctly on Thumbnails page', async () => {
		// given
		const context = 'ctx';
		const store = mockStore(
			mState({
				system: {
					activeView: 'searches',
					activeSearchTab: context,
				},
				searchContexts: {
					[context]: {},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<Page />
			</Provider>
		);

		// then
		await waitFor(() => expect(screen.getByText('Image List')).not.toBeNull());
	});
	it('Renders correctly on CheckLaterQueue page', async () => {
		// given
		const store = mockStore(
			mState({
				system: {
					activeView: 'check-later',
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<Page />
			</Provider>
		);

		// then
		await waitFor(() => expect(screen.getByText('Your Queue')).not.toBeNull());
	});
	it('Renders correctly on Image View page', async () => {
		// given
		const store = mockStore(
			mState({
				system: {
					activeView: 'image',
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<Page />
			</Provider>
		);

		// then
		await waitFor(() => expect(screen.getAllByText('Open Search Form')).toHaveLength(2));
	});
	it('Renders correctly on Saved Searches page', async () => {
		// given
		const store = mockStore(
			mState({
				system: {
					activeView: 'saved-searches',
				},
				savedSearches: {
					savedSearches: [
						mSavedSearch({ id: 1, tags: [mTag({ id: 1, tag: 'tag1' })] }),
						mSavedSearch({ id: 2, tags: [mTag({ id: 2, tag: 'tag2' })] }),
					],
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<Page />
			</Provider>
		);

		// then
		await waitFor(() => expect(screen.getAllByText('Tags')).not.toBeNull());
		expect(screen.getByText('tag1')).not.toBeNull();
		expect(screen.getByText('tag2')).not.toBeNull();
	});
	it('Renders correctly on Favorites page', async () => {
		// given
		const store = mockStore(
			mState({
				system: {
					activeView: 'favorites',
				},
				favorites: {
					rootNode: mTreeNode({
						key: '0',
						title: 'root',
						children: [
							mTreeNode({
								key: '1',
								title: 'tree node',
							}),
						],
					}),
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<Page />
			</Provider>
		);

		// then
		await waitFor(() => expect(screen.getByText('tree node')).not.toBeNull());
	});
	it('Renders correctly on Tags page', async () => {
		// given
		const store = mockStore(
			mState({
				system: {
					activeView: 'tag-list',
				},
				tags: {
					tags: [mTag({ id: 1, tag: 'tag1' }), mTag({ id: 2, tag: 'tag2' }), mTag({ id: 3, tag: 'tag3' })],
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<Page />
			</Provider>
		);

		// then
		await waitFor(() => expect(screen.getByText('tag1')).not.toBeNull());
		await waitFor(() => expect(screen.getByText('tag2')).not.toBeNull());
		await waitFor(() => expect(screen.getByText('tag3')).not.toBeNull());
	});
	it('Loads settings and tasks from db', async () => {
		// given
		const store = mockStore(
			mState({
				system: {
					activeView: 'dashboard',
				},
				settings: {
					theme: 'light',
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<Page />
			</Provider>
		);

		// then
		await waitFor(() => expect(screen.getByText('Downloaded Posts')).not.toBeNull());
		const dispatchedActions = store.getActions();
		await waitFor(() =>
			expect(dispatchedActions).toContainMatchingAction({ type: thunks.settings.loadSettings.pending.type })
		);
		await waitFor(() =>
			expect(dispatchedActions).toContainMatchingAction({ type: thunks.tasks.rehydrateFromDb.pending.type })
		);
		await waitFor(() =>
			expect(dispatchedActions).toContainMatchingAction({ type: thunks.favorites.fetchTreeData.pending.type })
		);
	});
	it('Renders loading mask with correct message', async () => {
		// given
		const message = 'test message';
		const store = mockStore(
			mState({
				system: {
					activeView: 'dashboard',
				},
				loadingStates: {
					isFullscreenLoadingMaskVisible: true,
					fullscreenLoadingMaskMessage: message,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<Page />
			</Provider>
		);

		// then
		expect(await screen.findAllByText(message)).not.toBeNull();
		expect(await screen.findByText('Downloaded Posts')).not.toBeNull();
	});
	it('Checks for a new version on first render', async () => {
		// given
		const store = mockStore(
			mState({
				system: {
					activeView: 'dashboard',
				},
				settings: {
					theme: 'dark',
				},
				loadingStates: {
					isFullscreenLoadingMaskVisible: false,
				},
			})
		);
		const spy = jest.spyOn(api, 'getLatestAppVersion').mockResolvedValue({
			assets: [],
			body: '',
			tag_name: '0.0.1',
		});
		globals.VERSION = '0.0.0';

		// when
		render(
			<Provider store={store}>
				<Page />
			</Provider>
		);

		// then
		await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
		expect(await screen.findByText('New version available')).not.toBeNull();
		expect(await screen.findByText('Downloaded Posts')).not.toBeNull();
	});
});
