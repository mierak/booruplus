import { doDatabaseMock, mockedDb } from '../../helpers/database.mock';
doDatabaseMock();

import { initialState } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as thunks from '../../../src/store/thunks/favorites';
import { mPost, mTreeNode } from '../../helpers/test.helper';
import { mState } from '../../helpers/store.helper';
import { exportPostsToDirectory } from '../../../src/store/commonActions';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('thunks/favorites', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});
	describe('fetchTreeData()', () => {
		it('Calls db correctly', async () => {
			// given
			const store = mockStore(initialState);
			const treeNode = mTreeNode({ children: [mTreeNode({ key: '2' }), mTreeNode({ key: '3' }), mTreeNode({ key: '4' })] });
			mockedDb.favorites.getCompleteTree.mockResolvedValue(treeNode);

			// when
			await store.dispatch(thunks.fetchTreeData());

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.favorites.getCompleteTree).toBeCalledTimes(1);
			expect(dispatchedActions[0]).toMatchObject({ type: 'favorites/fetchTreeData/pending', payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: 'favorites/fetchTreeData/fulfilled', payload: treeNode });
		});
	});
	describe('fetchPostsInDirectory()', () => {
		it('Calls db correctly', async () => {
			// given
			const store = mockStore(initialState);
			const treeNode = mTreeNode({ children: [mTreeNode({ key: '2' }), mTreeNode({ key: '3' }), mTreeNode({ key: '4' })] });
			const posts = [mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 })];
			mockedDb.favorites.getNodeWithoutChildren.mockResolvedValue(treeNode);
			mockedDb.posts.getBulk.mockResolvedValue(posts);

			// when
			await store.dispatch(thunks.fetchPostsInDirectory(parseInt(treeNode.key)));

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.favorites.getNodeWithoutChildren).toBeCalledWith(parseInt(treeNode.key));
			expect(mockedDb.posts.getBulk).toBeCalledWith(treeNode.postIds);
			expect(dispatchedActions[0]).toMatchObject({ type: 'favorites/fetchPostsInDirectory/pending', payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: 'favorites/fetchPostsInDirectory/fulfilled', payload: posts });
		});
		it('Defaults to activeNodeKey if no key is supplied', async () => {
			// given
			const store = mockStore(initialState);

			// when
			await store.dispatch(thunks.fetchPostsInDirectory());

			// then
			expect(mockedDb.favorites.getNodeWithoutChildren).toBeCalledWith(store.getState().favorites.activeNodeKey);
		});
	});
	describe('fetchAllKeys()', () => {
		it('Calls db correctly', async () => {
			// given
			const store = mockStore(initialState);
			const keys = ['1', '2', '3', '4', '5'];
			mockedDb.favorites.getAllKeys.mockResolvedValue(keys);

			// when
			await store.dispatch(thunks.fetchAllKeys());

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.favorites.getAllKeys).toBeCalledTimes(1);
			expect(dispatchedActions[0]).toMatchObject({ type: 'favorites/fetchAllKeys/pending', payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: 'favorites/fetchAllKeys/fulfilled', payload: keys });
		});
	});
	describe('addDirectory()', () => {
		it('Calls db correctly', async () => {
			// given
			const store = mockStore(initialState);
			const parentKey = 1;
			const title = 'directory_title';

			// when
			await store.dispatch(thunks.addDirectory({ parentKey, title }));

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.favorites.addChildToNode).toBeCalledWith(parentKey, title);
			expect(dispatchedActions[0]).toMatchObject({ type: 'favorites/addDirectory/pending', payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: 'favorites/fetchAllKeys/pending', payload: undefined });
			expect(dispatchedActions[2]).toMatchObject({ type: 'favorites/fetchTreeData/pending', payload: undefined });
			expect(dispatchedActions[3]).toMatchObject({ type: 'favorites/addDirectory/fulfilled', payload: undefined });
		});
	});
	describe('renameDirectory()', () => {
		it('Calls db correctly', async () => {
			// given
			const store = mockStore(initialState);
			const key = 1;
			const title = 'directory_title';

			// when
			await store.dispatch(thunks.renameDirectory({ key, title }));

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.favorites.changeNodeTitle).toBeCalledWith(key, title);
			expect(dispatchedActions[0]).toMatchObject({ type: 'favorites/renameDirectory/pending', payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: 'favorites/fetchAllKeys/pending', payload: undefined });
			expect(dispatchedActions[2]).toMatchObject({ type: 'favorites/fetchTreeData/pending', payload: undefined });
			expect(dispatchedActions[3]).toMatchObject({ type: 'favorites/renameDirectory/fulfilled', payload: undefined });
		});
	});
	describe('deleteDirectoryAndChildren()', () => {
		it('Calls db correctly', async () => {
			// given
			const store = mockStore(initialState);
			const key = 1;

			// when
			await store.dispatch(thunks.deleteDirectoryAndChildren(key));

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.favorites.deleteNodeAndChildren).toBeCalledWith(key);
			expect(dispatchedActions[0]).toMatchObject({ type: 'favorites/deleteDirectoryAndChildren/pending', payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: 'favorites/fetchAllKeys/pending', payload: undefined });
			expect(dispatchedActions[2]).toMatchObject({ type: 'favorites/fetchTreeData/pending', payload: undefined });
			expect(dispatchedActions[3]).toMatchObject({ type: 'favorites/deleteDirectoryAndChildren/fulfilled', payload: undefined });
		});
	});
	describe('addPostsToDirectory()', () => {
		it('Calls db correctly', async () => {
			// given
			const store = mockStore(initialState);
			const key = 1;
			const postIds = [1, 2, 3, 4, 5];

			// when
			await store.dispatch(thunks.addPostsToDirectory({ key, ids: postIds }));

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.favorites.addPostsToNode).toBeCalledWith(key, postIds);
			expect(dispatchedActions[0]).toMatchObject({ type: 'favorites/addPostsToDirectory/pending', payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: 'favorites/fetchTreeData/pending', payload: undefined });
			expect(dispatchedActions[2]).toMatchObject({ type: 'favorites/addPostsToDirectory/fulfilled', payload: undefined });
		});
	});
	describe('removePostsFromActiveDirectory()', () => {
		it('Calls db correctly', async () => {
			// given
			const store = mockStore({ ...initialState, favorites: { ...initialState.favorites, activeNodeKey: 1 } });
			const postIds = [1, 2, 3, 4, 5];

			// when
			await store.dispatch(thunks.removePostsFromActiveDirectory(postIds));

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.favorites.removePostsFromNode).toBeCalledWith(store.getState().favorites.activeNodeKey, postIds);
			expect(dispatchedActions[0]).toMatchObject({ type: thunks.removePostsFromActiveDirectory.pending.type, payload: undefined });
			expect(dispatchedActions[1]).toMatchObject({ type: 'favorites/fetchTreeData/pending', payload: undefined });
			expect(dispatchedActions[2]).toMatchObject({ type: 'favorites/removePostFromActiveDirectory/fulfilled', payload: undefined });
		});
	});
	describe('exportDirectory()', () => {
		it('Calls DB correctly and dispatches exportPostsToDirectory()', async () => {
			// given
			const selectedKey = 12345;
			const postIds = [12, 13, 5, 6, 8, 6565];
			const posts = [mPost({ id: 123 }), mPost({ id: 456 })];
			const store = mockStore(mState());
			mockedDb.favorites.getNodeWithoutChildren.mockResolvedValue(mTreeNode({ postIds }));
			mockedDb.posts.getBulk.mockResolvedValue(posts);

			// when
			await store.dispatch(thunks.exportDirectory({  targetDirectoryKey: selectedKey  }));

			// then
			const dispatchedActions = store.getActions();
			expect(mockedDb.favorites.getNodeWithoutChildren).toBeCalledWith(selectedKey);
			expect(mockedDb.posts.getBulk).toBeCalledWith(postIds);
			expect(dispatchedActions).toContainMatchingAction({
				type: exportPostsToDirectory.pending.type,
				meta: { arg: posts },
			});
		});
	});
});
