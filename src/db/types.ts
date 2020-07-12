import { Settings, Sort, SortOrder, Task } from '../store/types';
import { Tag, Rating, Post } from '../types/gelbooruTypes';

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

export interface SavedSearchWithB64Previews {
	id?: number;
	tags: Tag[];
	excludedTags: Tag[];
	rating: Rating;
	lastSearched?: string;
	previews: {
		id: number;
		data: string;
	}[];
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

export interface ExportedRawData {
	posts: Post[];
	favorites: FavoritesTreeNode[];
	settings: SettingsPair[];
	tags: Tag[];
	tagSearchHistory: {
		tag: Tag;
		date: string;
	}[];
	tasks: Task[];
	savedSearches: SavedSearch[];
}

export interface ExportedData {
	posts: Post[];
	favorites: FavoritesTreeNode[];
	settings: SettingsPair[];
	tags: Tag[];
	tagSearchHistory: {
		tag: Tag;
		date: string;
	}[];
	tasks: Task[];
	savedSearches: SavedSearchWithB64Previews[];
}
