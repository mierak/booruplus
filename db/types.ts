import { Settings } from '../store/types';
import { Tag, Rating } from '../types/gelbooruTypes';

export interface Entity {
	id: number;
}

export interface SettingsPair {
	name: string;
	values: Settings;
}

export interface SavedSearch {
	id?: number;
	tags: Tag[];
	rating: Rating;
	lastSearched?: string;
	previews: Blob[];
}

export interface FilterOptions {
	blacklisted: boolean;
	nonBlacklisted: boolean;
	offset: number;
	limit: number;
	rating: Rating;
	showVideos: boolean;
	showImages: boolean;
	showGifs: boolean;
	showFavorites: boolean;
}
