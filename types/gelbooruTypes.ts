import { getImageExtensionFromFilename } from '../util/utils';
import { Entity } from '../db/types';
import { Sort, SortOrder } from 'store/types';
import moment from 'moment';

export interface PostDto {
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

export interface Post extends Entity {
	source: string;
	directory: string;
	hash: string;
	height: number;
	width: number;
	owner: string;
	parentId: number;
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
}
export const postParser = (): ((params: PostDto) => Post) => {
	const domParser = new DOMParser();

	const parseTags = (tagString: string): string[] => {
		const array = tagString.split(' ');
		const result = array.map((tag) => {
			const parsed = domParser.parseFromString(tag, 'text/html').documentElement.textContent;
			if (parsed === null || parsed === undefined) throw `Could not parse tag ${tag}`;
			return parsed;
		});
		return result;
	};

	const parsePost = (params: PostDto): Post => {
		const post: Post = {
			source: params.source,
			directory: params.directory,
			hash: params.hash,
			height: params.height,
			width: params.width,
			id: params.id,
			owner: params.owner,
			parentId: params.parent_id,
			rating: params.rating,
			sample: params.sample,
			sampleHeight: params.sample_height,
			sampleWidth: params.sample_width,
			score: params.score,
			fileUrl: params.file_url,
			createdAt: moment(params.created_at).unix(),
			image: params.image,
			blacklisted: params.blacklisted !== undefined ? params.blacklisted : 0,
			downloaded: params.downloaded !== undefined ? params.downloaded : 0,
			selected: false,
			tags: parseTags(params.tags),
			extension: getImageExtensionFromFilename(params.image),
			viewCount: 0,
		};
		return post;
	};

	return parsePost;
};

export type TagType = 'copyright' | 'tag' | 'artist' | 'metadata' | 'character';

export type Rating = 'any' | 'safe' | 'questionable' | 'explicit';

export interface Tag extends Entity {
	id: number;
	tag: string;
	count: number;
	type: TagType;
	ambiguous: number;
	favoriteCount?: number;
	blacklistedCount?: number;
	downloadedCount?: number;
}

export type SavedSearchType = 'online' | 'offline';

export interface SavedSearchPreview {
	id: number;
	objectUrl: string;
}

export interface SavedSearch {
	id: number;
	tags: Tag[];
	excludedTags: Tag[];
	rating: Rating;
	lastSearched?: string;
	previews: SavedSearchPreview[];
}

export interface PostTag {
	id?: number;
	postId: number;
	tag: string;
	post: Post;
}

export interface PostSearchOptions {
	limit?: number;
	rating?: Rating;
	page?: number;
	apiKey?: string;
	sort?: Sort;
	sortOrder?: SortOrder;
}
