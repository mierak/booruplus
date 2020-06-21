import Dexie from 'dexie';
Dexie.dependencies.indexedDB = require('fake-indexeddb');
Dexie.dependencies.IDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');
import { saveSettings, loadSettings } from '../../src/db/settings';
import db from '../../src/db/database';
import { SettingsPair } from '../../src/db/types';
import { mSettings } from '../helpers/test.helper';

describe('db/settings', () => {
	beforeEach(async () => {
		await db.settings.clear();
	});
	describe('saveSettings()', () => {
		it('Calls put with correct settings', async () => {
			// given
			const settingsPair: SettingsPair = {
				name: 'test',
				values: mSettings(),
			};
			const put = jest.spyOn(db.settings, 'put');

			// when
			await saveSettings(settingsPair);

			// then
			expect(put).toBeCalledWith(settingsPair);
		});
	});
	describe('loadSettings()', () => {
		it('Loads settings with given name', async () => {
			// given
			const settingsPair: SettingsPair = {
				name: 'test',
				values: mSettings({ gelbooruUsername: 'test' }),
			};
			db.settings.put(settingsPair);

			// when
			const result = await loadSettings('test');

			// then
			expect(result).toStrictEqual(settingsPair.values);
		});
		it('Loads default settings when no name is supplied', async () => {
			// given
			const settingsPair: SettingsPair = {
				name: 'default',
				values: mSettings({ gelbooruUsername: 'default' }),
			};
			db.settings.put(settingsPair);

			// when
			const result = await loadSettings();

			// then
			expect(result).toStrictEqual(settingsPair.values);
		});
		it('Loads default settings when settings were not found', async () => {
			// given
			const settingsPair: SettingsPair = {
				name: 'default',
				values: mSettings({ gelbooruUsername: 'default' }),
			};
			db.settings.put(settingsPair);

			// when
			const result = await loadSettings('asdftestasdf');

			// then
			expect(result).toStrictEqual(settingsPair.values);
		});
	});
});
