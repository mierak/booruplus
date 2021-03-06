import type { Entity } from '@db/types';
import type { Sort, SortOrder } from '@store/types';

export type PostDto = {
	source: string;
	directory: string;
	hash: string;
	height: number;
	width: number;
	id: number;
	owner: string;
	parent_id: number;
	rating: string;
	sample: boolean;
	sample_height: number;
	sample_width: number;
	score: number;
	tags: string;
	file_url: string;
	created_at: string;
	image: string;
	favorite?: 0 | 1;
	blacklisted?: 0 | 1;
	downloaded?: 0 | 1;
}

export type Post = {
	source: string;
	directory: string;
	hash: string;
	height: number;
	width: number;
	owner: string;
	parentId: number | null;
	rating: string;
	sample: boolean;
	sampleHeight: number;
	sampleWidth: number;
	score: number;
	tags: string[];
	fileUrl: string;
	createdAt: number;
	image: string;
	blacklisted?: 0 | 1;
	downloaded?: 0 | 1;
	downloadedAt?: number;
	selected: boolean;
	extension: string;
	viewCount: number;
} & Entity;

export type TagType = 'copyright' | 'tag' | 'artist' | 'metadata' | 'character';

export type Rating = 'any' | 'safe' | 'questionable' | 'explicit';

export type Tag = {
	id: number;
	tag: string;
	count: number;
	type: TagType;
	ambiguous: number;
	favoriteCount?: number;
	blacklistedCount?: number;
	downloadedCount?: number;
} & Entity;

export type SavedSearchType = 'online' | 'offline';

export type SavedSearchPreview = {
	id: number;
	objectUrl: string;
	postId: number;
}

export type SavedSearch = {
	id: number;
	tags: Tag[];
	excludedTags: Tag[];
	rating: Rating;
	lastSearched?: number;
	previews: SavedSearchPreview[];
}

export type PostTag = {
	id?: number;
	postId: number;
	tag: string;
	post: Post;
}

export type PostSearchOptions = {
	limit?: number;
	rating?: Rating;
	page?: number;
	apiKey?: string;
	sort?: Sort;
	sortOrder?: SortOrder;
}

export type ReleaseResponse = {
	assets: { browser_download_url: string }[];
	tag_name: string;
	body: string;
}