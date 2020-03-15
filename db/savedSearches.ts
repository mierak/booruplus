import db from './database';
import { SavedSearch } from '../types/gelbooruTypes';

export const saveSearch = async (savedSearch: SavedSearch): Promise<number | void> => {
	return db.savedSearches.put(savedSearch).catch((err: Error) => {
		console.error(err);
		throw err;
	});
};

export const getSavedSearches = async (): Promise<SavedSearch[] | void> => {
	const savedSearches = await db.savedSearches.toArray().catch((err: Error) => {
		console.error(err);
		throw err;
	});
	return savedSearches;
};

export const deleteSavedSearch = async (savedSearch: SavedSearch): Promise<void> => {
	savedSearch.id &&
		db.savedSearches.delete(savedSearch.id).catch((err: Error) => {
			console.error(err);
			throw err;
		});
};
