import db from './database';
import { SavedSearch, Rating, Tag, Post } from '../types/gelbooruTypes';
import { SavedSearch as DbSavedSearch } from './types';
import { compareTagArrays } from '../util/utils';

export const save = async (savedSearch: SavedSearch): Promise<number | undefined> => {
	const dbSearch: DbSavedSearch = {
		rating: savedSearch.rating,
		tags: savedSearch.tags,
		excludedTags: savedSearch.excludedTags,
		lastSearched: savedSearch.lastSearched,
		previews: [],
	};

	const searchFromDb = await db.savedSearches.get(savedSearch.id);
	searchFromDb && dbSearch.previews.push(...searchFromDb.previews);
	dbSearch.id = savedSearch.id;

	return db.savedSearches.put(dbSearch);
};

export const createAndSave = async (rating: Rating, tags: Tag[], excludedTags: Tag[]): Promise<number | 'already-exists'> => {
	// Check if SavedSearch with identical tags & excluded tags already exists
	let found = false;
	const allSearches = await db.savedSearches.toArray();
	for (const search of allSearches) {
		const everyTag = compareTagArrays(tags, search.tags);
		const everyExcludedTag = compareTagArrays(excludedTags, search.excludedTags);
		if (everyTag && everyExcludedTag) {
			found = true;
			break;
		}
	}
	if (found) {
		return 'already-exists';
	}

	return db.savedSearches.put({
		previews: [],
		rating,
		tags,
		excludedTags,
	});
};

export const getAll = async (): Promise<SavedSearch[]> => {
	const savedSearches = await db.savedSearches.toArray();
	const returnSearches = savedSearches.map((savedSearch) => {
		const previews = savedSearch.previews.map((preview) => {
			return {
				id: preview.id,
				objectUrl: URL.createObjectURL(preview.blob),
				post: preview.post,
			};
		});
		return {
			id: savedSearch.id as number,
			rating: savedSearch.rating,
			tags: savedSearch.tags,
			excludedTags: savedSearch.excludedTags,
			lastSearched: savedSearch.lastSearched,
			previews: previews,
		};
	});
	return returnSearches;
};

export const remove = async (savedSearch: SavedSearch): Promise<void> => {
	db.savedSearches.delete(savedSearch.id);
};

export const addPreviews = async (id: number, previews: { blob: Blob; post: Post }[]): Promise<void> => {
	const searchFromDb = await db.savedSearches.get(id);
	if (searchFromDb) {
		const id = searchFromDb.previews.length > 0 ? searchFromDb.previews[searchFromDb.previews.length - 1].id + 1 : 0;
		previews.forEach((preview, index) => {
			searchFromDb.previews.push({ id: id + index, blob: preview.blob, post: preview.post });
		});
		db.savedSearches.put(searchFromDb);
	} else {
		throw new Error(`SavedSearch with id ${id} was not found in database`);
	}
};

export const removePreview = async (savedSearch: SavedSearch, previewId: number): Promise<void> => {
	const searchFromDb = await db.savedSearches.get(savedSearch.id);
	if (searchFromDb) {
		const previews = searchFromDb.previews;
		searchFromDb.previews = previews.filter((preview) => preview.id !== previewId);
		db.savedSearches.put(searchFromDb);
	} else {
		throw new Error(`SavedSearch with id ${previewId} was not found in database`);
	}
};
