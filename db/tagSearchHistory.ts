import db from './database';

import { Tag, TagType } from '../types/gelbooruTypes';

export const saveSearch = async (tags: Tag[]): Promise<void> => {
	tags.forEach((tag) => {
		db.tagSearchHistory.put({ date: new Date(), tag: tag.tag, type: tag.type });
	});
};

export const getMostSearched = async (limit = 10): Promise<{ tag: string; count: number; type: TagType }[]> => {
	const uniqueTags = await db.tagSearchHistory.orderBy('tag').uniqueKeys();
	const result = await Promise.all(
		uniqueTags.map(async (tag) => {
			const result = await db.tagSearchHistory
				.where('tag')
				.equals(tag)
				.first();
			const type: TagType = (result && result.type) || 'tag';
			return {
				tag: tag.toString(),
				count: await db.tagSearchHistory
					.where('tag')
					.equals(tag)
					.count(),
				type: type
			};
		})
	);
	return result.sort((a, b) => b.count - a.count);
};
