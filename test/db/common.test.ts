import Dexie from 'dexie';
Dexie.dependencies.indexedDB = require('fake-indexeddb');
Dexie.dependencies.IDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');
import db from '../../src/db/database';
import { mFavoritesTreeNode, mPost, mTag, mSettings, mTask, mTagHistory } from '../helpers/test.helper';
import * as common from '../../src/db/common';
import { SavedSearchWithB64Previews, SavedSearch, ExportedRawData, ExportedData } from '../../src/db/types';
import 'jest-fetch-mock';
import { enableFetchMocks } from 'jest-fetch-mock';
import { blobToBase64 } from '../../src/util/utils';

jest.mock('../../src/util/utils');

enableFetchMocks();

describe('db/common', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});
	const mcIcon =
		'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACU0lEQVQ4T6XTTUjTARjH8e//v/3dq3txL06bL0NBnQaa7hBWEghG1DWIiCiKIOgiWccOeYmoc3UoOnQROtShkKwIDCOVRR00X3K6Ia3Nt73999/cFkITK7WDDzzH58MDz+8R2GMJe5ynCIgHT1X1JhqFOxpF2tU0l1lJjYf7RgaC94B8ETAcvrk/UVHnoqG+ESWWY+jLO0KGIMYSPQcqvaxnc9g0DkyKhZGxYT72TxmBZBEo77hR96NPbOWqe5Czb1rQX/NhfjTB2oUmHvgfc7ntPKqnS+TO2Hj1/CVjt2ddQLgIVPf4HPOnuzq57hniyoc2JEnNVDBCdf9RoreGeXZimmOvO3FrUkTPVfDw+EANsFAEanp8jkBXk5ecZESl1bOyGEAQ1dhNOhLpLDaTDkXJEE+v82n2G4OjkVpg/g/gYvcR0kgsp7KsRSOIooin0sroZIjacivOMiMTgZ87Ayd9HahFSKazFBCYDkUw6bVYSnXoNSXEUjKyksUfmNl+A4/dTZXDzHJcJilnkNQqNJKIxahHEAXkdAZvrZMnb4e3Bw41eulocDMTWiKXz+O0Gnn/NUh7vQun1YB/ahGnVcuLUf8OQFMzDrMem0lPLKmwHEsSlvbhkmQMhQQL4RirSZnv0dA/QHV3u/1zV3OLVcnksFkM2Eu1yJl15sIx0ukMtlItqwkZQVThD0ytDI1HW7eesbyhxnipyqbtVakE625ZzuUL8VAkfXdyIXF/a5AMwMZdPYAJNn/kb6sAxIG5370ZZRHQARv51vwHUIAEIG880y8f+fER+U0OZwAAAABJRU5ErkJggg==';

	const rawData: ExportedRawData = {
		favorites: [mFavoritesTreeNode()],
		posts: [mPost()],
		settings: [{ name: 'name', values: mSettings() }],
		tagSearchHistory: [mTagHistory()],
		tags: [mTag()],
		tasks: [mTask()],
		savedSearches: [],
	};
	const data: ExportedData = {
		favorites: [mFavoritesTreeNode()],
		posts: [mPost()],
		settings: [{ name: 'name', values: mSettings() }],
		tagSearchHistory: [mTagHistory()],
		tags: [mTag()],
		tasks: [mTask()],
		savedSearches: [],
	};
	describe('base64PreviewsToBlobs()', () => {
		it('Returns correct result', async () => {
			// given
			const post = mPost();
			const ss: SavedSearchWithB64Previews[] = [
				{
					id: 1,
					excludedTags: [],
					tags: [mTag({ tag: 'tag1' })],
					rating: 'any',
					lastSearched: 123456,
					previews: [
						{
							id: 1,
							data: mcIcon,
							post,
						},
					],
				},
				{
					id: 2,
					excludedTags: [],
					tags: [mTag({ tag: 'tag2' })],
					rating: 'any',
					lastSearched: 123456,
					previews: [
						{
							id: 1,
							data: mcIcon,
							post,
						},
					],
				},
			];

			// when
			const result = await common.base64PreviewsToBlobs(ss);

			// then
			expect(result[0].previews).toHaveLength(1);
			expect(result[1].previews).toHaveLength(1);
			expect(fetch).toBeCalledWith(mcIcon);
			expect(fetch).toBeCalledTimes(2);
		});
	});
	describe('blobPreviewsToBase64()', () => {
		it('Returns correct result', async () => {
			const blob = new Blob(['asdf']);
			const post = mPost();
			const ss: SavedSearch[] = [
				{
					id: 1,
					rating: 'any',
					lastSearched: 123456,
					tags: [mTag({ tag: 'tag1' })],
					excludedTags: [],
					previews: [
						{ id: 1, blob, post },
						{ id: 2, blob, post },
					],
				},
				{
					id: 2,
					rating: 'any',
					lastSearched: 123456,
					tags: [mTag({ tag: 'tag2' })],
					excludedTags: [],
					previews: [
						{ id: 1, blob, post },
						{ id: 2, blob, post },
					],
				},
			];

			// when
			common.blobPreviewsToBase64(ss);

			// then
			expect(blobToBase64).toBeCalledTimes(4);
			expect(blobToBase64).toBeCalledWith(blob);
		});
	});
	describe('clearDb()', () => {
		it('Calls onProgress 8 times and clear for all tables', async () => {
			// given
			const onProgress = jest.fn();
			const favoritesSpy = jest.spyOn(db.favorites, 'clear').mockImplementation();
			const postsSpy = jest.spyOn(db.posts, 'clear').mockImplementation();
			const settingsSpy = jest.spyOn(db.settings, 'clear').mockImplementation();
			const tagsSpy = jest.spyOn(db.tags, 'clear').mockImplementation();
			const tagSearchHistorySpy = jest.spyOn(db.tagSearchHistory, 'clear').mockImplementation();
			const tasksSpy = jest.spyOn(db.tasks, 'clear').mockImplementation();
			const savedSearchesSpy = jest.spyOn(db.savedSearches, 'clear').mockImplementation();

			// when
			await common.clearDb(onProgress);

			// then
			expect(onProgress).toBeCalledTimes(9);
			expect(favoritesSpy).toBeCalledTimes(1);
			expect(postsSpy).toBeCalledTimes(1);
			expect(settingsSpy).toBeCalledTimes(1);
			expect(tagsSpy).toBeCalledTimes(1);
			expect(tagSearchHistorySpy).toBeCalledTimes(1);
			expect(tasksSpy).toBeCalledTimes(1);
			expect(savedSearchesSpy).toBeCalledTimes(1);
		});
	});
	describe('restoreDb()', () => {
		it('Calls onProgress 8 times and clear for all tables', async () => {
			// given
			const onProgress = jest.fn();
			const favoritesSpy = jest.spyOn(db.favorites, 'bulkPut').mockImplementation();
			const postsSpy = jest.spyOn(db.posts, 'bulkPut').mockImplementation();
			const settingsSpy = jest.spyOn(db.settings, 'bulkPut').mockImplementation();
			const tagsSpy = jest.spyOn(db.tags, 'bulkPut').mockImplementation();
			const tagSearchHistorySpy = jest.spyOn(db.tagSearchHistory, 'bulkPut').mockImplementation();
			const tasksSpy = jest.spyOn(db.tasks, 'bulkPut').mockImplementation();
			const savedSearchesSpy = jest.spyOn(db.savedSearches, 'bulkPut').mockImplementation();

			// when
			await common.restoreDb(rawData, onProgress);

			// then
			expect(onProgress).toBeCalledTimes(9);
			expect(favoritesSpy).toBeCalledWith(rawData.favorites);
			expect(postsSpy).toBeCalledWith(rawData.posts);
			expect(settingsSpy).toBeCalledWith(rawData.settings);
			expect(tagsSpy).toBeCalledWith(rawData.tags);
			expect(tagSearchHistorySpy).toBeCalledWith(rawData.tagSearchHistory);
			expect(tasksSpy).toBeCalledWith(rawData.tasks);
			expect(savedSearchesSpy).toBeCalledTimes(1);
		});
	});
	describe('exportDb()', () => {
		it('Calls onProgress 8 times and toArray for all tables', async () => {
			// given
			const onProgress = jest.fn();
			const favoritesSpy = jest.spyOn(db.favorites, 'toArray').mockResolvedValue(rawData.favorites);
			const postsSpy = jest.spyOn(db.posts, 'toArray').mockResolvedValue(rawData.posts);
			const settingsSpy = jest.spyOn(db.settings, 'toArray').mockResolvedValue(rawData.settings);
			const tagsSpy = jest.spyOn(db.tags, 'toArray').mockResolvedValue(rawData.tags);
			const tagSearchHistorySpy = jest.spyOn(db.tagSearchHistory, 'toArray').mockResolvedValue(rawData.tagSearchHistory);
			const tasksSpy = jest.spyOn(db.tasks, 'toArray').mockResolvedValue(rawData.tasks);
			const savedSearchesSpy = jest.spyOn(db.savedSearches, 'toArray').mockResolvedValue(rawData.savedSearches);

			// when
			const result = await common.exportDb(onProgress);

			// then
			expect(onProgress).toBeCalledTimes(10);
			expect(favoritesSpy).toBeCalledTimes(1);
			expect(postsSpy).toBeCalledTimes(1);
			expect(settingsSpy).toBeCalledTimes(1);
			expect(tagsSpy).toBeCalledTimes(1);
			expect(tagSearchHistorySpy).toBeCalledTimes(1);
			expect(tasksSpy).toBeCalledTimes(1);
			expect(savedSearchesSpy).toBeCalledTimes(1);
			expect(result).toMatchObject({
				posts: rawData.posts,
				favorites: rawData.favorites,
				settings: rawData.settings,
				tagSearchHistory: rawData.tagSearchHistory,
				tags: rawData.tags,
				tasks: rawData.tasks,
				savedSearches: rawData.savedSearches,
			});
		});
	});
	describe('clearAndRestoreDb()', () => {
		it('Calls correct functions', async () => {
			// given
			const clearSpy = jest.spyOn(common, 'clearDb').mockImplementationOnce(() => Promise.resolve(1));
			const restoreSpy = jest.spyOn(common, 'restoreDb').mockImplementationOnce(() => Promise.resolve(1));
			const onProgress = jest.fn();

			// when
			await common.clearAndRestoreDb(data, onProgress);

			// then
			expect(clearSpy).toBeCalledTimes(1);
			expect(restoreSpy).toBeCalledTimes(1);
		});
	});
});
