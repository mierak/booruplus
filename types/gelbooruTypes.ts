export interface Entity {
	id: number;
}

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

// export class Post implements Entity {
// 	readonly source: string;
// 	readonly directory: string;
// 	readonly hash: string;
// 	readonly height: number;
// 	readonly width: number;
// 	readonly id: number;
// 	readonly owner: string;
// 	readonly parentId: number;
// 	readonly rating: string;
// 	readonly sample: boolean;
// 	readonly sampleHeight: number;
// 	readonly sampleWidth: number;
// 	readonly score: number;
// 	readonly tags: string[];
// 	readonly fileUrl: string;
// 	readonly createdAt: string;
// 	readonly image: string;
// 	favorite: 0 | 1;
// 	blacklisted: 0 | 1;
// 	downloaded: 0 | 1;
// 	selected: boolean;

// 	constructor(params: PostDto) {
// this.source = params.source;
// this.directory = params.directory;
// this.hash = params.hash;
// this.height = params.height;
// this.width = params.width;
// this.id = params.id;
// this.owner = params.owner;
// this.parentId = params.parent_id;
// this.rating = params.rating;
// this.sample = params.sample;
// this.sampleHeight = params.sample_height;
// this.sampleWidth = params.sample_width;
// this.score = params.score;
// this.fileUrl = params.file_url;
// this.createdAt = params.created_at;
// this.image = params.image;
// this.favorite = params.favorite !== undefined ? params.favorite : 0;
// this.blacklisted = params.blacklisted !== undefined ? params.blacklisted : 0;
// this.downloaded = params.downloaded !== undefined ? params.downloaded : 0;
// this.selected = false;

// 		this.tags = params.tags.split(' ');

// 		// const str = JSON.stringify(this);
// 		// const deser = JSON.parse(str);
// 		// console.log(deser);
// 		// console.log(this === deser);
// 	}
// }

export interface Post {
	source: string;
	directory: string;
	hash: string;
	height: number;
	width: number;
	id: number;
	owner: string;
	parentId: number;
	rating: string;
	sample: boolean;
	sampleHeight: number;
	sampleWidth: number;
	score: number;
	tags: string[];
	fileUrl: string;
	createdAt: string;
	image: string;
	favorite?: 0 | 1;
	blacklisted?: 0 | 1;
	downloaded?: 0 | 1;
	selected: boolean;
}

export const parsePost = (params: PostDto): Post => {
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
		createdAt: params.created_at,
		image: params.image,
		favorite: params.favorite !== undefined ? params.favorite : 0,
		blacklisted: params.blacklisted !== undefined ? params.blacklisted : 0,
		downloaded: params.downloaded !== undefined ? params.downloaded : 0,
		selected: false,
		tags: params.tags.split(' ')
	};
	return post;
};

export type TagType = 'copyright' | 'tag' | 'artist' | 'metadata' | 'character';

export type Rating = 'any' | 'safe' | 'questionable' | 'explicit';

export interface Tag extends Entity {
	id: number;
	tag: string;
	count: number;
	type: TagType;
	ambiguous: number;
}

export type SavedSearchType = 'online' | 'offline';

export interface SavedSearch {
	id?: number;
	tags: Tag[];
	type: SavedSearchType;
	rating: Rating;
	lastSearched?: string;
}
