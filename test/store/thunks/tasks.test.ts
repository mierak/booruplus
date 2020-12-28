import { doDatabaseMock, mockedDb } from '../../helpers/database.mock';
doDatabaseMock();

import type { AppDispatch, RootState } from '@store/types';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import * as thunks from '../../../src/store/thunks/tasks';
import { initialState } from '../../../src/store';
import { mTask } from '../../helpers/test.helper';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('thunks/tasks', () => {
	describe('rehydrateFromDb()', () => {
		it('Gets correct tasks', async () => {
			// given
			const store = mockStore(initialState);
			const tasks = [mTask({ id: 0 }), mTask({ id: 2 }), mTask({ id: 3 })];
			mockedDb.tasks.getAll.mockResolvedValue(tasks);

			// when
			await store.dispatch(thunks.rehydrateFromDb());

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.tasks.getAll).toBeCalledTimes(1);
			expect(dispatchedActions[0]).toMatchObject({ type: 'tasks/rehydrateFromDb/pending', payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: 'tasks/rehydrateFromDb/fulfilled', payload: tasks });
		});
	});
	describe('cancel()', () => {
		it('Correctly cancels task', async () => {
			// given
			const task = mTask({ id: 1 });
			const store = mockStore({
				...initialState,
				tasks: {
					tasks: {
						1: task,
					},
					lastId: 1,
				},
			});

			// when
			await store.dispatch(thunks.cancel(1));

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.tasks.save).toBeCalledWith({ ...task, state: 'canceled' });
			expect(dispatchedActions[0]).toMatchObject({ type: 'tasks/cancel/pending', payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: 'tasks/cancel/fulfilled', payload: { ...task, state: 'canceled' } });
		});
	});
});
