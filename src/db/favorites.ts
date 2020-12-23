import db from './database';
import { FavoritesTreeNode } from './types';

import { TreeNode } from '@store/types';

export const addChildToNode = async (parentKey: number, title: string): Promise<number> => {
	const parent = await db.favorites.get(parentKey);
	if (parent) {
		//TODO handle duplicate titles/keys
		const newNode: FavoritesTreeNode = {
			title,
			childrenKeys: [],
			postIds: [],
			parentKey,
		};
		const newNodeKey = await db.favorites.add(newNode);
		parent.childrenKeys.push(newNodeKey);
		await db.favorites.put(parent);
		return Promise.resolve(newNodeKey);
	} else {
		throw new Error('Parent Tree node was not found in the database, could not create a new leaf');
	}
};

export const changeNodeTitle = async (key: number, title: string): Promise<number> => {
	const node = await db.favorites.get(key);
	if (!node) throw new Error(`Node with key ${key} was not found in the database`);

	const newNode = { ...node, title };
	return db.favorites.put(newNode);
};

export const deleteChildrenRecursively = async (key: number): Promise<void> => {
	const child = await db.favorites.get(key);
	if (!child) throw new Error(`Node with key ${key} was not found in the database`);

	await Promise.all(child.childrenKeys.map(async (k) => deleteChildrenRecursively(k)));

	return db.favorites.delete(key);
};

export const deleteNodeAndChildren = async (key: number): Promise<void> => {
	const node = await db.favorites.get(key);
	if (!node) throw new Error(`Node with key ${key} was not found in the database`);

	const parent = await db.favorites.get(node.parentKey);
	if (!parent) throw new Error(`Parent with key ${node.parentKey} was not found in the database`);

	const newChildren = parent.childrenKeys.filter((k) => k !== key);
	db.favorites.update(node.parentKey, { childrenKeys: newChildren });

	return deleteChildrenRecursively(key);
};

export const getChildrenNodes = async (key: number): Promise<FavoritesTreeNode[]> => {
	const root = await db.favorites.get(key);
	if (root) {
		const children = await Promise.all(
			root.childrenKeys.map(async (key) => {
				const child = await db.favorites.get(key);
				if (child) {
					return child;
				} else {
					throw new Error(`Child Root with key ${key} was not found in the database`);
				}
			})
		);
		return children;
	} else {
		throw new Error('Master root node not found in the database');
	}
};

export const getTreeRoots = async (): Promise<FavoritesTreeNode[]> => {
	return getChildrenNodes(0);
};

export const getChildrenRecursively = async (key: number): Promise<TreeNode> => {
	const root = await db.favorites.get(key);
	if (root && root.key !== undefined) {
		const treeNode: TreeNode = {
			title: root.title,
			key: root.key.toString(),
			children: [],
			postIds: root.postIds,
		};
		const children: TreeNode[] = [];
		for (const key of root.childrenKeys) {
			children.push(await getChildrenRecursively(key));
		}
		treeNode.children = children;
		return treeNode;
	} else {
		throw new Error('Master root node not found in the database');
	}
};

export const getCompleteTree = async (): Promise<TreeNode> => {
	const root = await getChildrenRecursively(0);
	return root;
};

export const getNodeWithoutChildren = async (key: number): Promise<TreeNode> => {
	const node = await db.favorites.get(key);
	if (node && node.key !== undefined) {
		const treeNode: TreeNode = {
			title: node.title,
			children: [],
			key: node.key.toString(),
			postIds: node.postIds,
		};
		return treeNode;
	} else {
		throw new Error(`Node with key ${key} was not found in the database`);
	}
};

export const addPostToNode = async (key: number, postId: number): Promise<number> => {
	const node = await db.favorites.get(key);
	if (!node) throw new Error(`TreeNode with key ${key} was not found in the database`);
	if (node.postIds.includes(postId)) throw new Error(`TreeNode already contains postId ${postId}`);
	const newPosts = [...node.postIds, postId];
	return db.favorites.update(key, { postIds: newPosts });
};

export const addPostsToNode = async (key: number, postIds: number[]): Promise<number> => {
	const node = await db.favorites.get(key);
	if (!node) throw new Error(`TreeNode with key ${key} was not found in the database`);

	const idsToAdd = postIds.filter((id) => !node.postIds.includes(id));

	const newPosts = [...node.postIds, ...idsToAdd];
	return db.favorites.update(key, { postIds: newPosts });
};

export const removePostsFromNode = async (key: number, postIds: number[]): Promise<number> => {
	const node = await db.favorites.get(key);
	if (!node) throw new Error(`TreeNode with key ${key} was not found in the database`);
	const newPosts = node.postIds.filter((id) => !postIds.find((idToRemove) => idToRemove === id));
	return db.favorites.update(key, { postIds: newPosts });
};

export const getAllKeys = async (): Promise<string[]> => {
	const keys = await db.favorites.offset(0).keys();
	return keys.map((val) => val.toString());
};

export const getAllFavoriteTagsWithCounts = async (): Promise<{ [key: string]: number }> => {
	const allNodes = await db.favorites.toArray(); // get all tree nodes
	const allPostIds = allNodes.flatMap((node) => node.postIds); // get all post ids in favorites tree
	const deduplicatedPostIds = new Set(allPostIds); // deduplicate post ids
	const posts = await db.posts.bulkGet([...deduplicatedPostIds]); // get all posts
	const allTags = posts.flatMap((post) => post.tags); // get all tags of posts

	const res = allTags.reduce<{ [key: string]: number }>((acc, val) => {
		acc[val] = val in acc ? acc[val] + 1 : 1;
		return acc;
	}, {});

	return res;
};

export const getlAllPostIds = async (): Promise<number[]> => {
	const allNodes = await db.favorites.toArray();
	const allPostIds = allNodes.flatMap((node) => node.postIds);
	const deduplicatedPostIds = new Set(allPostIds);
	return Array.from(deduplicatedPostIds);
};
