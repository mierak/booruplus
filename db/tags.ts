import db from './database';
import { Tag } from '../types/gelbooruTypes';

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

export const getAllWithLimitAndOffset = (limit = 100, offset = 0): Promise<Tag[]> => {
	return db.tags
		.offset(offset)
		.limit(limit)
		.toArray();
};

export const checkIfExists = async (tag: string): Promise<boolean> => {
	const result = await db.tags
		.where('tag')
		.equals(tag)
		.first();
	return result !== undefined;
};

export const getTag = async (tag: string): Promise<Tag | undefined> => {
	return db.tags
		.where('tag')
		.equals(tag)
		.first();
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

export const getByPattern = async (pattern: string): Promise<Tag[]> => {
	return db.tags.filter((tag) => tag.tag.includes(pattern)).toArray();
};

export const getCount = async (): Promise<number> => {
	return db.tags.count();
};
