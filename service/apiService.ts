import { Post, PostDto, Tag, Rating, postParser } from '../types/gelbooruTypes';
import { delay, escapeTag } from '../util/utils';

const BASE_URL = 'https://gelbooru.com/index.php?page=dapi&q=index&json=1';
const BASE_TAG_URL = `${BASE_URL}&s=tag`;
const BASE_POST_URL = `${BASE_URL}&s=post`;

const parsePost = postParser();

export interface PostApiOptions {
	limit?: number;
	rating?: Rating;
	page?: number;
}

export const getPostsForTags = async (tags: string[], options: PostApiOptions = {}): Promise<Post[]> => {
	//handle Optional params
	if (!options.limit) options.limit = 100;
	if (options.rating && options.rating !== 'any') tags.push(`rating:${options.rating}`);

	//construct API URL
	let url = `${BASE_POST_URL}&limit=${options.limit}&tags=${tags.join(' ')}`;
	if (options.page) url += `&pid=${options.page}`;

	try {
		const response = await fetch(url);
		const responsePosts: PostDto[] = await response.json();
		const posts = responsePosts.map((postDto) => parsePost(postDto));
		return posts;
	} catch (err) {
		console.error(err);
		return [];
	}
};

export const getPostById = async (id: number): Promise<Post | undefined> => {
	try {
		const response = await fetch(`${BASE_POST_URL}&id=${id}`);
		const post: Post = await response.json();
		return post;
	} catch (err) {
		console.error(err);
		return undefined;
	}
};

export const getTags = async (page = 0): Promise<Tag[]> => {
	try {
		const response = await fetch(`${BASE_TAG_URL}&pid=${page}`);
		const tags: Tag[] = await response.json();
		return tags;
	} catch (err) {
		console.error(err);
		return [];
	}
};

export const getTagById = async (id: number): Promise<Tag | undefined> => {
	try {
		const response = await fetch(`${BASE_TAG_URL}&id=${id}`);
		const tag: Tag = await response.json();
		return tag;
	} catch (err) {
		console.error(err);
		return undefined;
	}
};

export const getTagByName = async (name: string): Promise<Tag | undefined> => {
	try {
		const response = await fetch(`${BASE_TAG_URL}&name=${escapeTag(name)}`);
		const tag: Tag = await response.json();
		return tag;
	} catch (err) {
		console.error(err);
		return undefined;
	}
};

export const getTagsByNames = async (...names: string[]): Promise<Tag[]> => {
	try {
		const deduplicatedNames = Array.from(new Set(names));
		const batches: string[][] = [];
		while (deduplicatedNames.length > 0) {
			batches.push(deduplicatedNames.splice(0, 100));
		}

		const tagsFromApi: Tag[][] = [];
		for (const batch of batches) {
			const response = await fetch(`${BASE_TAG_URL}&names=${escapeTag(batch.join(' '))}`);
			const tags: Tag[] = await response.json();
			tagsFromApi.push(tags);
			await delay(2000);
		}

		return tagsFromApi.flat();
	} catch (err) {
		console.error(err);
		return [];
	}
};

export const getTagsByPattern = async (pattern: string): Promise<Tag[]> => {
	try {
		const response = await fetch(`${BASE_TAG_URL}&name_pattern=${escapeTag(pattern)}&limit=30`);
		const tags: Tag[] = await response.json();
		return tags;
	} catch (err) {
		console.error(err);
		return [];
	}
};
