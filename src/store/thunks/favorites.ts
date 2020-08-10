import { TreeNode, ThunkApi } from '../../store/types';
import { db } from '../../db';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { Post } from '../../types/gelbooruTypes';
import { thunkLoggerFactory } from '../../util/logger';

const thunkLogger = thunkLoggerFactory();

export const fetchTreeData = createAsyncThunk<TreeNode, void, ThunkApi>(
	'favorites/fetchTreeData',
	async (): Promise<TreeNode> => {
		thunkLogger.getActionLogger(fetchTreeData);
		return db.favorites.getCompleteTree();
	}
);

export const fetchPostsInDirectory = createAsyncThunk<Post[], number | undefined, ThunkApi>(
	'favorites/fetchPostsInDirectory',
	async (key: number | undefined, thunkApi): Promise<Post[]> => {
		const logger = thunkLogger.getActionLogger(fetchPostsInDirectory);
		const keyWithDefault = key ?? thunkApi.getState().favorites.activeNodeKey;
		logger.debug('Getting node without children for key:', keyWithDefault.toString());
		const directory = await db.favorites.getNodeWithoutChildren(keyWithDefault);
		return db.posts.getBulk(directory.postIds);
	}
);

export const fetchAllKeys = createAsyncThunk<string[], void, ThunkApi>(
	'favorites/fetchAllKeys',
	async (): Promise<string[]> => {
		thunkLogger.getActionLogger(fetchAllKeys);
		return db.favorites.getAllKeys();
	}
);

export const addDirectory = createAsyncThunk<void, { parentKey: number; title: string }, ThunkApi>(
	'favorites/addDirectory',
	async (params, thunkApi): Promise<void> => {
		const logger = thunkLogger.getActionLogger(addDirectory);
		logger;
		logger.debug('Adding new favorites directory. Parent key:', params.parentKey.toString(), 'Title:', params.title);
		await db.favorites.addChildToNode(params.parentKey, params.title);
		thunkApi.dispatch(fetchAllKeys());
		thunkApi.dispatch(fetchTreeData());
	}
);

export const renameDirectory = createAsyncThunk<void, { key: number; title: string }, ThunkApi>(
	'favorites/renameDirectory',
	async (params, thunkApi): Promise<void> => {
		const logger = thunkLogger.getActionLogger(renameDirectory);
		logger.debug('Changing node title. Node key:', params.key.toString(), 'New Title:', params.title);
		await db.favorites.changeNodeTitle(params.key, params.title);
		thunkApi.dispatch(fetchAllKeys());
		thunkApi.dispatch(fetchTreeData());
	}
);

export const deleteDirectoryAndChildren = createAsyncThunk<void, number, ThunkApi>(
	'favorites/deleteDirectoryAndChildren',
	async (key: number, thunkApi): Promise<void> => {
		const logger = thunkLogger.getActionLogger(deleteDirectoryAndChildren);
		logger.debug(`Deleting node with key ${key} and its children`);
		await db.favorites.deleteNodeAndChildren(key);
		thunkApi.dispatch(fetchAllKeys());
		thunkApi.dispatch(fetchTreeData());
	}
);

export const addPostsToDirectory = createAsyncThunk<void, { ids: number[]; key: string | number }, ThunkApi>(
	'favorites/addPostsToDirectory',
	async (params, thunkApi): Promise<void> => {
		const logger = thunkLogger.getActionLogger(addPostsToDirectory);

		logger.debug(`Adding post ids ${params.ids.join(' ')} to directory key: ${params.key}`);
		await db.favorites.addPostsToNode(parseInt(params.key.toString()), params.ids);
		thunkApi.dispatch(fetchTreeData());
	}
);

export const removePostsFromActiveDirectory = createAsyncThunk<void, number[], ThunkApi>(
	'favorites/removePostFromActiveDirectory',
	async (ids, thunkApi): Promise<void> => {
		const logger = thunkLogger.getActionLogger(removePostsFromActiveDirectory);
		const key = thunkApi.getState().favorites.activeNodeKey;

		logger.debug(`Removing post ids ${ids.join(' ')} from directory key: ${key}`);
		await db.favorites.removePostsFromNode(key, ids);
		thunkApi.dispatch(fetchTreeData());
	}
);
