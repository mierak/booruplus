import { mocked } from 'ts-jest/utils';
import Dexie from 'dexie';
Dexie.dependencies.indexedDB = require('fake-indexeddb');
Dexie.dependencies.IDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');

import db from '../../src/db/database';

const posts = mocked(db.posts, true);
const favorites = mocked(db.favorites, true);
const savedSearches = mocked(db.savedSearches, true);
const settings = mocked(db.settings, true);
const tags = mocked(db.tags, true);
const tagSearchHistory = mocked(db.tagSearchHistory, true);
const tasks = mocked(db.tasks, true);

// jest.spyOn(db.posts, 'schema');

export const mockedDexie = {
	posts,
	favorites,
	savedSearches,
	settings,
	tags,
	tagSearchHistory,
	tasks,
};

export const doDexieMock = (): typeof jest => {
	return jest.mock('../../src/db/database', () => {
		return {
			__esModule: true,
			...mockedDexie,
		};
	});
};
