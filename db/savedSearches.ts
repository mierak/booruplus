import db from './database';
import { SavedSearch, Rating, Tag } from '../types/gelbooruTypes';
import { SavedSearch as DbSavedSearch } from './types';

export const save = async (savedSearch: SavedSearch): Promise<number | undefined> => {
	try {
		const dbSearch: DbSavedSearch = {
			rating: savedSearch.rating,
			tags: savedSearch.tags,
			lastSearched: savedSearch.lastSearched,
			previews: []
		};

		const searchFromDb = await db.savedSearches.get(savedSearch.id);
		searchFromDb && dbSearch.previews.push(...searchFromDb.previews);
		dbSearch.id = savedSearch.id;

		return db.savedSearches.put(dbSearch);
	} catch (err) {
		console.error('Error occured while saving search to DB', err);
	}
};

export const createAndSave = async (rating: Rating, tags: Tag[]): Promise<number> => {
	return db.savedSearches.put({
		previews: [],
		rating,
		tags
	});
};

export const getAll = async (): Promise<SavedSearch[] | void> => {
	const savedSearches = await db.savedSearches.toArray().catch((err: Error) => {
		console.error(err);
		throw err;
	});
	const returnSearches = savedSearches.map((savedSearch) => {
		const previews = savedSearch.previews.map((preview) => {
			return {
				id: preview.id,
				objectUrl: URL.createObjectURL(preview.blob)
			};
		});
		return {
			id: savedSearch.id as number,
			rating: savedSearch.rating,
			tags: savedSearch.tags,
			lastSearched: savedSearch.lastSearched,
			previews: previews
		};
	});
	return returnSearches;
};

export const remove = async (savedSearch: SavedSearch): Promise<void> => {
	savedSearch.id &&
		db.savedSearches.delete(savedSearch.id).catch((err: Error) => {
			console.error(err);
			throw err;
		});
};

export const addPreview = async (id: number, blob: Blob): Promise<void> => {
	const searchFromDb = await db.savedSearches.get(id);
	if (searchFromDb) {
		const id = searchFromDb.previews.length > 0 ? searchFromDb.previews[searchFromDb.previews.length - 1].id + 1 : 0;
		searchFromDb.previews.push({ id, blob: blob });
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
