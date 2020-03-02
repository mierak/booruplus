export interface Post {
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
	created_at: Date;
	image: string;
}

export type TagType = 'copyright' | 'tag' | 'artist' | 'metadata' | 'character';

export interface Tag {
	id: number;
	tag: string;
	count: number;
	type: TagType;
	ambiguous: number;
}
