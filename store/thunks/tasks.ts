import { AppThunk } from 'store/types';
import { actions } from '..';

const create = (): AppThunk<number> => async (dispatch, getState): Promise<number> => {
	const newId = getState().tasks.lastId + 1;
	dispatch(actions.tasks.add(newId));
	return newId;
};

export const tasksThunk = { create };
