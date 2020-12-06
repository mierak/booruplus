import Dexie from 'dexie';
Dexie.dependencies.indexedDB = require('fake-indexeddb');
Dexie.dependencies.IDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');
import db from '../../src/db/database';
import { mTreeNode, mFavoritesTreeNode, mPost } from '../helpers/test.helper';
import { FavoritesTreeNode } from '../../src/db/types';
import {
	getlAllPostIds,
	getAllKeys,
	addPostsToNode,
	addPostToNode,
	removePostsFromNode,
	getCompleteTree,
	getNodeWithoutChildren,
	addChildToNode,
	changeNodeTitle,
	getTreeRoots,
	deleteNodeAndChildren,
	getChildrenNodes,
	deleteChildrenRecursively,
	getChildrenRecursively,
	getAllFavoriteTagsWithCounts,
} from '../../src/db/favorites';
import * as favorites from '../../src/db/favorites';

describe('db/favorites', () => {
	let root: FavoritesTreeNode;
	let child1: FavoritesTreeNode;
	let child2: FavoritesTreeNode;
	let child11: FavoritesTreeNode;
	let keys: number[];

	beforeEach(async (done) => {
		jest.clearAllMocks();
		await db.favorites.clear();
		root = mFavoritesTreeNode({ key: 0, title: 'root', childrenKeys: [1, 2] });
		child1 = mFavoritesTreeNode({ key: 1, parentKey: 0, postIds: [1, 2, 3], childrenKeys: [11] });
		child2 = mFavoritesTreeNode({ key: 2, parentKey: 0, postIds: [4, 5, 6] });
		child11 = mFavoritesTreeNode({ key: 11, parentKey: 1, postIds: [7, 8, 9] });
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		keys = [root.key!!, child1.key!!, child2.key!!, child11.key!!];
		await db.favorites.put(root);
		await db.favorites.put(child1);
		await db.favorites.put(child11);
		await db.favorites.put(child2);
		done();
	});
	describe('getAllPostIds()', () => {
		it('Extracts post Ids starting from root', async () => {
			// given

			// when
			const postIds = await getlAllPostIds();

			// then
			expect(postIds.sort()).toEqual([...root.postIds, ...child1.postIds, ...child11.postIds, ...child2.postIds].sort());
		});
		it('Does not contain duplicates', async () => {
			// given
			const childWithDuplicates = mFavoritesTreeNode({ key: 4, parentKey: 0, postIds: [1, 4, 7] });
			db.favorites.put(childWithDuplicates);

			// when
			const postIds = await getlAllPostIds();

			// then
			expect(postIds.sort()).toEqual([...root.postIds, ...child1.postIds, ...child11.postIds, ...child2.postIds].sort());
		});
	});
	describe('getAllKeys()', () => {
		it('Returns all keys as string array', async () => {
			// given

			// when
			const resultKeys = await getAllKeys();

			//then
			expect(resultKeys).toEqual(keys.map((key) => key.toString()));
		});
	});
	describe('addPostsToNode()', () => {
		it('Correctly adds posts Ids to node', async () => {
			// given
			const newPostIds = [42, 43, 44];

			// when
			await addPostsToNode(2, newPostIds);
			const resultNode = await db.favorites.get(2);

			// then
			expect(resultNode?.postIds.sort()).toEqual([...child2.postIds, ...newPostIds].sort());
		});
		it('Throws error when node is not found in DB', async () => {
			// given
			const nodeId = 1;
			jest.spyOn(db.favorites, 'get').mockResolvedValueOnce(undefined);

			// when
			const shouldThrow = async (): Promise<void> => {
				await addPostsToNode(nodeId, [nodeId]);
			};

			// then
			await expect(shouldThrow()).rejects.toThrowError(`TreeNode with key ${nodeId} was not found in the database`);
		});
	});
	describe('addPostToNode()', () => {
		it('Correctly adds posts Ids to node', async () => {
			// given
			const newPostId = 42;

			// when
			await addPostToNode(2, newPostId);
			const resultNode = await db.favorites.get(2);

			// then
			expect(resultNode?.postIds.sort()).toEqual([...child2.postIds, newPostId].sort());
		});
		it('Throws error when node is not found in DB', async () => {
			// given
			const nodeId = 1;
			jest.spyOn(db.favorites, 'get').mockResolvedValueOnce(undefined);

			// when
			const shouldThrow = async (): Promise<void> => {
				await addPostToNode(nodeId, 1);
			};

			// then
			await expect(shouldThrow()).rejects.toThrowError(`TreeNode with key ${nodeId} was not found in the database`);
		});
		it('Throws error when node already contains given post Id', async () => {
			// given
			const nodeId = 1;
			const postId = 1;

			// when
			const shouldThrow = async (): Promise<void> => {
				await addPostToNode(nodeId, postId);
			};

			// then
			await expect(shouldThrow()).rejects.toThrowError(`TreeNode already contains postId ${postId}`);
		});
	});
	describe('removePostFromNode()', () => {
		it('Gets node from db and removes post id', async () => {
			// given
			const postIds = [1, 2];
			const nodeId = 1;

			// when
			const result = await removePostsFromNode(nodeId, postIds);
			const newNode = await db.favorites.get(nodeId);

			// then
			expect(result).toBe(nodeId);
			expect(newNode).toMatchObject({ ...child1, postIds: [3] });
		});
		it('Throws error when node is not found in DB', async () => {
			// given
			const nodeId = 1;
			jest.spyOn(db.favorites, 'get').mockResolvedValueOnce(undefined);

			// when
			const shouldThrow = async (): Promise<void> => {
				await removePostsFromNode(nodeId, [1]);
			};

			// then
			await expect(shouldThrow()).rejects.toThrowError(`TreeNode with key ${nodeId} was not found in the database`);
		});
	});
	describe('getCompleteTree()', () => {
		it('Calls getChildrenRecursively with Id=0 and returns result', async () => {
			// given
			const spy = jest.spyOn(favorites, 'getChildrenRecursively');

			// when
			const result = await getCompleteTree();

			// then
			expect(spy).toBeCalledWith(0);
			expect(result.key).toBe('0');
		});
	});
	describe('getNodeWithoutChildren()', () => {
		it('Throws error when node is not found in DB', async () => {
			// given
			const nodeId = 1;
			jest.spyOn(db.favorites, 'get').mockResolvedValueOnce(undefined);

			// when
			const shouldThrow = async (): Promise<void> => {
				await getNodeWithoutChildren(nodeId);
			};

			// then
			await expect(shouldThrow()).rejects.toThrowError(`Node with key ${nodeId} was not found in the database`);
		});
		it('Returns correct TreeNode', async () => {
			// given
			const nodeId = 1;

			// when
			const result = await getNodeWithoutChildren(nodeId);

			// then
			expect(result).toMatchObject(
				mTreeNode({
					key: child1.key?.toString(),
					title: child1.title,
					postIds: child1.postIds,
					children: [],
				})
			);
		});
	});
	describe('addChildtoNode()', () => {
		it('Throws error when parent node is not found in DB', async () => {
			// given
			const parentKey = 1;
			const title = 'title';
			jest.spyOn(db.favorites, 'get').mockResolvedValueOnce(undefined);

			// when
			const shouldThrow = async (): Promise<void> => {
				await addChildToNode(parentKey, title);
			};

			// then
			await expect(shouldThrow()).rejects.toThrowError('Parent Tree node was not found in the database, could not create a new leaf');
		});
		it('Adds new node with correct parentKey and adds node key to parents children', async () => {
			// given
			const title = 'test_title';
			const parentKey = 1;
			const expectedNewNode = mFavoritesTreeNode({
				title,
				parentKey,
				childrenKeys: [],
				postIds: [],
			});
			const addSpy = jest.spyOn(db.favorites, 'add');

			// when
			const newNodeKey = await addChildToNode(parentKey, title);
			const parent = await db.favorites.get(parentKey);
			const newNodeInDb = await db.favorites.get(newNodeKey);

			// then
			expect(parent?.childrenKeys).toContain(newNodeKey);
			expect(addSpy).toBeCalledWith({ ...expectedNewNode, key: newNodeKey });
			expect(newNodeInDb).toMatchObject({ ...expectedNewNode, key: newNodeKey });
		});
	});
	describe('changeNodeTitle()', () => {
		it('Throws error when node is not found in DB', async () => {
			// given
			const key = 1;
			const title = 'title';
			jest.spyOn(db.favorites, 'get').mockResolvedValueOnce(undefined);

			// when
			const shouldThrow = async (): Promise<void> => {
				await changeNodeTitle(key, title);
			};

			// then
			await expect(shouldThrow()).rejects.toThrowError(`Node with key ${key} was not found in the database`);
		});
		it('Changes nodes title', async () => {
			// given
			const key = 1;
			const newTitle = 'new_title';
			const putSpy = jest.spyOn(db.favorites, 'put');

			// when
			await changeNodeTitle(key, newTitle);
			const changedNode = await db.favorites.get(key);

			// then
			expect(putSpy).toBeCalledTimes(1);
			expect(changedNode?.title).toBe(newTitle);
		});
	});
	describe('getTreeRoots()', () => {
		it('Calls getChildrenNodes with key = 0 and returns array of TreeNodes', async () => {
			// given
			const spy = jest.spyOn(favorites, 'getChildrenNodes');

			// when
			const result = await getTreeRoots();

			// then
			expect(spy).toBeCalledWith(0);
			expect(result).toEqual([child1, child2]);
		});
	});
	describe('deleteNodeAndChildren()', () => {
		it('Throws error when node is not found in DB', async () => {
			// given
			const key = 1;
			jest.spyOn(db.favorites, 'get').mockResolvedValueOnce(undefined);

			// when
			const shouldThrow = async (): Promise<void> => {
				await deleteNodeAndChildren(key);
			};

			// then
			await expect(shouldThrow()).rejects.toThrowError(`Node with key ${key} was not found in the database`);
		});
		it('Throws error when parent node is not found in DB', async () => {
			// given
			const key = 1;
			// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
			//@ts-ignore
			const spy = jest.spyOn(db.favorites, 'get').mockImplementation((k: number): FavoritesTreeNode | undefined => {
				if (k === 0) return undefined;
				return root;
			});

			// when
			const shouldThrow = async (): Promise<void> => {
				await deleteNodeAndChildren(key);
			};

			// then
			await expect(shouldThrow()).rejects.toThrowError(`Parent with key ${0} was not found in the database`);
			spy.mockRestore();
		});
		it('Removes key from parent and calls deleteChildrenRecursively()', async () => {
			// given
			const key = 1;
			const updateSpy = jest.spyOn(db.favorites, 'update');
			const getSpy = jest.spyOn(db.favorites, 'get');
			const deleteChildrenRecursivelySpy = jest.spyOn(favorites, 'deleteChildrenRecursively');

			// when
			await deleteNodeAndChildren(key);

			// then
			expect(updateSpy).toBeCalledWith(child1.parentKey, { childrenKeys: root.childrenKeys.filter((k) => k !== key) });
			expect(deleteChildrenRecursivelySpy).toBeCalledWith(key);
			expect(getSpy).toBeCalledWith(key);
		});
	});
	describe('getChildrenNodes()', () => {
		it('Throws error when node is not found in DB', async () => {
			// given
			const key = 1;
			jest.spyOn(db.favorites, 'get').mockResolvedValueOnce(undefined);

			// when
			const shouldThrow = async (): Promise<void> => {
				await getChildrenNodes(key);
			};

			// then
			await expect(shouldThrow()).rejects.toThrowError('Master root node not found in the database');
		});
		it('Throws error when child node is not found in DB', async () => {
			// given
			const key = 0;
			// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
			//@ts-ignore
			const spy = jest.spyOn(db.favorites, 'get').mockImplementation((k: number): FavoritesTreeNode | undefined => {
				if (k === 0) return root;
				return undefined;
			});

			// when
			const shouldThrow = async (): Promise<void> => {
				await getChildrenNodes(key);
			};

			// then
			await expect(shouldThrow()).rejects.toThrowError(`Child Root with key ${1} was not found in the database`);
			spy.mockRestore();
		});
		it('Returns nodes children', async () => {
			// given
			const key = 0;
			const getSpy = jest.spyOn(db.favorites, 'get');

			// when
			const result = await getChildrenNodes(key);

			// then
			expect(getSpy).toBeCalledWith(child1.key);
			expect(getSpy).toBeCalledWith(child2.key);
			expect(result).toEqual([child1, child2]);
		});
	});
	describe('deleteChildrenRecursively()', () => {
		it('Throws error when node is not found in DB', async () => {
			// given
			const key = 1;
			jest.spyOn(db.favorites, 'get').mockResolvedValueOnce(undefined);

			// when
			const shouldThrow = async (): Promise<void> => {
				await deleteChildrenRecursively(key);
			};

			// then
			await expect(shouldThrow()).rejects.toThrowError(`Node with key ${key} was not found in the database`);
		});
		it('Calls itself for every child', async () => {
			// given
			const key = 0;
			const spy = jest.spyOn(favorites, 'deleteChildrenRecursively');

			// when
			await deleteChildrenRecursively(key);

			// then
			expect(spy).toBeCalledWith(child1.key);
			expect(spy).toBeCalledWith(child2.key);
		});
	});
	describe('getChildrenRecursively()', () => {
		it('Throws error when node is not found in DB', async () => {
			// given
			const key = 1;
			jest.spyOn(db.favorites, 'get').mockResolvedValueOnce(undefined);

			// when
			const shouldThrow = async (): Promise<void> => {
				await getChildrenRecursively(key);
			};

			// then
			await expect(shouldThrow()).rejects.toThrowError('Master root node not found in the database');
		});
		it('Calls itself for every child', async () => {
			// given
			const key = 0;
			const spy = jest.spyOn(favorites, 'getChildrenRecursively');

			// when
			await getChildrenRecursively(key);

			// then
			expect(spy).toBeCalledWith(child1.key);
			expect(spy).toBeCalledWith(child2.key);
		});
		it('Returns correct children', async () => {
			// given
			const key = 0;
			const expectedRoot = mTreeNode({
				title: root.title,
				key: root.key?.toString(),
				postIds: root.postIds,
				children: [
					mTreeNode({
						title: child1.title,
						key: child1.key?.toString(),
						postIds: child1.postIds,
						children: [
							mTreeNode({
								title: child11.title,
								key: child11.key?.toString(),
								postIds: child11.postIds,
								children: [],
							}),
						],
					}),
					mTreeNode({
						title: child2.title,
						key: child2.key?.toString(),
						postIds: child2.postIds,
						children: [],
					}),
				],
			});

			// when
			const result = await getChildrenRecursively(key);

			// then
			expect(result).toMatchObject(expectedRoot);
		});
	});
	describe('getAllFavoriteTagsWithCounts()', () => {
		it('Returns correct result', async () => {
			// given
			const toArraySpy = jest.spyOn(db.favorites, 'toArray');
			const postsBulkGetSpy = jest.spyOn(db.posts, 'bulkGet');
			const allIds = [...child1.postIds, ...child11.postIds, ...child2.postIds];
			await db.favorites.put({ ...child1, postIds: [...child1.postIds, 1, 1, 1, 1] });
			const tags: string[] = [];
			for (const id of allIds) {
				const tag = `${id}`;
				tags.push(tag);
				const postsTags: string[] = [];
				for (let i = 0; i < id; i++) {
					postsTags.push(tag);
				}
				await db.posts.put(mPost({ id, tags: postsTags }));
			}

			// when
			const result = await getAllFavoriteTagsWithCounts();

			// then
			expect(toArraySpy).toBeCalledTimes(1);
			expect(postsBulkGetSpy).toBeCalledWith(allIds.sort());
			tags.forEach((tag) => {
				expect(result[tag]).toEqual(parseInt(tag));
			});
		});
	});
});
