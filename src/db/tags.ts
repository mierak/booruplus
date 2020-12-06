import db from './database';

import { Tag, TagType } from '@appTypes/gelbooruTypes';

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
	const result = await db.tags.where('tag').equals(tag).first();
	return result !== undefined;
};

export const getTag = async (tag: string): Promise<Tag | undefined> => {
	return db.tags.where('tag').equals(tag).first();
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

interface BlacklistedAndDownloadedCounts {
	downloadedCounts: { [key: string]: number };
	blacklistedCounts: { [key: string]: number };
}

export const getBlacklistedAndDownloadedCounts = async (): Promise<BlacklistedAndDownloadedCounts> => {
	const downloadedTags = (await db.posts.where('downloaded').equals(1).toArray()).flatMap((post) => post.tags);
	const downloadedCounts = downloadedTags.reduce<{ [key: string]: number }>((acc, val) => {
		acc[val] = val in acc ? acc[val] + 1 : 1;
		return acc;
	}, {});

	const blacklistedTags = (await db.posts.where('blacklisted').equals(1).toArray()).flatMap((post) => post.tags);
	const blacklistedCounts = blacklistedTags.reduce<{ [key: string]: number }>((acc, val) => {
		acc[val] = val in acc ? acc[val] + 1 : 1;
		return acc;
	}, {});

	return { downloadedCounts, blacklistedCounts };
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
