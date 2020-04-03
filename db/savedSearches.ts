import db from './database';
import { SavedSearch } from '../types/gelbooruTypes';
import { SavedSearch as DbSavedSearch } from './types';

export const saveSearch = async (savedSearch: SavedSearch): Promise<number | undefined> => {
	try {
		const dbSearch: DbSavedSearch = {
			rating: savedSearch.rating,
			tags: savedSearch.tags,
			lastSearched: savedSearch.lastSearched,
			previews: []
		};

		if (savedSearch.id) {
			const searchFromDb = await db.savedSearches.get(savedSearch.id);
			searchFromDb && dbSearch.previews.push(...searchFromDb.previews);
			dbSearch.id = savedSearch.id;
		}

		console.log('dbSearch', dbSearch);

		return db.savedSearches.put(dbSearch);
	} catch (err) {
		console.error('Error occured while saving search to DB', err);
	}
};

export const getSavedSearches = async (): Promise<SavedSearch[] | void> => {
	const savedSearches = await db.savedSearches.toArray().catch((err: Error) => {
		console.error(err);
		throw err;
	});
	const returnSearches = savedSearches.map((savedSearch) => {
		const previews = savedSearch.previews.map((blob) => {
			return URL.createObjectURL(blob);
		});
		return {
			id: savedSearch.id,
			rating: savedSearch.rating,
			tags: savedSearch.tags,
			lastSearched: savedSearch.lastSearched,
			previews: previews
		};
	});
	return returnSearches;
};

export const deleteSavedSearch = async (savedSearch: SavedSearch): Promise<void> => {
	savedSearch.id &&
		db.savedSearches.delete(savedSearch.id).catch((err: Error) => {
			console.error(err);
			throw err;
		});
};

export const addPreviewToSavedSearch = async (id: number, blob: Blob): Promise<void> => {
	const searchFromDb = await db.savedSearches.get(id);
	if (searchFromDb) {
		searchFromDb.previews.push(blob);
		db.savedSearches.put(searchFromDb);
	}
};
