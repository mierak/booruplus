import db from './database';
import { FavoritesTreeNode, Counts } from './types';
import { TreeNode } from 'store/types';

export const addChildToNode = async (parentKey: string, title: string): Promise<string> => {
	try {
		const parent = await db.favoritesTree.get(parentKey);
		if (parent) {
			//TODO handle duplicate titles/keys
			const newNode: FavoritesTreeNode = {
				title,
				key: `${parent.key}.${title}`,
				childrenKeys: [],
				postIds: [],
			};
			parent.childrenKeys.push(newNode.key);
			await db.favoritesTree.add(newNode);
			return db.favoritesTree.put(parent);
		} else {
			throw new Error('Parent Tree node was not found in the database, could not create a new leaf');
		}
	} catch (err) {
		return Promise.reject(err);
	}
};

const deleteChildrenRecursively = async (key: string): Promise<void> => {
	try {
		const child = await db.favoritesTree.get(key);
		if (!child) throw new Error(`Node with key ${key} was not found in the database`);

		await Promise.all(child.childrenKeys.map(async (k) => deleteChildrenRecursively(k)));

		return db.favoritesTree.delete(key);
	} catch (err) {
		console.error(`Error while deleting children of key: ${key} recursively`, err);
		return Promise.reject(err);
	}
};

export const deleteNodeAndChildren = async (key: string): Promise<void> => {
	try {
		const match = key.match(/^.*(?=(\.))/);
		if (match) {
			const parentKey = match[0];
			const parent = await db.favoritesTree.get(parentKey);
			if (!parent) throw new Error(`Parent with key ${parentKey} was not found in the database`);
			const newChildren = parent.childrenKeys.filter((k) => k !== key);
			db.favoritesTree.update(parentKey, { childrenKeys: newChildren });

			return deleteChildrenRecursively(key);
		} else {
			throw new Error(`Could not parse parent key from child key: ${key}`);
		}
	} catch (err) {
		console.error('Error while deleting node tree', err);
	}
};

export const getChildrenNodes = async (key: string): Promise<FavoritesTreeNode[]> => {
	try {
		const root = await db.favoritesTree.get(key);
		if (root) {
			const children = await Promise.all(
				root.childrenKeys.map(async (key) => {
					const child = await db.favoritesTree.get(key);
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
	} catch (err) {
		console.error('Error while fetching node roots from db', err);
		return Promise.reject(err);
	}
};

export const getTreeRoots = async (): Promise<FavoritesTreeNode[]> => {
	return getChildrenNodes('root');
};

const getChildrenRecursively = async (key: string): Promise<TreeNode> => {
	try {
		const root = await db.favoritesTree.get(key);
		if (root) {
			const treeNode: TreeNode = {
				title: root.title,
				key: root.key,
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
	} catch (err) {
		console.error('Error while fetching children recursively', err);
		return Promise.reject(err);
	}
};

export const getCompleteTree = async (): Promise<TreeNode> => {
	const root = await getChildrenRecursively('root');
	return root;
};

export const getNodeWithoutChildren = async (key: string): Promise<TreeNode> => {
	try {
		const node = await db.favoritesTree.get(key);
		if (node) {
			const treeNode: TreeNode = {
				title: node.title,
				children: [],
				key: node.key,
				postIds: node.postIds,
			};
			return treeNode;
		} else {
			throw new Error(`Node with key ${key} was not found in the database`);
		}
	} catch (err) {
		return Promise.reject(err);
	}
};

export const addPostToNode = async (key: string, postId: number): Promise<number> => {
	try {
		const node = await db.favoritesTree.get(key);
		if (!node) throw new Error(`TreeNode with key ${key} was not found in the database`);
		if (node.postIds.includes(postId)) throw new Error(`TreeNode already contains postId ${postId}`);
		const newPosts = [...node.postIds, postId];
		return db.favoritesTree.update(key, { postIds: newPosts });
	} catch (err) {
		return Promise.reject(err);
	}
};

export const addPostsToNode = async (key: string, postIds: number[]): Promise<number> => {
	try {
		const node = await db.favoritesTree.get(key);
		if (!node) throw new Error(`TreeNode with key ${key} was not found in the database`);

		const idsToAdd = postIds.filter((id) => !node.postIds.includes(id));

		const newPosts = [...node.postIds, ...idsToAdd];
		return db.favoritesTree.update(key, { postIds: newPosts });
	} catch (err) {
		return Promise.reject(err);
	}
};

export const removePostFromNode = async (key: string, postId: number): Promise<number> => {
	try {
		const node = await db.favoritesTree.get(key);
		if (!node) throw new Error(`TreeNode with key ${key} was not found in the database`);
		const newPosts = node.postIds.filter((id) => id !== postId);
		return db.favoritesTree.update(key, { postIds: newPosts });
	} catch (err) {
		return Promise.reject(err);
	}
};

export const getAllKeys = async (): Promise<string[]> => {
	try {
		const keys = await db.favoritesTree.offset(0).keys();
		return keys.map((val) => val.toString());
	} catch (err) {
		return Promise.reject(err);
	}
};

export const getAllFavoriteTagsWithCounts = async (): Promise<{ tag: string; count: number }[]> => {
	const allNodes = await db.favoritesTree.toArray(); // get all tree nodes
	const allPostIds = allNodes.flatMap((node) => node.postIds); // get all post ids in favorites tree
	const deduplicatedPostIds = new Set(allPostIds); // deduplicate post ids
	const posts = await db.posts.bulkGet([...deduplicatedPostIds]); // get all posts
	const allTags = posts.flatMap((post) => post.tags); // get all tags of posts

	const counts: Counts = {}; // object to count unique tags
	allTags.forEach((tag) => {
		// count unique tags
		counts[tag] = counts[tag] !== undefined ? counts[tag] + 1 : 1;
	});

	return Object.keys(counts).map((key) => {
		return { tag: key, count: counts[key] };
	});
};

export const getlAllPostIds = async (): Promise<number[]> => {
	const allNodes = await db.favoritesTree.toArray();
	const allPostIds = allNodes.flatMap((node) => node.postIds);
	const deduplicatedPostIds = new Set(allPostIds);
	return Array.from(deduplicatedPostIds);
};
