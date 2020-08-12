import Dexie from 'dexie';
Dexie.dependencies.indexedDB = require('fake-indexeddb');
Dexie.dependencies.IDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');
import { Task } from 'store/types';
import { mTask } from '../helpers/test.helper';
import { save, getAll, remove } from '../../src/db/tasks';

import db from '../../src/db/database';
import { utc } from 'moment';

describe('db/tasks', () => {
	describe('save()', () => {
		it('Calls put with correct task', async () => {
			// given
			const task: Task = mTask({ id: 123 });
			const put = jest.spyOn(db.tasks, 'put');

			// when
			await save(task);

			// then
			expect(put).toBeCalledWith({ ...task, id: 123 });
		});
	});
	describe('getAll()', () => {
		it('Orders tasks by id', async () => {
			// given
			const orderBy = jest.spyOn(db.tasks, 'orderBy');

			// when
			await getAll();

			// then
			expect(orderBy).toBeCalledWith('id');
		});
	});
	describe('remove()', () => {
		it('Calls delete', async () => {
			// given
			const id = 123;
			const deleteSpy = jest.spyOn(db.tasks, 'delete');

			// when
			await remove(id);

			// then
			expect(deleteSpy).toBeCalledWith(id);
		});
	});
});
