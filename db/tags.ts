import db from './database';
import { Tag } from '../types/gelbooruTypes';

//Tag
export const saveTag = async (tag: Tag): Promise<number | void> => {
	return db.tags.put(tag).catch((err: Error) => {
		console.error(err);
		throw err;
	});
};

export const saveTags = async (tags: Tag[]): Promise<number | void> => {
	return db.tags.bulkPut(tags).catch((err: Error) => {
		console.error(err);
		throw err;
	});
};

export const loadTags = async (): Promise<Tag[] | void> => {
	const tags = await db.tags.toArray().catch((err: Error) => {
		console.error(err);
		throw err;
	});
	return tags;
};

export const checkIfTagExists = async (tag: string): Promise<boolean> => {
	const result = await db.tags
		.where('tag')
		.equals(tag)
		.first();
	return result !== undefined;
};

export const getFavoritePostCountForTag = async (tag: string): Promise<number> => {
	return db.posts
		.where('tags')
		.equals(tag)
		.filter((post) => post.favorite === 1)
		.count();
};

export const getDownloadedPostCountForTag = async (tag: string): Promise<number> => {
	return db.posts
		.where('tags')
		.equals(tag)
		.filter((post) => post.downloaded === 1)
		.count();
};

export const getBlacklistedPostCountForTag = async (tag: string): Promise<number> => {
	return db.posts
		.where('tags')
		.equals(tag)
		.filter((post) => post.blacklisted === 1)
		.count();
};

export const getFavoritePostCountForTag2 = async (tag: Tag): Promise<number> => {
	return db.postsTags
		.where('tag')
		.equals(tag.tag)
		.filter((pt) => {
			return pt.post.favorite === 1;
		})
		.count();
};
