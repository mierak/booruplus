import { TreeNode, ThunkApi } from 'store/types';
import { db } from 'db';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { Post } from 'types/gelbooruTypes';

const fetchTreeData = createAsyncThunk<TreeNode, void, ThunkApi>(
	'favorites/fetchTreeData',
	async (): Promise<TreeNode> => {
		return db.favoritesTree.getCompleteTree();
	}
);

const fetchPostsInDirectory = createAsyncThunk<Post[], string | undefined, ThunkApi>(
	'favorites/fetchPostsInDirectory',
	async (key: string | undefined, thunkApi): Promise<Post[]> => {
		const keyWtihDefaultValue = key ? key : thunkApi.getState().favorites.activeNodeKey;
		const directory = await db.favoritesTree.getNodeWithoutChildren(keyWtihDefaultValue);
		return db.posts.getBulk(directory.postIds);
	}
);

const fetchAllKeys = createAsyncThunk<string[], void, ThunkApi>(
	'favorites/fetchAllKeys',
	async (): Promise<string[]> => {
		return db.favoritesTree.getAllKeys();
	}
);

const addDirectory = createAsyncThunk<void, { parentKey: string; title: string }, ThunkApi>(
	'favorites/addDirectory',
	async (params, thunkApi): Promise<void> => {
		await db.favoritesTree.addChildToNode(params.parentKey, params.title);
		thunkApi.dispatch(fetchAllKeys());
		thunkApi.dispatch(fetchTreeData());
	}
);

const deleteDirectoryAndChildren = createAsyncThunk<void, string, ThunkApi>(
	'favorites/deleteDirectoryAndChildren',
	async (key: string, thunkApi): Promise<void> => {
		await db.favoritesTree.deleteNodeAndChildren(key);
		thunkApi.dispatch(fetchTreeData());
		// TODO check if deleted directory was selected and select the root directory instead
	}
);

const addPostsToDirectory = createAsyncThunk<void, { ids: number[]; key: string | number }, ThunkApi>(
	'favorites/addPostsToDirectory',
	async (params, thunkApi): Promise<void> => {
		await db.favoritesTree.addPostsToNode(params.key.toString(), params.ids);
		thunkApi.dispatch(fetchTreeData());
	}
);

const removePostFromActiveDirectory = createAsyncThunk<void, number, ThunkApi>(
	'favorites/removePostFromActiveDirectory',
	async (id, thunkApi): Promise<void> => {
		const key = thunkApi.getState().favorites.activeNodeKey;
		if (!key) throw new Error('Could not remove post from active directory because no directory is set as active');

		await db.favoritesTree.removePostFromNode(key, id);
		thunkApi.dispatch(fetchTreeData());
	}
);

export const favoritesThunk = {
	fetchTreeData,
	addDirectory,
	deleteDirectoryAndChildren,
	addPostsToDirectory,
	fetchPostsInDirectory,
	removePostFromActiveDirectory,
	fetchAllKeys,
};
