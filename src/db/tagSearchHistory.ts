import db from './database';

import { Tag } from '../types/gelbooruTypes';
import { TagHistory } from '../store/types';

export const saveSearch = async (tags: Tag[]): Promise<void> => {
	tags.forEach((tag) => {
		db.tagSearchHistory.put({ tag, date: new Date().toLocaleTimeString() });
	});
};

export const getMostSearched = async (limit = 20): Promise<TagHistory[]> => {
	const uniqueTags = await db.tagSearchHistory.orderBy('tag.tag').uniqueKeys();
	const result = await Promise.all(
		uniqueTags.map(async (tag) => {
			const result = await db.tagSearchHistory
				.where('tag.tag')
				.equals(tag)
				.first();

			if (result) {
				return {
					tag: result.tag,
					date: result.date,
					count: await db.tagSearchHistory
						.where('tag.tag')
						.equals(tag)
						.count(),
				};
			} else {
				return undefined;
			}
		})
	);
	const filteredResult = result.filter((result): result is TagHistory => result !== undefined);
	return filteredResult.sort((a, b) => b.count - a.count).slice(0, limit);
};
