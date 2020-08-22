import {
	BASE_TAG_URL,
	BASE_POST_URL,
	getTagsByPattern,
	getSortOptionString,
	getPostById,
	getTagsByNames,
	getPostsForTags,
} from '../../src/service/apiService';
import 'jest-fetch-mock';
import { enableFetchMocks } from 'jest-fetch-mock';

import * as utils from '../../src/util/utils';
import { PostSearchOptions, Rating } from 'types/gelbooruTypes';

enableFetchMocks();

jest.mock('../../src/util/utils', () => {
	const originalModule = jest.requireActual('../../src/util/utils');
	return {
		...originalModule,
		__esModule: true,
		delay: jest.fn().mockImplementation(() => null),
	};
});

describe('apiService', () => {
	const apiKey = '&api_key=bfa4dc4a96d3ckb2hccf39be27fg9s74409cf50a9529696g85e7b18106as1fa0&user_id=120';

	beforeEach(() => {
		fetchMock.resetMocks();
	});

	describe('getTagsByPattern()', () => {
		beforeEach(() => {
			fetchMock.mockResponseOnce(
				'[{"id":"1673","tag":"legs_up","count":"27840","type":"tag","ambiguous":"0"},{"id":"6352","tag":"hitomaru","count":"667","type":"artist","ambiguous":"0"}]'
			);
		});
		it('Throws error on fetch error', async () => {
			// given
			fetchMock.resetMocks();
			fetchMock.mockResponseOnce('', { status: 404, statusText: 'Not Found' });
			const pattern = 'test';

			// when

			// then
			await expect(getTagsByPattern(pattern)).rejects.toThrow('Not Found');
		});
		it('Calls the correct endpoint with correct parameters', async () => {
			// given
			const pattern1 = 'kawa';
			const expectedEndpoint1 = `https://gelbooru.com/index.php?page=dapi&q=index&json=1&s=tag&limit=30&name_pattern=%${pattern1}%`;
			const expectedTags = [
				{
					id: '1673',
					tag: 'legs_up',
					count: '27840',
					type: 'tag',
					ambiguous: '0',
				},
				{
					id: '6352',
					tag: 'hitomaru',
					count: '667',
					type: 'artist',
					ambiguous: '0',
				},
			];

			// when
			const result = await getTagsByPattern(pattern1);

			// then
			expect(fetchMock.mock.calls.length).toBe(1);
			expect(fetchMock.mock.calls[0][0]).toEqual(expectedEndpoint1);
			expect(result).toStrictEqual(expectedTags);
		});
		it('Calls the correct endpoint with escaped tag', async () => {
			// given
			const pattern1 = 'test+test';
			const expectedEndpoint1 = `https://gelbooru.com/index.php?page=dapi&q=index&json=1&s=tag&limit=30&name_pattern=%${utils.escapeTag(
				pattern1
			)}%`;

			// when
			await getTagsByPattern(pattern1);

			// then
			expect(fetchMock.mock.calls[0][0]).toEqual(expectedEndpoint1);
		});
		it('Correctly adds api key', async () => {
			// given
			const pattern = '123test123';
			const expected = `${BASE_TAG_URL}${apiKey}&limit=30&name_pattern=%${pattern}%`;

			// when
			await getTagsByPattern(pattern, apiKey);

			// then
			expect(fetchMock.mock.calls[0][0]).toEqual(expected);
		});
	});

	describe('getPostsForTags()', () => {
		beforeEach(() => {
			fetchMock.mockResponseOnce(
				'[{"source":"http://sanorin.boo.jp/original/FM2/IMG1/FMI11.JPG","directory":"ef/f5","hash":"eff52c6a6a1c04f937a4d2d3f8a6db44",' +
					'"height":690,"id":1234,"image":"cef5249028af19f73d08358743d25394f40b2cc3.jpg","change":1533749474,"owner":"danbooru",' +
					'"parent_id":null,"rating":"s","sample":0,"sample_height":0,"sample_width":0,"score":4,' +
					'"tags":"1girl barefoot feet legs pointy_ears sanokichi_(wankou) skull solo toes","width":490,' +
					'"file_url":"https://img2.gelbooru.com/images/ef/f5/eff52c6a6a1c04f937a4d2d3f8a6db44.jpg","created_at":"Mon Jul 16 00:35:32 -0500 2007"}]'
			);
		});
		it('Throws error on fetch error', async () => {
			// given
			fetchMock.resetMocks();
			fetchMock.mockResponseOnce('', { status: 404, statusText: 'Not Found' });
			const tags: string[] = ['1', '2', '3'];

			// when

			// then
			await expect(getPostsForTags(tags)).rejects.toThrow('Not Found');
		});
		it('Correctly adds api key', async () => {
			// given
			const tags: string[] = ['1', '2', '3'];
			const expected1 = `${BASE_POST_URL}${apiKey}&limit=100&tags=${tags.join(' ')}`;

			// when
			await getPostsForTags(tags, { apiKey });

			// then
			expect(fetchMock.mock.calls[0][0]).toEqual(expected1);
		});
		it('Is called with correct excluded tags', async () => {
			// given
			const tags: string[] = ['1', '2', '3'];
			const excludedTags: string[] = ['4', '5', '6'];
			const expected1 = `${BASE_POST_URL}&limit=100&tags=${tags.join(' ')} -${excludedTags.join(' -')}`;

			// when
			await getPostsForTags(tags, {}, excludedTags);

			// then
			expect(fetchMock.mock.calls[0][0]).toEqual(expected1);
		});
		it('Correctly sets limit', async () => {
			// given
			const tags: string[] = ['1', '2', '3'];
			const limit = 50;
			const expected1 = `${BASE_POST_URL}&limit=${limit}&tags=${tags.join(' ')}`;

			// when
			await getPostsForTags(tags, { limit });

			// then
			expect(fetchMock.mock.calls[0][0]).toEqual(expected1);
		});
		it('Correctly sets page', async () => {
			// given
			const tags: string[] = ['1', '2', '3'];
			const page = 5;
			const expected1 = `${BASE_POST_URL}&limit=100&pid=${page}&tags=${tags.join(' ')}`;

			// when
			await getPostsForTags(tags, { page });

			// then
			expect(fetchMock.mock.calls[0][0]).toEqual(expected1);
		});
		it('Correctly sets page', async () => {
			// given
			const tags: string[] = ['1', '2', '3'];
			const page = 5;
			const expected1 = `${BASE_POST_URL}&limit=100&pid=${page}&tags=${tags.join(' ')}`;

			// when
			await getPostsForTags(tags, { page });

			// then
			expect(fetchMock.mock.calls[0][0]).toEqual(expected1);
		});
		it('Correctly sets rating', async () => {
			// given
			const tags: string[] = ['1', '2', '3'];
			const rating: Rating = 'explicit';
			const expected1 = `${BASE_POST_URL}&limit=100&tags=${tags.join(' ')} rating:${rating}`;

			// when
			await getPostsForTags(tags, { rating });

			// then
			expect(fetchMock.mock.calls[0][0]).toEqual(expected1);
		});
		it('Correctly sets sort', async () => {
			// given
			const tags: string[] = ['1', '2', '3'];
			const sortOpts: PostSearchOptions = {
				sort: 'rating',
				sortOrder: 'desc',
			};
			const sort = getSortOptionString(sortOpts);
			const expected1 = `${BASE_POST_URL}&limit=100&tags=${tags.join(' ')} ${sort}`;

			// when
			await getPostsForTags(tags, sortOpts);

			// then
			expect(fetchMock.mock.calls[0][0]).toEqual(expected1);
		});
		it('Correctly sets all options at once', async () => {
			// given
			const tags: string[] = ['1', '2', '3'];
			const sortOpts: PostSearchOptions = {
				apiKey,
				sort: 'rating',
				sortOrder: 'desc',
				limit: 50,
				page: 2,
				rating: 'explicit',
			};
			const sort = getSortOptionString(sortOpts);
			const expected1 = `${BASE_POST_URL}${apiKey}&limit=${sortOpts.limit}&pid=${sortOpts.page}&tags=${tags.join(' ')} rating:${
				sortOpts.rating
			} ${sort}`;

			// when
			await getPostsForTags(tags, sortOpts);

			// then
			expect(fetchMock.mock.calls[0][0]).toEqual(expected1);
		});
	});

	describe('getTagsByNames()', () => {
		beforeEach(() => {
			fetchMock.mockResponse(
				'[{"id":"1673","tag":"legs_up","count":"27840","type":"tag","ambiguous":"0"},{"id":"6352","tag":"hitomaru","count":"667","type":"artist","ambiguous":"0"}]'
			);
		});
		it('Throws error on fetch error', async () => {
			// given
			fetchMock.resetMocks();
			fetchMock.mockResponseOnce('', { status: 404, statusText: 'Not Found' });
			const tags: string[] = ['1', '2', '3'];

			// when

			// then
			await expect(getTagsByNames(tags)).rejects.toThrow('Not Found');
		});
		it('Correctly adds api key', async () => {
			// given
			const tags: string[] = ['1', '2', '3'];
			const expected1 = `${BASE_TAG_URL}${apiKey}&names=${tags.slice(0, 100).join(' ')}`;

			// when
			await getTagsByNames(tags, apiKey);

			// then
			expect(fetchMock.mock.calls[0][0]).toEqual(expected1);
		});
		it('Calls api correct number of times at a correct endpoint', async () => {
			// given
			const tags: string[] = [];
			for (let i = 0; i < 500; i++) {
				tags.push(i.toString());
			}
			const expected1 = `${BASE_TAG_URL}&names=${tags.slice(0, 100).join(' ')}`;

			// when
			await getTagsByNames(tags);

			// then
			expect(fetchMock.mock.calls.length).toEqual(5);
			expect(fetchMock.mock.calls[0][0]).toEqual(expected1);
		});
		it('Returns correct number of tags', async () => {
			// given
			const tags: string[] = [];
			for (let i = 0; i < 500; i++) {
				tags.push(i.toString());
			}

			// when
			const result = await getTagsByNames(tags);

			// then
			expect(result.length).toBe(10);
		});
	});

	describe('getPostById()', () => {
		beforeEach(() => {
			fetchMock.mockResponseOnce(
				'[{"source":"http://sanorin.boo.jp/original/FM2/IMG1/FMI11.JPG","directory":"ef/f5","hash":"eff52c6a6a1c04f937a4d2d3f8a6db44",' +
					'"height":690,"id":1234,"image":"cef5249028af19f73d08358743d25394f40b2cc3.jpg","change":1533749474,"owner":"danbooru",' +
					'"parent_id":null,"rating":"s","sample":0,"sample_height":0,"sample_width":0,"score":4,' +
					'"tags":"1girl barefoot feet legs pointy_ears sanokichi_(wankou) skull solo toes","width":490,' +
					'"file_url":"https://img2.gelbooru.com/images/ef/f5/eff52c6a6a1c04f937a4d2d3f8a6db44.jpg","created_at":"Mon Jul 16 00:35:32 -0500 2007"}]'
			);
		});
		it('Throws error on fetch error', async () => {
			// given
			fetchMock.resetMocks();
			fetchMock.mockResponseOnce('', { status: 404, statusText: 'Not Found' });
			const postId = 12345;

			// when

			// then
			await expect(getPostById(postId)).rejects.toThrow('Not Found');
		});
		it('Throws error when no posts are found', async () => {
			// given
			fetchMock.resetMocks();
			fetchMock.mockResponseOnce('[]');
			const postId = 12345;

			// when

			// then
			await expect(getPostById(postId)).rejects.toThrow('No post found');
		});
		it('Returns the correct post', async () => {
			// given
			const postId = 12345;

			// when
			const result = await getPostById(postId);

			// then
			if (!result) fail('Result post is undefined');
			expect(result.id).toBe(1234);
		});
		it('Calls the correct endpoint without api key', async () => {
			// given
			const postId = 12345;
			const expected = `${BASE_POST_URL}&id=${postId}`;

			// when
			await getPostById(postId);

			// then
			expect(fetchMock.mock.calls[0][0]).toEqual(expected);
		});
		it('Correctly adds api key', async () => {
			// given
			const postId = 12345;
			const expected = `${BASE_POST_URL}${apiKey}&id=${postId}`;

			// when
			await getPostById(postId, apiKey);

			// then
			expect(fetchMock.mock.calls[0][0]).toEqual(expected);
		});
	});

	describe('getSortOptionString()', () => {
		it('Returns empty string when no params are supplied', () => {
			// given
			const options = {};

			// when
			const result = getSortOptionString(options);

			// then
			expect(result).toBe('');
		});
		it('Returns a correct sort parameter for date-updated', () => {
			// given
			const optionsDesc: Partial<PostSearchOptions> = {
				sort: 'date-updated',
				sortOrder: 'desc',
			};
			const optionsAsc: Partial<PostSearchOptions> = {
				sort: 'date-updated',
				sortOrder: 'asc',
			};

			// when
			const resultDesc = getSortOptionString(optionsDesc);
			const resultAsc = getSortOptionString(optionsAsc);

			// then
			expect(resultDesc).toBe('sort:updated:desc');
			expect(resultAsc).toBe('sort:updated:asc');
		});
		it('Returns a correct sort parameter for rating', () => {
			// given
			const optionsDesc: Partial<PostSearchOptions> = {
				sort: 'rating',
				sortOrder: 'desc',
			};
			const optionsAsc: Partial<PostSearchOptions> = {
				sort: 'rating',
				sortOrder: 'asc',
			};

			// when
			const resultDesc = getSortOptionString(optionsDesc);
			const resultAsc = getSortOptionString(optionsAsc);

			// then
			expect(resultDesc).toBe('sort:rating:desc');
			expect(resultAsc).toBe('sort:rating:asc');
		});
		it('Returns empty string for other sort options', () => {
			// given
			const optionsDownloaded: Partial<PostSearchOptions> = {
				sort: 'date-downloaded',
				sortOrder: 'desc',
			};
			const optionsUploaded: Partial<PostSearchOptions> = {
				sort: 'date-uploaded',
				sortOrder: 'desc',
			};
			const optionsResolution: Partial<PostSearchOptions> = {
				sort: 'resolution',
				sortOrder: 'desc',
			};
			const optionsNone: Partial<PostSearchOptions> = {
				sort: 'none',
				sortOrder: 'desc',
			};

			// when
			const resultDownloaded = getSortOptionString(optionsDownloaded);
			const resultUploaded = getSortOptionString(optionsUploaded);
			const resultResolution = getSortOptionString(optionsResolution);
			const resultNone = getSortOptionString(optionsNone);

			// then
			expect(resultDownloaded).toBe('');
			expect(resultUploaded).toBe('');
			expect(resultResolution).toBe('');
			expect(resultNone).toBe('');
		});
	});
});
