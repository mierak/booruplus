import db from './database';

import type { SettingsPair } from './types';
import type { Settings } from '@store/types';

export const saveSettings = async (settings: SettingsPair): Promise<string> => {
	return db.settings.put(settings);
};

export const loadSettings = async (name?: string): Promise<Settings | undefined> => {
	const result = await (async (): Promise<SettingsPair | undefined> => {
		if (name) {
			const res = await db.settings.get(name);
			if (res) return res;
		}
		return await db.settings.get('default');
	})();

	return result && result.values;
};
