import { db } from 'db';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TreeNode, AppThunk } from './types';
import { actions as globalActions } from '.';

interface FavoritesState {
	treeData: TreeNode[];
	rootNode: TreeNode | undefined;
	activeNodeKey: string;
	expandedKeys: string[];
	selectedNodeKey: string | undefined;
}

const initialState: FavoritesState = {
	treeData: [],
	rootNode: undefined,
	activeNodeKey: 'root',
	expandedKeys: [],
	selectedNodeKey: undefined,
};

const favoritesSlice = createSlice({
	name: 'favorites',
	initialState: initialState,
	reducers: {
		setTreeData: (state, action: PayloadAction<TreeNode[]>): void => {
			state.treeData = action.payload;
		},
		setRootNode: (state, action: PayloadAction<TreeNode>): void => {
			state.rootNode = action.payload;
		},
		setActiveNodeKey: (state, action: PayloadAction<string>): void => {
			state.activeNodeKey = action.payload;
		},
		setExpandedKeys: (state, action: PayloadAction<string[]>): void => {
			state.expandedKeys = action.payload;
		},
		addExpandedKey: (state, action: PayloadAction<string>): void => {
			state.expandedKeys.push(action.payload);
		},
		setSelectedNodeKey: (state, action: PayloadAction<string | undefined>): void => {
			state.selectedNodeKey = action.payload;
		},
	},
});

const fetchTreeData = (): AppThunk => async (dispatch): Promise<void> => {
	try {
		const data = await db.favoritesTree.getCompleteTree();
		dispatch(favoritesSlice.actions.setTreeData(data.children));
		dispatch(favoritesSlice.actions.setRootNode(data));
		return Promise.resolve();
	} catch (err) {
		console.error('Error while fetching tree data', err);
		return Promise.reject(err);
	}
};

const fetchPostsInDirectory = (key?: string): AppThunk => async (dispatch, getState): Promise<void> => {
	try {
		const keyWtihDefaultValue = key ? key : getState().favorites.activeNodeKey;

		const directory = await db.favoritesTree.getNodeWithoutChildren(keyWtihDefaultValue);
		const posts = await db.posts.getBulk(directory.postIds);
		dispatch(globalActions.posts.setPosts(posts));
		return Promise.resolve();
	} catch (err) {
		console.error('Error while fetching posts in directory', err);
		return Promise.reject(err);
	}
};

const fetchAllKeys = (): AppThunk<string[]> => async (): Promise<string[]> => {
	try {
		return db.favoritesTree.getAllKeys();
	} catch (err) {
		console.error('Error while fetching TreeNode keys from database', err);
		return Promise.reject(err);
	}
};

const addDirectory = (parentKey: string, title: string): AppThunk => async (dispatch): Promise<void> => {
	try {
		const key = await db.favoritesTree.addChildToNode(parentKey, title);
		const newData = await db.favoritesTree.getCompleteTree();
		dispatch(favoritesSlice.actions.setTreeData(newData.children));
		dispatch(favoritesSlice.actions.setRootNode(newData));
		dispatch(favoritesSlice.actions.addExpandedKey(key));
		return Promise.resolve();
	} catch (err) {
		console.error(`Error while adding directory to favorites tree. Parent key: ${parentKey} Title: ${title}`, err);
		return Promise.reject(err);
	}
};

const deleteDirectoryAndChildren = (key: string): AppThunk => async (dispatch, getState): Promise<void> => {
	try {
		await db.favoritesTree.deleteNodeAndChildren(key);
		const newData = await db.favoritesTree.getCompleteTree();
		dispatch(favoritesSlice.actions.setTreeData(newData.children));
		dispatch(favoritesSlice.actions.setRootNode(newData));
		if (key === getState().favorites.activeNodeKey) {
			dispatch(globalActions.posts.setPosts([]));
		}
		return Promise.resolve();
	} catch (err) {
		console.error(`Error while deleting directory from favorites tree. Key: ${key}`, err);
		return Promise.reject(err);
	}
};

const addPostToDirectory = (postId: number, key: string | number): AppThunk => async (dispatch): Promise<void> => {
	try {
		await db.favoritesTree.addPostToNode(key.toString(), postId);
		const newData = await db.favoritesTree.getCompleteTree();
		dispatch(favoritesSlice.actions.setTreeData(newData.children));
		dispatch(favoritesSlice.actions.setRootNode(newData));
		return Promise.resolve();
	} catch (err) {
		console.error('Error while adding post to directory', err);
		return Promise.reject(err);
	}
};

const addPostsToDirectory = (postIds: number[], key: string | number): AppThunk => async (dispatch): Promise<void> => {
	try {
		await db.favoritesTree.addPostsToNode(key.toString(), postIds);
		const newData = await db.favoritesTree.getCompleteTree();
		dispatch(favoritesSlice.actions.setTreeData(newData.children));
		dispatch(favoritesSlice.actions.setRootNode(newData));
		return Promise.resolve();
	} catch (err) {
		console.error('Error while adding pots to directory', err);
		return Promise.reject(err);
	}
};

const removePostFromActiveDirectory = (postId: number): AppThunk => async (dispatch, getState): Promise<void> => {
	try {
		const directoryKey = getState().favorites.activeNodeKey;
		if (!directoryKey) throw new Error('Could not remove post from active directory because no directory is set as active');

		await db.favoritesTree.removePostFromNode(directoryKey, postId);
		const newData = await db.favoritesTree.getCompleteTree();
		dispatch(favoritesSlice.actions.setTreeData(newData.children));
		dispatch(favoritesSlice.actions.setRootNode(newData));
		return Promise.resolve();
	} catch (err) {
		console.error('Error while removing post from directory', err);
		return Promise.reject(err);
	}
};

export const actions = {
	...favoritesSlice.actions,
	fetchTreeData,
	addDirectory,
	deleteDirectoryAndChildren,
	addPostToDirectory,
	addPostsToDirectory,
	fetchPostsInDirectory,
	removePostFromActiveDirectory,
	fetchAllKeys,
};

export default favoritesSlice.reducer;
