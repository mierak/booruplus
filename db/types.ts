import { Settings } from '../store/types';

export interface Entity {
	id: number;
}

export interface SettingsPair {
	name: string;
	values: Settings;
}
