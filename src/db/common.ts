import db from './database';
import { ExportedData, ExportedRawData, SavedSearch, SavedSearchWithB64Previews } from './types';
import { blobToBase64 } from '../util/utils';

const allTables = [db.favorites, db.posts, db.savedSearches, db.settings, db.tags, db.tagSearchHistory, db.tasks];

export const base64PreviewsToBlobs = async (savedSearches: SavedSearchWithB64Previews[]): Promise<SavedSearch[]> => {
	return Promise.all(
		savedSearches.map(async (ss) => {
			return {
				...ss,
				previews: await Promise.all(
					ss.previews.map(async (preview) => {
						const result = await fetch(preview.data);
						return {
							id: preview.id,
							blob: await result.blob(),
							post: preview.post,
						};
					})
				),
			};
		})
	);
};

export const blobPreviewsToBase64 = async (savedSearches: SavedSearch[]): Promise<SavedSearchWithB64Previews[]> => {
	return Promise.all(
		savedSearches.map(async (ss) => {
			return {
				...ss,
				previews: await Promise.all(
					ss.previews.map(async (preview) => {
						const b64 = await blobToBase64(preview.blob);
						return {
							id: preview.id,
							data: b64 as string,
							post: preview.post,
						};
					})
				),
			};
		})
	);
};

export const clearDb = (onProgress: (message: string) => void): Promise<number> => {
	onProgress('Clearing database');
	return db.transaction('rw', allTables, async () => {
		onProgress('Clearing favorites');
		await db.favorites.clear();

		onProgress('Clearing posts');
		await db.posts.clear();

		onProgress('Clearing settings');
		await db.settings.clear();

		onProgress('Clearing tags');
		await db.tags.clear();

		onProgress('Clearing tag search history');
		await db.tagSearchHistory.clear();

		onProgress('Clearing tasks');
		await db.tasks.clear();

		onProgress('Clearing saved searches');
		await db.savedSearches.clear();

		onProgress('Clearing finished');

		return 1;
	});
};

export const restoreDb = (data: ExportedRawData, onProgress: (message: string) => void): Promise<number> => {
	onProgress('Restoring database');
	return db.transaction('rw', allTables, async () => {
		onProgress('Restoring favorites');
		await db.favorites.bulkPut(data.favorites);

		onProgress('Restoring posts');
		await db.posts.bulkPut(data.posts);

		onProgress('Restoring settings');
		await db.settings.bulkPut(data.settings);

		onProgress('Restoring tags');
		await db.tags.bulkPut(data.tags);

		onProgress('Restoring tag search history');
		await db.tagSearchHistory.bulkPut(data.tagSearchHistory);

		onProgress('Restoring tasks');
		await db.tasks.bulkPut(data.tasks);

		onProgress('Restoring saved searches');
		await db.savedSearches.bulkPut(data.savedSearches);

		onProgress('Restore finished');

		return 1;
	});
};

export const clearAndRestoreDb = async (data: ExportedData, onProgress: (message: string) => void): Promise<number> => {
	onProgress('Reconstructing preview images');
	const replacedData: ExportedRawData = {
		...data,
		savedSearches: await base64PreviewsToBlobs(data.savedSearches),
	};
	return db.transaction('rw', allTables, async () => {
		await clearDb(onProgress);
		await restoreDb(replacedData, onProgress);
		return 1;
	});
};

export const exportDb = (onProgress: (message: string) => void): Promise<ExportedData> => {
	return db.transaction('r', allTables, async () => {
		onProgress('Getting all data from database');

		onProgress('Retrieving posts from database');
		const posts = await db.posts.toArray();

		onProgress('Retrieving favorites from database');
		const favorites = await db.favorites.toArray();

		onProgress('Retrieving saved searches from database');
		const savedSearches = await db.savedSearches.toArray();

		onProgress('Retrieving settings from database');
		const settings = await db.settings.toArray();

		onProgress('Retrieving tags from database');
		const tags = await db.tags.toArray();

		onProgress('Retrieving tag search history from database');
		const tagSearchHistory = await db.tagSearchHistory.toArray();

		onProgress('Retrieving tasks from database');
		const tasks = await db.tasks.toArray();

		onProgress('Converting saved searches previews');
		const newSearches = await blobPreviewsToBase64(savedSearches);
		onProgress('Export finished');

		return { posts, favorites, settings, tags, tagSearchHistory, tasks, savedSearches: newSearches };
	});
};
