import { doDatabaseMock } from '../helpers/database.mock';
doDatabaseMock();
import reducer, { actions, initialState, TasksState } from '../../src/store/tasks';
import { thunks } from '../../src/store/';
import { Task } from '../../src/store/types';
import { createAction, mPost, createPendingAction, mTask } from '../helpers/test.helper';

describe('store/tasks', () => {
	it('Removes task by id', () => {
		// given
		const id1 = 123;
		const id2 = 12345;
		const action = createAction(actions.remove.type, id1);
		const task1: Task = {
			id: id1,
			items: 100,
			itemsDone: 50,
			postIds: [],
			state: 'downloading',
			timestampStarted: 123456,
		};
		const task2: Task = {
			id: id2,
			items: 100,
			itemsDone: 50,
			postIds: [],
			state: 'downloading',
			timestampStarted: 123456,
		};
		const tasksState: TasksState = {
			lastId: id1,
			tasks: {
				[id1]: task1,
				[id2]: task2,
			},
		};

		// when
		const result = reducer(tasksState, action);

		// then
		expect(result.tasks[id1]).toBeUndefined();
		expect(result.tasks[id2]).toStrictEqual(task2);
	});
	it('Sets state of a given Task', () => {
		// given
		const id = 123;
		const task1: Task = {
			id,
			items: 100,
			itemsDone: 50,
			postIds: [],
			state: 'downloading',
			timestampStarted: 123456,
		};
		const newState = 'preparing';
		const action = createAction(actions.setState.type, { id, value: newState });

		// when
		const result = reducer(
			{
				...initialState,
				tasks: {
					[id]: task1,
				},
			},
			action
		);

		//then
		expect(result.tasks[id].state).toBe(newState);
	});
	it('Correctly rehydrates from DB', () => {
		// given
		const tasks = [mTask({ id: 1 }), mTask({ id: 2 }), mTask({ id: 3 })];
		const lastId = 3;
		const action = createAction(thunks.tasks.rehydrateFromDb.fulfilled.type, tasks);

		// when
		const result = reducer(initialState, action);

		// then
		expect(result.lastId).toBe(lastId);
		expect(result.tasks[1].id).toBe(1);
		expect(result.tasks[2].id).toBe(2);
		expect(result.tasks[3].id).toBe(3);
	});
	it('Cancels tasks correctly on thunk.cancel.fulfilled', () => {
		// given
		const id = 123;
		const task: Task = {
			id,
			items: 100,
			itemsDone: 50,
			postIds: [],
			state: 'downloading',
			timestampStarted: 123456,
		};
		const action = createAction(thunks.tasks.cancel.fulfilled.type, { ...task, state: 'canceled' });

		// when
		const result = reducer({ lastId: id, tasks: { [id]: task } }, action);

		// then
		expect(result.tasks[id].state).toBe('canceled');
	});
	it('Creates a new task when batch downloadPosts is initiated', () => {
		// given
		const lastId = 123;
		const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
		const action = createPendingAction(thunks.posts.downloadPosts.pending.type, { arg: { posts } });

		// when
		const result = reducer({ ...initialState, lastId: lastId }, action);

		// then
		expect(result.tasks[lastId + 1].state).toBe('preparing');
		expect(result.tasks[lastId + 1].itemsDone).toBe(0);
		expect(result.tasks[lastId + 1].items).toBe(posts.length);
		expect(result.tasks[lastId + 1].postIds).toMatchObject(posts.map((post) => post.id));
	});
	it('Correctly changes task when downloadPost is fulfilled successfuly', () => {
		// given
		const taskId = 123;
		const task: Task = {
			id: taskId,
			items: 100,
			itemsDone: 50,
			postIds: [],
			state: 'preparing',
			timestampStarted: 123,
		};
		const action = createPendingAction(thunks.posts.downloadPost.fulfilled.type, { arg: { taskId } });

		// when
		const result = reducer({ ...initialState, tasks: { [taskId]: task } }, action);

		// then
		expect(result.tasks[taskId].itemsDone).toBe(51);
		expect(result.tasks[taskId].state).toBe('downloading');
	});
	it('Replaces task with the returned task', () => {
		// given
		const taskId = 123;
		const task: Task = {
			id: taskId,
			items: 100,
			itemsDone: 100,
			postIds: [],
			state: 'preparing',
			timestampStarted: 123,
		};
		const action = createAction(thunks.posts.persistTask.fulfilled.type, task);

		// when
		const result = reducer(initialState, action);

		// then
		expect(result.tasks[taskId]).toMatchObject(task);
	});
	it('Removes task with the returned task', () => {
		// given
		const taskId = 2;
		const tasksState = {
			1: mTask({ id: 1 }),
			2: mTask({ id: 2 }),
			3: mTask({ id: 3 }),
			4: mTask({ id: 4 }),
		};
		const action = createAction(thunks.tasks.removeTask.fulfilled.type, taskId);

		// when
		const result = reducer({ ...initialState, tasks: { ...tasksState } }, action);

		// then
		expect(result.tasks[taskId]).toBeUndefined();
		expect(result.tasks[1]).toMatchObject(tasksState[1]);
		expect(result.tasks[3]).toMatchObject(tasksState[3]);
		expect(result.tasks[4]).toMatchObject(tasksState[4]);
	});
});
