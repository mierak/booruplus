import { Settings, Sort, SortOrder, Task } from '@store/types';
import { Tag, Rating, Post } from '@appTypes/gelbooruTypes';

export type Entity = {
	id: number;
}

export type SettingsPair = {
	name: string;
	values: Settings;
}

export type SavedSearchPreview = {
	id: number;
	blob: Blob;
	post: Post;
}

export type SavedSearch = {
	id?: number;
	tags: Tag[];
	excludedTags: Tag[];
	rating: Rating;
	lastSearched?: number;
	previews: SavedSearchPreview[];
}

export type SavedSearchWithB64Previews = {
	id?: number;
	tags: Tag[];
	excludedTags: Tag[];
	rating: Rating;
	lastSearched?: number;
	previews: {
		id: number;
		data: string;
		post: Post;
	}[];
}

export type FilterOptions = {
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

export type FavoritesTreeNode = {
	title: string;
	key?: number;
	parentKey: number;
	childrenKeys: number[];
	postIds: number[];
}

export type Counts = {
	[key: string]: number;
}

export type ExportedRawData = {
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

export type ExportedData = {
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
