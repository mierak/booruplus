import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { thunks, actions } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../helpers/store.helper';
import { mTreeNode } from '../../helpers/test.helper';
import SiderContent from '../../../src/components/favorites/SiderContent';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('favorites/SiderContent', () => {
	const rootNode = mTreeNode({
		title: 'node1',
		key: '0',
		children: [
			mTreeNode({
				title: 'node11',
				key: '11',
				children: [
					mTreeNode({
						title: 'node111',
						key: '111',
					}),
				],
			}),
			mTreeNode({
				title: 'node12',
				key: 'node12',
			}),
		],
	});
	const expandedKeys = ['0', '11', '111', '12'];
	it('Renders data correctly', () => {
		// given
		const store = mockStore(
			mState({
				favorites: {
					rootNode,
				},
				settings: {
					favorites: {
						expandedKeys,
					},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<SiderContent />
			</Provider>
		);

		// then
		expect(screen.queryByText('node1')).toBeNull();
		expect(screen.getByText('node11')).not.toBeNull();
		expect(screen.getByText('node111')).not.toBeNull();
		expect(screen.getByText('node12')).not.toBeNull();
	});
	it('Loads data on mount', () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<SiderContent />
			</Provider>
		);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions[0]).toMatchObject({ type: thunks.favorites.fetchAllKeys.pending.type });
		expect(dispatchedActions[1]).toMatchObject({ type: thunks.favorites.fetchTreeData.pending.type });
	});
	it('Fetches posts on directory click', () => {
		// given
		const store = mockStore(
			mState({
				favorites: {
					rootNode,
					expandedKeys,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<SiderContent />
			</Provider>
		);
		fireEvent.click(screen.getByText('node11'));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions[2]).toMatchObject({ type: thunks.favorites.fetchPostsInDirectory.pending.type, meta: { arg: 11 } });
		expect(dispatchedActions[3]).toMatchObject({ type: actions.favorites.setActiveNodeKey.type, payload: 11 });
	});
});
