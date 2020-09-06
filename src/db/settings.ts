import db from './database';
import { SettingsPair } from './types';

import { Settings } from '@store/types';

export const saveSettings = async (settings: SettingsPair): Promise<string> => {
	return db.settings.put(settings);
};

export const loadSettings = async (name?: string): Promise<Settings | undefined> => {
	const result = await (async (): Promise<SettingsPair | undefined> => {
		if (name) {
			const result = await db.settings.get(name);
			if (result) return result;
		}
		return await db.settings.get('default');
	})();

	return result && result.values;
};
