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

export const getTag = async (tag: string): Promise<Tag | undefined> => {
	return db.tags
		.where('tag')
		.equals(tag)
		.first();
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

export const getByPattern = async (pattern: string): Promise<Tag[]> => {
	return db.tags.filter((tag) => tag.tag.includes(pattern)).toArray();
};

export const getCount = async (): Promise<number> => {
	return db.tags.count();
};

export const getMostFavorited = async (limit = 20): Promise<{ tag: Tag | undefined; count: number }[]> => {
	const uniqueTags = await db.tags.orderBy('tag').uniqueKeys();
	const favoriteCounts = await Promise.all(
		uniqueTags.map(async (tag) => {
			return {
				tag: await db.tags
					.where('tag')
					.equals(tag)
					.first(),
				count: await getFavoriteCount(tag.toString()),
			};
		})
	);
	favoriteCounts.sort((a, b) => b.count - a.count);
	return favoriteCounts.filter((tag) => tag.count > 0).slice(0, limit);
};
