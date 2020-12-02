import { doDatabaseMock } from '../helpers/database.mock';
doDatabaseMock();
import reducer, { actions, initialState } from '../../src/store/favorites';
import { thunks } from '../../src/store/';
import { createAction, createPendingAction, mTreeNode } from '../helpers/test.helper';

describe('store/favorites', () => {
	it('Sets root node', () => {
		// given
		const treeData = mTreeNode({ key: '123', children: [mTreeNode({ key: '456' })] });
		const action = createAction(actions.setRootNode.type, treeData);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.rootNode).toStrictEqual(treeData);
	});
	it('Sets active node key', () => {
		// given
		const key = 789;
		const action = createAction(actions.setActiveNodeKey.type, key);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.activeNodeKey).toStrictEqual(key);
	});
	it('Sets expanded keys', () => {
		// given
		const keys = ['asd', 'fgh', 'jkl'];
		const action = createAction(actions.setExpandedKeys.type, keys);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.expandedKeys).toStrictEqual(keys);
	});
	it('Adds expanded key', () => {
		// given
		const keys = ['asd', 'fgh', 'jkl'];
		const addedKey = 'qwe';
		const action = createAction(actions.addExpandedKey.type, addedKey);

		// when
		const result = reducer({ ...initialState, expandedKeys: keys }, action);

		// then
		expect(result.expandedKeys).toStrictEqual([...keys, addedKey]);
	});
	it('Sets key of directory currently being fetched as active', () => {
		// given
		const key = 123;
		const action = createPendingAction(thunks.favorites.fetchPostsInDirectory.fulfilled.type, { arg: key });

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.activeNodeKey).toStrictEqual(key);
	});
	it('Does not set key when directory currently being fetched has no key', () => {
		// given
		const action = createPendingAction(thunks.favorites.fetchPostsInDirectory.fulfilled.type, { arg: undefined });

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.activeNodeKey).toStrictEqual(1);
	});
	it('RootNode and TreeData when fetchTreeData is fulfilled', () => {
		// given
		const treeData = mTreeNode({ key: '123', children: [mTreeNode({ key: '456' })] });
		const action = createAction(thunks.favorites.fetchTreeData.fulfilled.type, treeData);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.rootNode).toStrictEqual(treeData);
	});
	it('Sets expanded keys when fetchAllKeys is fulfilled', () => {
		// given
		const keys = ['key1', 'key2'];
		const action = createAction(thunks.favorites.fetchAllKeys.fulfilled.type, keys);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.expandedKeys).toStrictEqual(keys);
	});
	it('Sets expanded keys when fetchAllKeys is fulfilled', () => {
		// given
		const activeNodeKey = 123;
		const action = createPendingAction(thunks.favorites.deleteDirectoryAndChildren.fulfilled.type, { arg: activeNodeKey });

		// when
		const result = reducer({ ...initialState, activeNodeKey }, action);

		// then
		expect(result.activeNodeKey).toBe(1);
	});
});
