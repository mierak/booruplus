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

interface Options {
	pattern?: string;
	limit?: number;
	offset?: number;
}

export const getAllWithLimitAndOffset = async (options?: Options): Promise<Tag[]> => {
	let res: Dexie.Collection<Tag, number> | undefined;
	const result = db.tags;
	if (options) {
		const pattern = options.pattern;
		if (pattern) {
			res = result.filter((tag) => tag.tag.includes(pattern));
		} else {
			res = result.toCollection();
		}
		if (options.offset && res) {
			res = res.offset(options.offset);
		}
		if (options.limit && res) {
			res = res.limit(options.limit);
		}
	}
	if (res) {
		return res.toArray();
	} else {
		return result.toArray();
	}
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

export const getCount = async (pattern?: string): Promise<number> => {
	if (pattern) {
		return db.tags.filter((tag) => tag.tag.includes(pattern)).count();
	}
	return db.tags.count();
};
