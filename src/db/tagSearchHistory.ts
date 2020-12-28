import db from './database';

import { Tag } from '@appTypes/gelbooruTypes';
import { TagHistory } from '@store/types';

export const saveSearch = async (tags: Tag[]): Promise<void> => {
	const history = tags.map((tag) => {
		return { tag, date: new Date().toLocaleTimeString() };
	});
	db.tagSearchHistory.bulkPut(history);
};

export const getMostSearched = async (limit = 20): Promise<TagHistory[]> => {
	const uniqueTags = await db.tagSearchHistory.orderBy('tag.tag').uniqueKeys();
	const result = await Promise.all(
		uniqueTags.map(async (tag) => {
			const res = await db.tagSearchHistory
				.where('tag.tag')
				.equals(tag)
				.first();

			if (res) {
				return {
					tag: res.tag,
					date: res.date,
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
	const filteredResult = result.filter((res): res is TagHistory => res !== undefined);
	return filteredResult.sort((a, b) => b.count - a.count).slice(0, limit);
};
