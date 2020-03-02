import { Post, Tag, Rating } from '../types/gelbooruTypes';
import database from '../db/database';

const BASE_URL = 'https://gelbooru.com/index.php?page=dapi&q=index&json=1';
const BASE_TAG_URL = `${BASE_URL}&s=tag`;
const BASE_POST_URL = `${BASE_URL}&s=post`;

interface Options {
	limit?: number;
	rating?: Rating;
	page?: number;
}

export const getPostsForTags = async (tags: string[], options: Options = {}): Promise<Post[]> => {
	let url = `${BASE_POST_URL}&limit=${options.limit}&tags=${tags.join(' ')}`;
	if (!options.limit) options.limit = 100;
	if (options.rating && options.rating !== 'any') tags.push(`rating:${options.rating}`);
	if (options.page) url += `&pid=${options.page}`;
	try {
		const response = await fetch(url);
		const posts: Post[] = await response.json();
		posts.forEach((post: Post) => {
			database.posts.put(post);
		});
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
		const response = await fetch(`${BASE_TAG_URL}&name=${name}`);
		const tag: Tag = await response.json();
		return tag;
	} catch (err) {
		console.error(err);
		return undefined;
	}
};

export const getTagsByNames = async (...names: string[]): Promise<Tag[]> => {
	//TODO handle 100 tags per request limit
	try {
		const response = await fetch(`${BASE_TAG_URL}&names=${names.join(' ')}`);
		const tags: Tag[] = await response.json();
		return tags;
	} catch (err) {
		console.log(err);
		return [];
	}
};

export const getTagsByPattern = async (pattern: string): Promise<Tag[]> => {
	if (pattern.length <= 3) return [];
	try {
		const response = await fetch(`${BASE_TAG_URL}&name_pattern=${pattern}&limit=5`);
		const tags: Tag[] = await response.json();
		return tags;
	} catch (err) {
		console.error(err);
		return [];
	}
};
