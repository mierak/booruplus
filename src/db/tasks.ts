import db from './database';
import { Task } from '../store/types';

export const save = (task: Task): Promise<number> => {
	return db.tasks.put(task);
};

export const getAll = (): Promise<Task[]> => {
	return db.tasks
		.orderBy('id')
		.reverse()
		.toArray();
};

export const remove = (id: number): Promise<void> => {
	return db.tasks.delete(id);
};
