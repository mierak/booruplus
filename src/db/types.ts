import { Settings, Sort, SortOrder } from '../store/types';
import { Tag, Rating } from '../types/gelbooruTypes';

export interface Entity {
	id: number;
}

export interface SettingsPair {
	name: string;
	values: Settings;
}

export interface SavedSearchPreview {
	id: number;
	blob: Blob;
}

export interface SavedSearch {
	id?: number;
	tags: Tag[];
	excludedTags: Tag[];
	rating: Rating;
	lastSearched?: string;
	previews: SavedSearchPreview[];
}

export interface FilterOptions {
	blacklisted: boolean;
	nonBlacklisted: boolean;
	offset: number;
	limit: number;
	rating: Rating;
	sort: Sort;
	sortOrder: SortOrder;
	showVideos: boolean;
	showImages: boolean;
	showGifs: boolean;
	showFavorites: boolean;
}

export interface FavoritesTreeNode {
	title: string;
	key?: number;
	parentKey: number;
	childrenKeys: number[];
	postIds: number[];
}

export interface Counts {
	[key: string]: number;
}
