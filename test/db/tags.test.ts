import Dexie from 'dexie';
Dexie.dependencies.indexedDB = require('fake-indexeddb');
Dexie.dependencies.IDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');
import db from '../../src/db/database';
import { mTag, mPost } from '../helpers/test.helper';
import {
	save,
	saveBulk,
	getAll,
	checkIfExists,
	getTag,
	getCount,
	getDownloadedCount,
	getBlacklistedCount,
	getByPattern,
	getAllWithLimitAndOffset,
} from '../../src/db/tags';

describe('tags/db', () => {
	beforeEach(async () => {
		await db.tags.clear();
		await db.posts.clear();
	});
	describe('save()', () => {
		it('Calls put()', async () => {
			// given
			const tag = mTag({ id: 12345 });
			const putSpy = jest.spyOn(db.tags, 'put');

			// when
			await save(tag);

			// then
			expect(putSpy).toBeCalledWith(tag);
			putSpy.mockClear();
		});
	});
	describe('saveBulk()', () => {
		it('Calls bulkPut()', async () => {
			// given
			const tags = [mTag({ tag: 'tag1' }), mTag({ tag: 'tag2' }), mTag({ tag: 'tag3' })];
			const putSpy = jest.spyOn(db.tags, 'bulkPut');

			// when
			await saveBulk(tags);

			// then
			expect(putSpy).toBeCalledWith(tags);
			putSpy.mockClear();
		});
	});
	describe('getAll()', () => {
		it('Calls toArray()', async () => {
			// given
			const tags = [mTag({ tag: 'tag1' }), mTag({ tag: 'tag2' }), mTag({ tag: 'tag3' })];
			const getSpy = jest.spyOn(db.tags, 'toArray');
			getSpy.mockResolvedValueOnce(tags);

			// when
			const result = await getAll();

			// then
			expect(getSpy).toBeCalledTimes(1);
			expect(result).toMatchObject(tags);
			getSpy.mockClear();
		});
	});
	describe('checkIfExists()', () => {
		it('Returns true if found', async () => {
			// given
			const tag = mTag({ tag: 'tag123' });
			await db.tags.put(tag);
			const getSpy = jest.spyOn(db.tags, 'where');

			// when
			const result = await checkIfExists(tag.tag);

			// then
			expect(getSpy).toBeCalledTimes(1);
			expect(result).toBe(true);
			getSpy.mockClear();
		});
		it('Returns false if not found', async () => {
			// given
			const tag = mTag({ tag: 'tag123' });
			const getSpy = jest.spyOn(db.tags, 'where');

			// when
			const result = await checkIfExists(tag.tag);

			// then
			expect(getSpy).toBeCalledTimes(1);
			expect(result).toBe(false);
			getSpy.mockClear();
		});
	});
	describe('getTag()', () => {
		it('Returns tag if it is found in DB', async () => {
			// given
			const tag = mTag({ tag: 'tag123' });
			await db.tags.put(tag);
			const getSpy = jest.spyOn(db.tags, 'where');

			// when
			const result = await getTag(tag.tag);

			// then
			expect(getSpy).toBeCalledWith('tag');
			expect(result).toStrictEqual(tag);
			getSpy.mockClear();
		});
		it('Returns undefined if tag is not found in DB', async () => {
			// given
			const tag = mTag({ tag: 'tag123' });
			const getSpy = jest.spyOn(db.tags, 'where');

			// when
			const result = await getTag(tag.tag);

			// then
			expect(getSpy).toBeCalledWith('tag');
			expect(result).toStrictEqual(undefined);
			getSpy.mockClear();
		});
	});
	describe('getDownloadedCount()', () => {
		it('Returns count of downloaded posts with given tag', async () => {
			// given
			const posts = [
				mPost({ id: 1, downloaded: 1, tags: ['tag1', 'tag2', 'tag3'] }),
				mPost({ id: 2, downloaded: 1, tags: ['tag1', 'tag2', 'tag3'] }),
				mPost({ id: 3, downloaded: 0, tags: ['tag1', 'tag2'] }),
				mPost({ id: 4, downloaded: 0, tags: ['tag1', 'tag2'] }),
				mPost({ id: 5, downloaded: 1, tags: ['tag1'] }),
			];
			await db.posts.bulkPut(posts);

			// when
			const result1 = await getDownloadedCount('tag1');
			const result2 = await getDownloadedCount('tag2');
			const result3 = await getDownloadedCount('tag3');

			// then
			expect(result1).toBe(3);
			expect(result2).toBe(2);
			expect(result3).toBe(2);
		});
	});
	describe('getBlacklistedCount()', () => {
		it('Returns count of blacklisted posts with given tag', async () => {
			// given
			const posts = [
				mPost({ id: 1, blacklisted: 1, tags: ['tag1', 'tag2', 'tag3'] }),
				mPost({ id: 2, blacklisted: 1, tags: ['tag1', 'tag2', 'tag3'] }),
				mPost({ id: 3, blacklisted: 0, tags: ['tag1', 'tag2'] }),
				mPost({ id: 4, blacklisted: 0, tags: ['tag1', 'tag2'] }),
				mPost({ id: 5, blacklisted: 1, tags: ['tag1'] }),
			];
			await db.posts.bulkPut(posts);

			// when
			const result1 = await getBlacklistedCount('tag1');
			const result2 = await getBlacklistedCount('tag2');
			const result3 = await getBlacklistedCount('tag3');

			// then
			expect(result1).toBe(3);
			expect(result2).toBe(2);
			expect(result3).toBe(2);
		});
	});
	describe('getByPattern()', () => {
		it('Gets all tags that include a given string', async () => {
			// given
			const tags = [
				mTag({ id: 1, tag: 'pattern' }),
				mTag({ id: 2, tag: 'testtest' }),
				mTag({ id: 3, tag: 'test' }),
				mTag({ id: 4, tag: 'pattern123' }),
				mTag({ id: 5, tag: 'catlovesfood' }),
				mTag({ id: 6, tag: 'food' }),
				mTag({ id: 7, tag: 'cat' }),
				mTag({ id: 8, tag: 'asdf' }),
			];
			await saveBulk(tags);

			// when
			const result1 = await getByPattern('test');
			const result2 = await getByPattern('cat');

			// then
			expect(result1[0]).toMatchObject(tags[1]);
			expect(result1[1]).toMatchObject(tags[2]);
			expect(result2[0]).toMatchObject(tags[4]);
			expect(result2[1]).toMatchObject(tags[6]);
		});
	});
	describe('getCount()', () => {
		it('Returns count of all tags in db if no options are supplied', async () => {
			// given
			const tags = [
				mTag({ id: 1, tag: 'pattern' }),
				mTag({ id: 2, tag: 'testtest' }),
				mTag({ id: 3, tag: 'test' }),
				mTag({ id: 4, tag: 'pattern123' }),
				mTag({ id: 5, tag: 'catlovesfood' }),
				mTag({ id: 6, tag: 'food' }),
				mTag({ id: 7, tag: 'cat' }),
				mTag({ id: 8, tag: 'asdf' }),
			];
			await saveBulk(tags);

			// when
			const result = await getCount();

			// then
			expect(result).toBe(tags.length);
		});
		it('Returns count of tags with options', async () => {
			// given
			const tags = [
				mTag({ id: 1, type: 'metadata', tag: 'pattern' }),
				mTag({ id: 2, type: 'metadata', tag: 'testtest' }),
				mTag({ id: 3, type: 'metadata', tag: 'test' }),
				mTag({ id: 4, type: 'metadata', tag: 'pattern123' }),
				mTag({ id: 5, type: 'artist', tag: 'catlovesfood' }),
				mTag({ id: 6, type: 'artist', tag: 'food' }),
				mTag({ id: 7, type: 'character', tag: 'cat' }),
				mTag({ id: 8, type: 'character', tag: 'asdf' }),
			];
			await saveBulk(tags);

			// when
			const result1 = await getCount({ types: ['artist', 'character'] });
			const result2 = await getCount({ types: ['artist', 'character'], pattern: 'foo' });

			// then
			expect(result1).toBe(4);
			expect(result2).toBe(2);
		});
	});
	describe('getAllWithLimitAndOffset()', () => {
		it('Filters by all specified options', async () => {
			// given
			const tags = [
				mTag({ id: 1, type: 'metadata', tag: 'pattern' }),
				mTag({ id: 2, type: 'metadata', tag: 'testtest' }),
				mTag({ id: 3, type: 'metadata', tag: 'test' }),
				mTag({ id: 4, type: 'metadata', tag: 'pattern123' }),
				mTag({ id: 5, type: 'artist', tag: 'catlovesfood' }),
				mTag({ id: 6, type: 'artist', tag: 'food' }),
				mTag({ id: 7, type: 'character', tag: 'cat' }),
				mTag({ id: 8, type: 'character', tag: 'asdf' }),
			];
			await saveBulk(tags);

			// when
			const result1 = await getAllWithLimitAndOffset({
				limit: 2,
				offset: 2,
			});
			const result2 = await getAllWithLimitAndOffset();
			const result3 = await getAllWithLimitAndOffset({
				pattern: 'cat',
				limit: 1,
				offset: 0,
				types: ['character'],
			});

			// then
			expect(result1[0]).toMatchObject(tags[2]);
			expect(result1[1]).toMatchObject(tags[3]);
			tags.forEach((tag, index) => {
				expect(result2[index]).toMatchObject(tag);
			});
			expect(result3.length).toBe(1);
			expect(result3[0]).toMatchObject(tags[6]);
		});
	});
});
