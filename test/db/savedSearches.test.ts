import Dexie from 'dexie';
Dexie.dependencies.indexedDB = require('fake-indexeddb');
Dexie.dependencies.IDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');

import db from '../../src/db/database';
import { save, remove, addPreviews, removePreview, getAll, createAndSave } from '../../src/db/savedSearches';
import { mSavedSearch, mSavedSearchPreview, mTag, mPost } from '../helpers/test.helper';
import { SavedSearch as DbSavedSearch, SavedSearchPreview as DbSavedSearchPreview } from '../../src/db/types';

describe('db/savedSearches', () => {
	beforeEach(async () => {
		await db.savedSearches.clear();
		jest.clearAllMocks();
	});
	describe('getAll()', () => {
		it('Checks if search with given id already exists', async () => {
			// given
			const savedSearch = mSavedSearch({ id: 123 });
			const getSpy = jest.spyOn(db.savedSearches, 'get');

			// when
			await save(savedSearch);

			// then
			expect(getSpy).toBeCalledWith(123);
		});
	});
	it('Pushes previews to search before resaving if search with the same id was found in db', async () => {
		// given
		const savedSearch = mSavedSearch({
			id: 123,
			previews: [mSavedSearchPreview({ id: 1 }), mSavedSearchPreview({ id: 2 })],
		});
		const getSpy = jest.spyOn(db.savedSearches, 'get');
		const putSpy = jest.spyOn(db.savedSearches, 'put');
		getSpy.mockResolvedValueOnce(savedSearch);

		// when
		await save(savedSearch);

		// then
		expect(putSpy).toBeCalledWith(savedSearch);
	});
	describe('remove()', () => {
		it('Calls delete if savedSearch has id', async () => {
			// given
			const deleteSpy = jest.spyOn(db.savedSearches, 'delete');
			const savedSearch = mSavedSearch({ id: 12345 });

			// when
			await remove(savedSearch);

			// then
			expect(deleteSpy).toBeCalledWith(savedSearch.id);
		});
	});
	describe('addPreviews()', () => {
		it('Checks if search is in db and throws when it is not found', async () => {
			// given
			const posts = [mPost({ id: 123 }), mPost({ id: 456 }), mPost({ id: 789 })];
			const getSpy = jest.spyOn(db.savedSearches, 'get');
			const blob = new Blob(['asdf']);
			const savedSearch = mSavedSearch({ id: 12345 });
			getSpy.mockResolvedValueOnce(undefined);

			// when
			const shouldThrow = async (): Promise<void> => {
				await addPreviews(
					savedSearch.id,
					posts.map((post) => ({ postId: post.id, blob }))
				);
			};

			// then
			await expect(shouldThrow()).rejects.toThrowError(`SavedSearch with id ${savedSearch.id} was not found in database`);
			expect(getSpy).toBeCalledWith(savedSearch.id);
		});
		it('Adds blob to previews array and calls save()', async () => {
			// given
			const post = mPost({ id: 789456 });
			const post2 = mPost({ id: 456789 });
			const getSpy = jest.spyOn(db.savedSearches, 'get');
			const putSpy = jest.spyOn(db.savedSearches, 'put');
			const blob = new Blob(['asdf']);
			const savedSearch = mSavedSearch({ id: 12345 });
			await save(savedSearch);
			const dbSavedSearch: DbSavedSearch = {
				...savedSearch,
				previews: [
					{
						id: 5,
						blob,
						postId: post.id,
					},
				],
			};
			getSpy.mockResolvedValue(dbSavedSearch);
			putSpy.mockImplementation();

			// when
			await addPreviews(savedSearch.id, [
				{ blob, postId: post.id },
				{ blob, postId: post2.id },
			]);

			// then
			expect(putSpy).toBeCalledWith({
				...savedSearch,
				previews: [
					{ id: 5, blob, postId: post.id },
					{ id: 6, blob, postId: post.id },
					{ id: 7, blob, postId: post2.id },
				],
			});
			getSpy.mockClear();
			putSpy.mockClear();
		});
		it('Adds preview with id 0 if savedSearch has no previews yet', async () => {
			// given
			const post = mPost();
			const getSpy = jest.spyOn(db.savedSearches, 'get');
			const putSpy = jest.spyOn(db.savedSearches, 'put');
			const blob = new Blob(['asdf']);
			const savedSearch = mSavedSearch({ id: 12345 });
			await save(savedSearch);
			const dbSavedSearch: DbSavedSearch = {
				...savedSearch,
				previews: [],
			};
			getSpy.mockResolvedValue(dbSavedSearch);
			putSpy.mockImplementation();

			// when
			await addPreviews(savedSearch.id, [{ blob, postId: post.id }]);

			// then
			expect(putSpy).toBeCalledWith({
				...savedSearch,
				previews: [{ id: 0, blob, postId: post.id }],
			});
			getSpy.mockClear();
			putSpy.mockClear();
		});
	});
	describe('removePreview()', () => {
		it('Throws if SavedSearch is not found in Db', async () => {
			// given
			const getSpy = jest.spyOn(db.savedSearches, 'get');
			const savedSearch = mSavedSearch({ id: 12345 });
			const previewId = 123;
			getSpy.mockResolvedValueOnce(undefined);

			// when
			const shouldThrow = async (): Promise<void> => {
				await removePreview(savedSearch, previewId);
			};

			// then
			await expect(shouldThrow()).rejects.toThrowError(`SavedSearch with id ${previewId} was not found in database`);
			expect(getSpy).toBeCalledWith(savedSearch.id);
			getSpy.mockClear();
		});
		it('Removes preview saved search and calls put', async () => {
			// given
			const post = mPost();
			const getSpy = jest.spyOn(db.savedSearches, 'get');
			const putSpy = jest.spyOn(db.savedSearches, 'put');
			const savedSearch = mSavedSearch({ id: 12345 });
			const previewId = 1;
			const blob = new Blob(['asdf']);
			const previews = [
				{
					id: 0,
					blob,
					postId: post.id,
				},
				{
					id: 1,
					blob,
					postId: post.id,
				},
				{
					id: 2,
					blob,
					postId: post.id,
				},
			];
			const dbSavedSearch: DbSavedSearch = {
				...savedSearch,
				previews,
			};
			getSpy.mockResolvedValueOnce(dbSavedSearch);
			putSpy.mockImplementation();

			// when
			await removePreview(savedSearch, previewId);

			// then
			expect(putSpy).toBeCalledWith({ ...dbSavedSearch, previews: [previews[0], previews[2]] });
			getSpy.mockClear();
			putSpy.mockClear();
		});
	});
	describe('getAll()', () => {
		it('Creates obejctURL for every preview', async () => {
			// given
			window.URL.createObjectURL = jest.fn().mockReturnValue('asdf');
			const post = mPost();
			const getSpy = jest.spyOn(db.savedSearches, 'toArray');
			const blob1 = new Blob(['asdf1']);
			const blob2 = new Blob(['asdf2']);
			const blob3 = new Blob(['asdf3']);
			const previews: DbSavedSearchPreview[] = [
				{
					id: 1,
					blob: blob1,
					postId: post.id,
				},
				{
					id: 2,
					blob: blob2,
					postId: post.id,
				},
				{
					id: 3,
					blob: blob3,
					postId: post.id,
				},
			];
			const dbSavedSearches: DbSavedSearch[] = [{ ...mSavedSearch({ id: 1 }), previews }];
			getSpy.mockResolvedValueOnce(dbSavedSearches);

			// when
			const result = await getAll();

			// then
			// eslint-disable-next-line @typescript-eslint/unbound-method
			expect(window.URL.createObjectURL).toBeCalledWith(blob1);
			// eslint-disable-next-line @typescript-eslint/unbound-method
			expect(window.URL.createObjectURL).toBeCalledWith(blob1);
			// eslint-disable-next-line @typescript-eslint/unbound-method
			expect(window.URL.createObjectURL).toBeCalledWith(blob1);
			expect(result).toMatchObject([
				{
					...dbSavedSearches[0],
					previews: [
						{
							id: 1,
							objectUrl: 'asdf',
						},
						{
							id: 2,
							objectUrl: 'asdf',
						},
						{
							id: 3,
							objectUrl: 'asdf',
						},
					],
				},
			]);
		});
	});
	describe('createAndSave()', () => {
		it('Checks if search already exists else saves search', async () => {
			// given
			const getAllSpy = jest.spyOn(db.savedSearches, 'toArray');
			const putSpy = jest.spyOn(db.savedSearches, 'put');
			const tags = [mTag({ tag: 'tag1' }), mTag({ tag: 'tag2' })];
			const excludedTags = [mTag({ tag: 'tag3' }), mTag({ tag: 'tag4' })];
			const savedSearches: DbSavedSearch[] = [
				{
					...mSavedSearch({
						id: 1,
						tags,
						excludedTags,
					}),
					previews: [],
				},
				{
					...mSavedSearch({
						id: 1,
						tags: tags,
						excludedTags: [],
					}),
					previews: [],
				},
				{
					...mSavedSearch({
						id: 1,
						tags: [mTag({ tag: 'tag9' }), mTag({ tag: 'tag10' })],
						excludedTags: [mTag({ tag: 'tag11' }), mTag({ tag: 'tag12' })],
					}),
					previews: [],
				},
			];
			getAllSpy.mockResolvedValue(savedSearches);
			putSpy.mockResolvedValue(123);

			// when
			const result1 = await createAndSave('explicit', tags, excludedTags);
			const result2 = await createAndSave('explicit', tags, []);
			const result3 = await createAndSave('explicit', tags, [mTag({ tag: 'tag123' })]);

			// then
			expect(result1).toMatchObject(savedSearches[0]);
			expect(result2).toMatchObject(savedSearches[1]);
			expect(result3).toBe(123);
			putSpy.mockClear();
			getAllSpy.mockClear();
		});
	});
});
