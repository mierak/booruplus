import type { Rating, PostSearchOptions } from '@appTypes/gelbooruTypes';
import type { Sort, SortOrder } from '@store/types';
import { escapeTag } from '@util/utils';
import { GELBOORU_URL } from './webService';

export const BASE_URL = `${GELBOORU_URL}/index.php?page=dapi&q=index&json=1`;
export const BASE_TAG_URL = `${BASE_URL}&s=tag`;
export const BASE_POST_URL = `${BASE_URL}&s=post`;

type GelbooruEndpoint = 'post' | 'tag';

export type PostEndpointParams = {
	id?: number;
	limit?: number;
	pid?: number;
	tags?: string[];
	excludedTags?: string[];
	rating?: Rating;
	sort?: Sort;
	sortOrder?: SortOrder;
	apiKey?: string;
};
export type TagEndpointParams = {
	id?: number;
	limit?: number;
	name?: string;
	names?: string[];
	name_pattern?: string;
	order?: 'ASC' | 'DESC';
	orderBy?: 'date' | 'count' | 'name';
	apiKey?: string;
};
type GetParams<E extends GelbooruEndpoint> = E extends 'post' ? PostEndpointParams : TagEndpointParams;

export const getSortOptionString = (options: Pick<PostSearchOptions, 'sort' | 'sortOrder'>): string => {
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

const buildGetParams = (args: { [key: string]: string | number | undefined }): string => {
	return Object.entries(args).reduce((acc, [key, value]) => (value ? acc.concat(`&${key}=${value}`) : acc), '');
};

const tagsStringBuilder = (params: Pick<PostEndpointParams, 'tags' | 'excludedTags' | 'rating' | 'sort' | 'sortOrder'>): string => {
	let finalString = '';

	if (params.tags?.length) {
		finalString += escapeTag(params.tags.join(' '));
	}

	if (params.excludedTags?.length) {
		finalString += ` -${escapeTag(params.excludedTags.join(' -'))}`;
	}

	if (params.rating && params.rating !== 'any') {
		finalString += ` rating:${params.rating}`;
	}

	if (params.sort && params.sortOrder && (params.sort === 'date-updated' || params.sort === 'rating')) {
		finalString += ` ${getSortOptionString(params)}`;
	}

	return finalString;
};

export const gelbooruUrlBuilder = <E extends GelbooruEndpoint>(endpoint: E, parameters?: GetParams<E>): string => {
	let url = `${BASE_URL}&s=${endpoint}`;
	if (parameters) {
		if (endpoint === 'post') {
			const params = parameters as GetParams<'post'>;
			const { limit, id, pid, tags } = { ...params, tags: tagsStringBuilder(params) };
			url += buildGetParams({ limit, id, pid, tags });
		} else {
			const params = parameters as GetParams<'tag'>;
			const names = params.names && escapeTag(params.names?.join(' '));
			url += buildGetParams({ names });
		}
		if (parameters.apiKey) {
			url += parameters.apiKey;
		}
	}

	return encodeURI(url);
};
