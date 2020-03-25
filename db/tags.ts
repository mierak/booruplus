import db from './database';
import { Tag } from '../types/gelbooruTypes';

//Tag
export const save = async (tag: Tag): Promise<number | void> => {
	return db.tags.put(tag).catch((err: Error) => {
		console.error(err);
		throw err;
	});
};

export const saveBulk = async (tags: Tag[]): Promise<number | void> => {
	return db.tags.bulkPut(tags).catch((err: Error) => {
		console.error(err);
		throw err;
	});
};

export const getAll = async (): Promise<Tag[] | void> => {
	const tags = await db.tags.toArray().catch((err: Error) => {
		console.error(err);
		throw err;
	});
	return tags;
};

export const checkIfExists = async (tag: string): Promise<boolean> => {
	const result = await db.tags
		.where('tag')
		.equals(tag)
		.first();
	return result !== undefined;
};

export const getFavoriteCount = async (tag: string): Promise<number> => {
	return db.posts
		.where('tags')
		.equals(tag)
		.filter((post) => post.favorite === 1)
		.count();
};

export const getDownloadedCount = async (tag: string): Promise<number> => {
	return db.posts
		.where('tags')
		.equals(tag)
		.filter((post) => post.downloaded === 1)
		.count();
};

export const getBlacklistedCount = async (tag: string): Promise<number> => {
	return db.posts
		.where('tags')
		.equals(tag)
		.filter((post) => post.blacklisted === 1)
		.count();
};

export const getFavoriteCount2 = async (tag: Tag): Promise<number> => {
	return db.postsTags
		.where('tag')
		.equals(tag.tag)
		.filter((pt) => {
			return pt.post.favorite === 1;
		})
		.count();
};

export const getByPattern = async (pattern: string): Promise<Tag[]> => {
	return db.tags.filter((tag) => tag.tag.includes(pattern)).toArray();
};