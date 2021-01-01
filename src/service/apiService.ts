import { Post, PostDto, Tag, PostSearchOptions, ReleaseResponse } from '@appTypes/gelbooruTypes';
import { delay, escapeTag, postParser } from '@util/utils';
import { GELBOORU_URL } from './webService';
import { getApiLogger } from '@util/logger';

export const GITHUB_LATEST_RELEASE_ENDPOINT = 'https://api.github.com/repos/mierak/booruplus/releases/latest';
export const BASE_URL = `${GELBOORU_URL}/index.php?page=dapi&q=index&json=1`;
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
	const logger = getApiLogger('getPostsForTags');
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

	logger.debug('Calling API url', options.apiKey ? url.replace(options.apiKey, '&api_key=REDACTED') : url);
	const response = await fetch(url);
	if (!response.ok) {
		logger.error(response.statusText);
		throw new Error(response.statusText);
	}
	logger.debug('Response', response.status, response.statusText);

	const responsePosts: PostDto[] = await response.json();
	const posts = responsePosts.map((postDto) => parsePost(postDto));
	return posts;
};

export const getPostById = async (id: number, apiKey?: string): Promise<Post> => {
	const logger = getApiLogger('getPostById');
	let url = BASE_POST_URL;
	apiKey && (url = url.concat(apiKey));
	url = url.concat(`&id=${id}`);

	logger.debug('Calling API url', apiKey ? url.replace(apiKey, '&api_key=REDACTED') : url);
	const response = await fetch(url);
	if (!response.ok) {
		logger.error(response.statusText);
		throw new Error(response.statusText);
	}
	logger.debug('Response', response.status, response.statusText);

	const posts: Post[] = await response.json();
	if (posts.length < 1) throw new Error('No post found');

	return posts[0];
};

export const getTagsByNames = async (names: string[], apiKey?: string): Promise<Tag[]> => {
	const logger = getApiLogger('getTagsByNames');
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

		logger.debug('Calling API url', apiKey ? url.replace(apiKey, '&api_key=REDACTED') : url);
		const response = await fetch(url);
		if (!response.ok) {
			logger.error(response.statusText);
			throw new Error(response.statusText);
		}
		logger.debug('Response', response.status, response.statusText);
		const tags: Tag[] = await response.json();
		tagsFromApi.push(tags);
		await delay(2000);
	}

	return tagsFromApi.flat();
};

export const getTagsByPattern = async (pattern: string, apiKey?: string): Promise<Tag[]> => {
	const logger = getApiLogger('getTagsByPattern');
	let url = BASE_TAG_URL;
	apiKey && (url = url.concat(apiKey));
	url = url.concat(`&limit=30&name_pattern=%${escapeTag(pattern)}%`);

	logger.debug('Calling API url', apiKey ? url.replace(apiKey, '&api_key=REDACTED') : url);
	const response = await fetch(url);
	if (!response.ok) {
		logger.error(response.statusText);
		throw new Error(response.statusText);
	}
	logger.debug('Response', response.status, response.statusText);

	const tags: Tag[] = await response.json();
	return tags;
};

export const getLatestAppVersion = async (): Promise<ReleaseResponse | undefined> => {
	try {
		const response = await fetch(GITHUB_LATEST_RELEASE_ENDPOINT, {
			headers: {
				Accept: 'application/vnd.github.v3+json',
			},
		});
		const json: ReleaseResponse = await response.json();
		return json;
	} catch (err) {
		window.log.error('Error while checking for updates. Could not get releases.', err);
	}
};
