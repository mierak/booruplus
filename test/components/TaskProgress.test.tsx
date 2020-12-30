import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { thunks } from '../../src/store';
import { RootState, AppDispatch } from '../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../helpers/store.helper';

import TaskProgress from '../../src/components/TaskProgress';
import { generateTabContext } from '@util/utils';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('TaskProgress', () => {
	it('Renders correctly for Preparing state', () => {
		// given
		const store = mockStore(
			mState({
				tasks: {
					lastId: 1,
					tasks: {
						1: {
							id: 1,
							items: 30,
							itemsDone: 0,
							postIds: [1, 2, 3],
							state: 'preparing',
							timestampStarted: Date.now(),
						},
					},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<TaskProgress taskId={1} />
			</Provider>
		);

		// then
		expect(screen.getByText('Preparing to download')).not.toBeNull();
		expect(screen.getByRole('button', { name: 'Cancel' })).not.toBeNull();
		expect(screen.queryByRole('button', { name: 'Open' })).toBeNull();
	});
	it('Renders correctly for Canceled state', () => {
		// given
		const store = mockStore(
			mState({
				tasks: {
					lastId: 1,
					tasks: {
						1: {
							id: 1,
							items: 30,
							itemsDone: 0,
							postIds: [1, 2, 3],
							state: 'canceled',
							timestampStarted: Date.now(),
						},
					},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<TaskProgress taskId={1} />
			</Provider>
		);

		// then
		expect(screen.getByText('Canceled')).not.toBeNull();
		expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull();
		expect(screen.queryByRole('button', { name: 'Open' })).toBeNull();
	});
	it('Renders correctly for Completed state', async () => {
		// given
		const store = mockStore(
			mState({
				tasks: {
					lastId: 1,
					tasks: {
						1: {
							id: 1,
							items: 30,
							itemsDone: 30,
							postIds: [1, 2, 3],
							state: 'completed',
							timestampStarted: Date.now(),
						},
					},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<TaskProgress taskId={1} />
			</Provider>
		);

		// then
		expect(screen.getByText('Completed')).not.toBeNull();
		expect(screen.queryByRole('button', { name: 'Open' })).not.toBeNull();
		expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull();
	});
	it('Renders correctly for Downloading state', async () => {
		// given
		const store = mockStore(
			mState({
				tasks: {
					lastId: 1,
					tasks: {
						1: {
							id: 1,
							items: 30,
							itemsDone: 12,
							postIds: [1, 2, 3],
							state: 'downloading',
							timestampStarted: Date.now(),
						},
					},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<TaskProgress taskId={1} />
			</Provider>
		);

		// then
		const state = store.getState();
		const task = state.tasks.tasks[state.tasks.lastId];
		expect(screen.getByText(`Downloading ${task.itemsDone} of ${task.items} posts`)).not.toBeNull();
		expect(screen.queryByRole('button', { name: 'Open' })).toBeNull();
		expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeNull();
	});
	it('Renders correctly for Failed state', async () => {
		// given
		const store = mockStore(
			mState({
				tasks: {
					lastId: 1,
					tasks: {
						1: {
							id: 1,
							items: 30,
							itemsDone: 12,
							postIds: [1, 2, 3],
							state: 'failed',
							timestampStarted: Date.now(),
						},
					},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<TaskProgress taskId={1} />
			</Provider>
		);

		// then
		expect(screen.getByText('Failed')).not.toBeNull();
		expect(screen.queryByRole('button', { name: 'Open' })).toBeNull();
		expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull();
	});
	it('Dispatches cancel() when Cancel is pressed', async () => {
		// given
		const store = mockStore(
			mState({
				tasks: {
					lastId: 1,
					tasks: {
						1: {
							id: 1,
							items: 30,
							itemsDone: 12,
							postIds: [1, 2, 3],
							state: 'downloading',
							timestampStarted: Date.now(),
						},
					},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<TaskProgress taskId={1} />
			</Provider>
		);
		fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: thunks.tasks.cancel.pending.type, meta: { arg: 1 } });
	});
	it('Dispatches fetchPostsById() when Open is pressed', async () => {
		// given
		const store = mockStore(
			mState({
				tasks: {
					lastId: 1,
					tasks: {
						1: {
							id: 1,
							items: 30,
							itemsDone: 30,
							postIds: [1, 2, 3],
							state: 'completed',
							timestampStarted: Date.now(),
						},
					},
				},
			})
		);
		const newContext = generateTabContext(Object.keys(store.getState().onlineSearchForm));

		// when
		render(
			<Provider store={store}>
				<TaskProgress taskId={1} />
			</Provider>
		);
		fireEvent.click(screen.getByRole('button', { name: 'Open' }));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: thunks.posts.fetchPostsByIds.pending.type,
			meta: { arg: { context: newContext, ids: store.getState().tasks.tasks[1].postIds } },
		});
	});
});
