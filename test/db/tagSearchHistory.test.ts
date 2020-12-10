import Dexie from 'dexie';
Dexie.dependencies.indexedDB = require('fake-indexeddb');
Dexie.dependencies.IDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');
import { mTag } from '../helpers/test.helper';
import db from '../../src/db/database';
import { saveSearch, getMostSearched } from '../../src/db/tagSearchHistory';

describe('db/tagSearchHistory', () => {
	beforeEach(async () => {
		await db.tagSearchHistory.clear();
	});
	describe('saveSearch()', () => {
		it('Calls bulkPut with all tags', async () => {
			// given
			const tags = [mTag({ tag: 'tag1' }), mTag({ tag: 'tag2' }), mTag({ tag: 'tag3' })];
			const put = jest.spyOn(db.tagSearchHistory, 'bulkPut');

			// when
			await saveSearch(tags);

			// then
			expect(put).toBeCalledWith(tags.map(tag => ({tag, date: expect.stringMatching('')})));
		});
	});
	describe('getMostSearched()', () => {
		it('Returns correct result', async () => {
			// given
			const tag1 = mTag({ tag: 'tag1' });
			const tag2 = mTag({ tag: 'tag2' });
			const tag3 = mTag({ tag: 'tag3' });
			for (let i = 0; i < 10; i++) {
				saveSearch([tag1, tag2, tag3]);
			}
			for (let i = 0; i < 5; i++) {
				saveSearch([tag1, tag2]);
			}
			for (let i = 0; i < 2; i++) {
				saveSearch([tag1]);
			}

			// when
			const result = await getMostSearched();

			// then
			expect(result[0]).toMatchObject({ tag: tag1, count: 17 });
			expect(result[1]).toMatchObject({ tag: tag2, count: 15 });
			expect(result[2]).toMatchObject({ tag: tag3, count: 10 });
		});
	});
});
