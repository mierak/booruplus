import { createAsyncThunk } from '@reduxjs/toolkit';

import type { ThunkApi, TreeNode } from '@store/types';
import type { Post } from '@appTypes/gelbooruTypes';

import { db } from '@db';
import { getActionLogger } from '@util/logger';
import { thumbnailCache } from '@util/objectUrlCache';

import { exportPostsToDirectory } from '../commonActions';

export const fetchTreeData = createAsyncThunk<TreeNode, void, ThunkApi>(
	'favorites/fetchTreeData',
	async (): Promise<TreeNode> => {
		return db.favorites.getCompleteTree();
	}
);

export const fetchPostsInDirectory = createAsyncThunk<Post[], number | undefined, ThunkApi>(
	'favorites/fetchPostsInDirectory',
	async (key: number | undefined, thunkApi): Promise<Post[]> => {
		thumbnailCache.revokeAll();
		const logger = getActionLogger(fetchPostsInDirectory);
		const keyWithDefault = key ?? thunkApi.getState().favorites.activeNodeKey;
		logger.debug('Getting node without children for key:', keyWithDefault.toString());
		const directory = await db.favorites.getNodeWithoutChildren(keyWithDefault);
		return db.posts.getBulk(directory.postIds);
	}
);

export const fetchAllKeys = createAsyncThunk<string[], void, ThunkApi>(
	'favorites/fetchAllKeys',
	async (): Promise<string[]> => {
		return db.favorites.getAllKeys();
	}
);

export const addDirectory = createAsyncThunk<void, { parentKey: number; title: string }, ThunkApi>(
	'favorites/addDirectory',
	async (params, thunkApi): Promise<void> => {
		const logger = getActionLogger(addDirectory);
		logger.debug('Adding new favorites directory. Parent key:', params.parentKey.toString(), 'Title:', params.title);
		await db.favorites.addChildToNode(params.parentKey, params.title);
		thunkApi.dispatch(fetchAllKeys());
		thunkApi.dispatch(fetchTreeData());
	}
);

export const renameDirectory = createAsyncThunk<void, { key: number; title: string }, ThunkApi>(
	'favorites/renameDirectory',
	async (params, thunkApi): Promise<void> => {
		const logger = getActionLogger(renameDirectory);
		logger.debug('Changing node title. Node key:', params.key.toString(), 'New Title:', params.title);
		await db.favorites.changeNodeTitle(params.key, params.title);
		thunkApi.dispatch(fetchAllKeys());
		thunkApi.dispatch(fetchTreeData());
	}
);

export const deleteDirectoryAndChildren = createAsyncThunk<void, number, ThunkApi>(
	'favorites/deleteDirectoryAndChildren',
	async (key: number, thunkApi): Promise<void> => {
		const logger = getActionLogger(deleteDirectoryAndChildren);
		logger.debug(`Deleting node with key ${key} and its children`);
		await db.favorites.deleteNodeAndChildren(key);
		thunkApi.dispatch(fetchAllKeys());
		thunkApi.dispatch(fetchTreeData());
	}
);

export const addPostsToDirectory = createAsyncThunk<void, { posts: Post[]; key: string | number }, ThunkApi>(
	'favorites/addPostsToDirectory',
	async (params, thunkApi): Promise<void> => {
		const logger = getActionLogger(addPostsToDirectory);

		const ids = params.posts.map((p) => p.id);
		logger.debug(`Adding post ids ${ids.join(' ')} to directory key: ${params.key}`);
		await db.posts.bulkSave(params.posts);
		await db.favorites.addPostsToNode(parseInt(params.key.toString()), ids);
		thunkApi.dispatch(fetchTreeData());
	}
);

export const removePostsFromActiveDirectory = createAsyncThunk<void, Post[], ThunkApi>(
	'favorites/removePostFromActiveDirectory',
	async (posts, thunkApi): Promise<void> => {
		const logger = getActionLogger(removePostsFromActiveDirectory);
		const key = thunkApi.getState().favorites.activeNodeKey;

		const ids = posts.map((p) => p.id);
		logger.debug(`Removing post ids ${ids.join(' ')} from directory key: ${key}`);
		await db.favorites.removePostsFromNode(key, ids);
		thunkApi.dispatch(fetchTreeData());
	}
);

export const exportDirectory = createAsyncThunk<Post[], { targetDirectoryKey: number }, ThunkApi>(
	'favorites/exportDirectory',
	async ({ targetDirectoryKey }, thunkApi): Promise<Post[]> => {
		const logger = getActionLogger(exportDirectory);

		const directory = await db.favorites.getNodeWithoutChildren(targetDirectoryKey);
		logger.debug(`Retrieved directory containing ${directory.postIds.length} posts`);
		const posts = await db.posts.getBulk(directory.postIds);
		logger.debug(`Retrieved ${posts.length} posts`);
		thunkApi.dispatch(exportPostsToDirectory(posts));
		return posts;
	}
);
