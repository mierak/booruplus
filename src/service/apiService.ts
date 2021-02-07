import { Post, PostDto, Tag, PostSearchOptions, ReleaseResponse } from '@appTypes/gelbooruTypes';
import { delay, escapeTag, postParser, withTimeout } from '@util/utils';
import { GELBOORU_URL } from './webService';
import { getApiLogger } from '@util/logger';
import * as urlBuilder from './gelbooruUrlBuilder';

export const GITHUB_LATEST_RELEASE_ENDPOINT = 'https://api.github.com/repos/mierak/booruplus/releases/latest';
export const BASE_URL = `${GELBOORU_URL}/index.php?page=dapi&q=index&json=1`;
export const BASE_TAG_URL = `${BASE_URL}&s=tag`;
export const BASE_POST_URL = `${BASE_URL}&s=post`;

const parsePost = postParser();

export const getPostsForTags = async (tags: string[], options: PostSearchOptions = {}, excludedTags?: string[]): Promise<Post[]> => {
	const logger = getApiLogger('getPostsForTags');

	const { apiKey, limit, page: pid, rating, sort, sortOrder } = options;
	const urlParams = { tags, excludedTags, limit, pid, rating, sort, sortOrder, apiKey };
	const url = urlBuilder.gelbooruUrlBuilder('post', urlParams);

	try {
		logger.debug('Request to url', apiKey ? url.replace(apiKey, '&api_key=REDACTED') : url);

		const response = (await withTimeout(async (signal) => {
			const res = await fetch(url, { signal });
			logger.debug('Response', res.status, res.statusText);

			return res.json();
		})) as PostDto[];

		return response.map((postDto) => parsePost(postDto));
	} catch (err) {
		logger.error(err);
		throw err;
	}
};

export const getPostById = async (id: number, apiKey?: string): Promise<Post> => {
	const logger = getApiLogger('getPostById');

	const url = urlBuilder.gelbooruUrlBuilder('post', { id, apiKey });

	try {
		logger.debug('Calling API url', apiKey ? url.replace(apiKey, '&api_key=REDACTED') : url);

		const response = (await withTimeout(async (signal) => {
			const res = await fetch(url, { signal });
			logger.debug('Response', res.status, res.statusText);

			return res.json();
		})) as PostDto[];

		if (response.length < 1) throw new Error('No post found');

		return parsePost(response[0]);
	} catch (err) {
		logger.error(err);
		throw err;
	}
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
		const url = urlBuilder.gelbooruUrlBuilder('tag', { names: batch, apiKey });

		logger.debug('Calling API url', apiKey ? url.replace(apiKey, '&api_key=REDACTED') : url);
		const response = (await withTimeout(async (signal) => {
			const res = await fetch(url, { signal });
			logger.debug('Response', res.status, res.statusText);

			return res.json();
		})) as Tag[];

		tagsFromApi.push(response);
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
	const response = (await withTimeout(async (signal) => {
		const res = await fetch(url, { signal });
		logger.debug('Response', res.status, res.statusText);

		return res.json();
	})) as Tag[];

	return response;
};

export const getLatestAppVersion = async (): Promise<ReleaseResponse | undefined> => {
	try {
		const response = (await withTimeout(async (signal) => {
			const res = await fetch(GITHUB_LATEST_RELEASE_ENDPOINT, {
				signal,
				headers: {
					Accept: 'application/vnd.github.v3+json',
				},
			});

			return res.json();
		})) as ReleaseResponse;

		return response;
	} catch (err) {
		window.log.error('Error while checking for updates. Could not get releases.', err);
	}
};
