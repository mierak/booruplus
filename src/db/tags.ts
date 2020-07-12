import db from './database';
import { Tag, TagType } from '../types/gelbooruTypes';

export const save = async (tag: Tag): Promise<number | void> => {
	return db.tags.put(tag);
};

export const bulkPut = async (tags: Tag[]): Promise<number> => {
	return db.tags.bulkPut(tags);
};
export const getAll = async (): Promise<Tag[]> => {
	return db.tags.toArray();
};

interface Options {
	pattern?: string;
	limit?: number;
	offset?: number;
	types?: TagType[];
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
		if (options.types) {
			const types = options.types;
			res = res.filter((tag) => types.includes(tag.type));
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

interface Options {
	pattern?: string;
	types?: TagType[];
}

export const getCount = async (options?: Options): Promise<number> => {
	if (options) {
		let res: Dexie.Collection<Tag, number> | undefined;
		const result = db.tags;
		const pattern = options.pattern;
		const types = options.types;
		if (pattern) {
			res = result.filter((tag) => tag.tag.includes(pattern));
		} else {
			res = result.toCollection();
		}
		if (types) {
			res = res.filter((tag) => types.includes(tag.type));
		}
		return res.count();
	}
	return db.tags.count();
};
