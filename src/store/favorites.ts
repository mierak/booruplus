import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TreeNode } from './types';
import * as thunks from './thunks';

export interface FavoritesState {
	treeData: TreeNode[];
	rootNode: TreeNode | undefined;
	activeNodeKey: number;
	expandedKeys: string[];
	selectedNodeKey: number | undefined;
}

export const initialState: FavoritesState = {
	treeData: [],
	rootNode: undefined,
	activeNodeKey: 0,
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
		setActiveNodeKey: (state, action: PayloadAction<number>): void => {
			state.activeNodeKey = action.payload;
		},
		setExpandedKeys: (state, action: PayloadAction<string[]>): void => {
			state.expandedKeys = action.payload;
		},
		addExpandedKey: (state, action: PayloadAction<string>): void => {
			state.expandedKeys.push(action.payload);
		},
		setSelectedNodeKey: (state, action: PayloadAction<number | undefined>): void => {
			state.selectedNodeKey = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder.addCase(thunks.favorites.fetchPostsInDirectory.fulfilled, (state, action) => {
			const key = action.meta.arg;
			if (key) {
				state.activeNodeKey = key;
			}
		});
		builder.addCase(thunks.favorites.fetchTreeData.fulfilled, (state, action) => {
			state.rootNode = action.payload;
			state.treeData = action.payload.children;
		});
		builder.addCase(thunks.favorites.fetchAllKeys.fulfilled, (state, action) => {
			state.expandedKeys = action.payload;
		});
	},
});

export default favoritesSlice.reducer;

export const actions = favoritesSlice.actions;
