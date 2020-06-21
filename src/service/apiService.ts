import { Post, PostDto, Tag, PostSearchOptions } from '../types/gelbooruTypes';
import { delay, escapeTag, postParser } from '../util/utils';

export const BASE_URL = 'https://gelbooru.com/index.php?page=dapi&q=index&json=1';
export const BASE_TAG_URL = `${BASE_URL}&s=tag`;
export const BASE_POST_URL = `${BASE_URL}&s=post`;

const parsePost = postParser();

export const getSortOptionString = (options: PostSearchOptions): string => {
	if (!options.sort || !options.sortOrder) return '';

	switch (options.sort) {
		case 'date-updated':
			return `sort:updated:${options.sortOrder}`;
		case 'rating':
			return `sort:rating:${options.sortOrder}`;
		default:
			return '';
	}
};

export const getPostsForTags = async (tags: string[], options: PostSearchOptions = {}, excludedTags?: string[]): Promise<Post[]> => {
	//handle Optional params
	if (!options.limit) options.limit = 100;
	if (options.rating && options.rating !== 'any') tags.push(`rating:${options.rating}`);

	//construct API URL
	let url = BASE_POST_URL;
	options.apiKey && (url = url.concat(options.apiKey));
	url = url.concat(`&limit=${options.limit}`);
	if (options.page) url += `&pid=${options.page}`;
	url = url.concat(`&tags=${tags.join(' ')}`);

	if (excludedTags && excludedTags.length > 0) url = url.concat(` -${excludedTags.join(' -')}`);

	if (options.sort && options.sortOrder) url = url.concat(' ' + getSortOptionString(options));

	const response = await fetch(url);
	if (!response.ok) throw new Error(response.statusText);

	const responsePosts: PostDto[] = await response.json();
	const posts = responsePosts.map((postDto) => parsePost(postDto));
	return posts;
};

export const getPostById = async (id: number, apiKey?: string): Promise<Post> => {
	let url = BASE_POST_URL;
	apiKey && (url = url.concat(apiKey));
	url = url.concat(`&id=${id}`);

	const response = await fetch(url);
	if (!response.ok) throw new Error(response.statusText);

	const posts: Post[] = await response.json();
	if (posts.length < 1) throw new Error('No post found');

	return posts[0];
};

export const getTagsByNames = async (names: string[], apiKey?: string): Promise<Tag[]> => {
	const deduplicatedNames = Array.from(new Set(names));
	const batches: string[][] = [];
	while (deduplicatedNames.length > 0) {
		batches.push(deduplicatedNames.splice(0, 100));
	}

	const tagsFromApi: Tag[][] = [];
	for (const batch of batches) {
		let url = BASE_TAG_URL;
		apiKey && (url = url.concat(apiKey));
		url = url.concat(`&names=${escapeTag(batch.join(' '))}`);

		const response = await fetch(url);
		if (!response.ok) {
			throw Error(`Error while fetching tags by names: ${response.statusText}`);
		}
		const tags: Tag[] = await response.json();
		tagsFromApi.push(tags);
		await delay(2000);
	}

	return tagsFromApi.flat();
};

export const getTagsByPattern = async (pattern: string, apiKey?: string): Promise<Tag[]> => {
	let url = BASE_TAG_URL;
	apiKey && (url = url.concat(apiKey));
	url = url.concat(`&limit=30&name_pattern=%${escapeTag(pattern)}%`);

	const response = await fetch(url);
	if (!response.ok) throw new Error(response.statusText);

	const tags: Tag[] = await response.json();
	return tags;
};
