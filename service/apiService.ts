import { Post, PostDto, Tag, postParser, PostSearchOptions } from '../types/gelbooruTypes';
import { delay, escapeTag } from '../util/utils';

const BASE_URL = 'https://gelbooru.com/index.php?page=dapi&q=index&json=1';
const BASE_TAG_URL = `${BASE_URL}&s=tag`;
const BASE_POST_URL = `${BASE_URL}&s=post`;

const parsePost = postParser();

export const getPostsForTags = async (tags: string[], options: PostSearchOptions = {}, excludedTags?: string[]): Promise<Post[]> => {
	//handle Optional params
	if (!options.limit) options.limit = 100;
	if (options.rating && options.rating !== 'any') tags.push(`rating:${options.rating}`);

	//construct API URL
	let url = `${BASE_POST_URL}`;
	options.apiKey && (url = url.concat(options.apiKey));
	url = url.concat(`&limit=${options.limit}`);
	tags.length > 0 && (url = url.concat(`&tags=${tags.join(' ')}`));

	if (excludedTags && excludedTags.length > 0) url += ` -${excludedTags.join(' -')}`;
	if (options.page) url += `&pid=${options.page}`;

	try {
		const response = await fetch(url);
		const responsePosts: PostDto[] = await response.json();
		const posts = responsePosts.map((postDto) => parsePost(postDto));
		return posts;
	} catch (err) {
		console.error('Error while fetching posts from api', err);
		return [];
	}
};

export const getPostById = async (id: number, apiKey?: string): Promise<Post | undefined> => {
	try {
		const response = await fetch(`${BASE_POST_URL}${apiKey}&id=${id}`);
		const post: Post = await response.json();
		return post;
	} catch (err) {
		console.error(err);
		return undefined;
	}
};

export const getTags = async (page = 0, apiKey?: string): Promise<Tag[]> => {
	try {
		const response = await fetch(`${BASE_TAG_URL}${apiKey}&pid=${page}`);
		const tags: Tag[] = await response.json();
		return tags;
	} catch (err) {
		console.error(err);
		return [];
	}
};

export const getTagById = async (id: number, apiKey?: string): Promise<Tag | undefined> => {
	try {
		const response = await fetch(`${BASE_TAG_URL}${apiKey}&id=${id}`);
		const tag: Tag = await response.json();
		return tag;
	} catch (err) {
		console.error(err);
		return undefined;
	}
};

export const getTagByName = async (name: string, apiKey?: string): Promise<Tag | undefined> => {
	try {
		const response = await fetch(`${BASE_TAG_URL}${apiKey}&name=${escapeTag(name)}`);
		const tag: Tag = await response.json();
		return tag;
	} catch (err) {
		console.error(err);
		return undefined;
	}
};

export const getTagsByNames = async (names: string[], apiKey?: string): Promise<Tag[]> => {
	try {
		const deduplicatedNames = Array.from(new Set(names));
		const batches: string[][] = [];
		while (deduplicatedNames.length > 0) {
			batches.push(deduplicatedNames.splice(0, 100));
		}

		const tagsFromApi: Tag[][] = [];
		for (const batch of batches) {
			const response = await fetch(`${BASE_TAG_URL}${apiKey}&names=${escapeTag(batch.join(' '))}`);
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

export const getTagsByPattern = async (pattern: string, apiKey?: string): Promise<Tag[]> => {
	try {
		const response = await fetch(`${BASE_TAG_URL}${apiKey}&limit=30&name_pattern=%${escapeTag(pattern)}%`);
		const tags: Tag[] = await response.json();
		return tags;
	} catch (err) {
		console.error(err);
		return [];
	}
};
