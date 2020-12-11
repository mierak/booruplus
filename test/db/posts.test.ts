import Dexie from 'dexie';
Dexie.dependencies.indexedDB = require('fake-indexeddb');
Dexie.dependencies.IDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');
import db from '../../src/db/database';
import { FavoritesTreeNode, FilterOptions } from '../../src/db/types';
import { Post } from '../../src/types/gelbooruTypes';
import { mPost } from '../helpers/test.helper';
import {
	getDownloadedCount,
	getBlacklistedCount,
	getCountForRating,
	getMostViewed,
	bulkSave,
	getAll,
	getAllDownloaded,
	getBulk,
	getAllBlacklisted,
	getAllWithOptions,
	bulkUpdateFromApi,
	getForTagsWithOptions,
	saveOrUpdateFromApi,
} from '../../src/db/posts';

describe('db/posts', () => {
	let posts: Post[] = [];

	beforeEach(async (done) => {
		jest.clearAllMocks();
		await db.posts.clear();
		await db.favorites.clear();
		posts = [];
		posts.push(
			...[
				mPost({
					id: 0,
					downloaded: 1,
					rating: 'e',
					viewCount: 1,
					fileUrl: 'test.jpg',
					downloadedAt: 5,
					createdAt: 5,
					tags: ['tag0', 'tag1'],
				}),
				mPost({
					id: 1,
					downloaded: 1,
					rating: 'q',
					viewCount: 2,
					fileUrl: 'test.gif',
					downloadedAt: 4,
					createdAt: 4,
					tags: ['tag1', 'tag2'],
				}),
				mPost({
					id: 2,
					downloaded: 1,
					rating: 's',
					viewCount: 3,
					fileUrl: 'test.webm',
					downloadedAt: 3,
					createdAt: 3,
					tags: ['tag2'],
				}),
			]
		);
		posts.push(
			...[
				mPost({
					id: 3,
					blacklisted: 1,
					rating: 'e',
					viewCount: 4,
					fileUrl: 'test.jpg',
					downloadedAt: 2,
					createdAt: 2,
					tags: ['tag3'],
				}),
				mPost({
					id: 4,
					blacklisted: 1,
					rating: 'q',
					viewCount: 5,
					fileUrl: 'test.gif',
					downloadedAt: 1,
					createdAt: 1,
					tags: ['tag4'],
				}),
				mPost({
					id: 5,
					blacklisted: 1,
					rating: 's',
					viewCount: 6,
					fileUrl: 'test.webm',
					downloadedAt: 0,
					createdAt: 0,
					tags: ['tag5'],
				}),
			]
		);
		await db.posts.bulkPut(posts);
		done();
	});
	describe('getDownloadedCount()', () => {
		it('Returns correct count', async () => {
			// given
			const getSpy = jest.spyOn(db.posts, 'where');

			// when
			const result = await getDownloadedCount();

			// then
			expect(result).toBe(3);
			expect(getSpy).toBeCalledWith('downloaded');
		});
	});
	describe('getBlacklistedCount()', () => {
		it('Returns correct count', async () => {
			// given
			const getSpy = jest.spyOn(db.posts, 'where');

			// when
			const result = await getBlacklistedCount();

			// then
			expect(result).toBe(3);
			expect(getSpy).toBeCalledWith('blacklisted');
		});
	});
	describe('getCountForRating()', () => {
		it('Returns correct count', async () => {
			// given
			const getSpy = jest.spyOn(db.posts, 'where');

			// when
			const result = await getCountForRating('explicit');

			// then
			expect(result).toBe(1);
			expect(getSpy).toBeCalledWith('rating');
		});
	});
	describe('getMostViewed()', () => {
		it('Returns correct posts', async () => {
			// given
			const getSpy = jest.spyOn(db.posts, 'orderBy');
			const expectedResult = posts.reverse();

			// when
			const result = await getMostViewed();

			// then
			expect(getSpy).toBeCalledWith('viewCount');
			expectedResult.forEach((post, index) => {
				expect(result[index]).toMatchObject(post);
			});
		});
		it('Returns correct posts with limit', async () => {
			// given
			const getSpy = jest.spyOn(db.posts, 'orderBy');
			const expectedResult = posts.reverse().slice(0, 3);

			// when
			const result = await getMostViewed(3);

			// then
			expect(getSpy).toBeCalledWith('viewCount');
			expectedResult.forEach((post, index) => {
				expect(result[index]).toMatchObject(post);
			});
		});
	});
	describe('bulkSave()', () => {
		it('Calls bulkPut', async () => {
			// given
			const bulkPutSpy = jest.spyOn(db.posts, 'bulkPut');

			// when
			await bulkSave(posts);

			// then
			expect(bulkPutSpy).toBeCalledWith(posts);
		});
	});
	describe('getAll()', () => {
		it('Calls toArray()', async () => {
			// given
			const getSpy = jest.spyOn(db.posts, 'toArray');

			// when
			const result = await getAll();

			// then
			expect(getSpy).toBeCalledTimes(1);
			expect(result).toStrictEqual(posts);
		});
	});
	describe('getBulk()', () => {
		it('Calls bulkGet()', async () => {
			// given
			const ids = [0, 1, 2];
			const getSpy = jest.spyOn(db.posts, 'bulkGet');

			// when
			const result = await getBulk(ids);

			// then
			expect(getSpy).toBeCalledWith(ids);
			expect(result).toStrictEqual([posts[0], posts[1], posts[2]]);
		});
	});
	describe('getAllDownloaded()', () => {
		it('Calls where with "downloaded"', async () => {
			// given
			const getSpy = jest.spyOn(db.posts, 'where');

			// when
			const result = await getAllDownloaded();

			// then
			expect(getSpy).toBeCalledWith('downloaded');
			expect(result).toStrictEqual([posts[0], posts[1], posts[2]]);
		});
	});
	describe('getAllBlacklisted()', () => {
		it('Calls where with "downloaded"', async () => {
			// given
			const getSpy = jest.spyOn(db.posts, 'where');

			// when
			const result = await getAllBlacklisted();

			// then
			expect(getSpy).toBeCalledWith('blacklisted');
			expect(result).toStrictEqual([posts[3], posts[4], posts[5]]);
		});
	});
	describe('bulkUpdateFromApi()', () => {
		it('Returns correct result', async () => {
			// given
			const downloadedPost: Post = { ...posts[0], downloaded: 0 };
			const newPost = mPost({ id: 1254683, downloaded: 0 });
			const expectedDownloadedPost = { ...downloadedPost, downloaded: 1 };
			const putSpy = jest.spyOn(db.posts, 'put');
			const bulkGetSpy = jest.spyOn(db.posts, 'bulkGet');

			// when
			const result = await bulkUpdateFromApi([downloadedPost, newPost]);

			// then
			expect(bulkGetSpy).toBeCalledWith([downloadedPost, newPost].map((post) => post.id));
			expect(result[0]).toMatchObject(expectedDownloadedPost);
			expect(putSpy).toBeCalledWith(expectedDownloadedPost);
			expect(putSpy).not.toBeCalledWith(newPost);
		});
	});
	describe('getAllWithOptions()', () => {
		it('Returns only images', async () => {
			// given
			const getSpy = jest.spyOn(db.posts, 'toArray');
			const options: FilterOptions = {
				blacklisted: true,
				nonBlacklisted: true,
				limit: 100,
				offset: 0,
				rating: 'any',
				showFavorites: false,
				showGifs: false,
				showImages: true,
				showVideos: false,
				sort: 'none',
				sortOrder: 'desc',
			};

			// when
			const result = await getAllWithOptions(options);

			// then
			expect(getSpy).toBeCalledTimes(1);
			expect(result).toHaveLength(2);
			expect(result[0]).toMatchObject(posts[0]);
			expect(result[1]).toMatchObject(posts[3]);
		});
		it('Returns only gifs', async () => {
			// given
			const getSpy = jest.spyOn(db.posts, 'toArray');
			const options: FilterOptions = {
				blacklisted: true,
				nonBlacklisted: true,
				limit: 100,
				offset: 0,
				rating: 'any',
				showFavorites: false,
				showGifs: true,
				showImages: false,
				showVideos: false,
				sort: 'none',
				sortOrder: 'desc',
			};

			// when
			const result = await getAllWithOptions(options);

			// then
			expect(getSpy).toBeCalledTimes(1);
			expect(result).toHaveLength(2);
			expect(result[0]).toMatchObject(posts[1]);
			expect(result[1]).toMatchObject(posts[4]);
		});
		it('Returns only videos', async () => {
			// given
			const getSpy = jest.spyOn(db.posts, 'toArray');
			const options: FilterOptions = {
				blacklisted: true,
				nonBlacklisted: true,
				limit: 100,
				offset: 0,
				rating: 'any',
				showFavorites: false,
				showGifs: false,
				showImages: false,
				showVideos: true,
				sort: 'none',
				sortOrder: 'desc',
			};

			// when
			const result = await getAllWithOptions(options);

			// then
			expect(getSpy).toBeCalledTimes(1);
			expect(result).toHaveLength(2);
			expect(result[0]).toMatchObject(posts[2]);
			expect(result[1]).toMatchObject(posts[5]);
		});
		it('Returns all filetypes', async () => {
			// given
			const getSpy = jest.spyOn(db.posts, 'toArray');
			const options: FilterOptions = {
				blacklisted: true,
				nonBlacklisted: true,
				limit: 100,
				offset: 0,
				rating: 'any',
				showFavorites: false,
				showGifs: true,
				showImages: true,
				showVideos: true,
				sort: 'none',
				sortOrder: 'desc',
			};

			// when
			const result = await getAllWithOptions(options);

			// then
			expect(getSpy).toBeCalledTimes(1);
			expect(result).toHaveLength(6);
			expect(result[0]).toMatchObject(posts[0]);
			expect(result[1]).toMatchObject(posts[1]);
			expect(result[2]).toMatchObject(posts[2]);
			expect(result[3]).toMatchObject(posts[3]);
			expect(result[4]).toMatchObject(posts[4]);
			expect(result[5]).toMatchObject(posts[5]);
		});
		it('Limits and offsets result', async () => {
			// given
			const getSpy = jest.spyOn(db.posts, 'toArray');
			const options: FilterOptions = {
				blacklisted: true,
				nonBlacklisted: true,
				limit: 2,
				offset: 2,
				rating: 'any',
				showFavorites: false,
				showGifs: true,
				showImages: true,
				showVideos: true,
				sort: 'none',
				sortOrder: 'desc',
			};

			// when
			const result = await getAllWithOptions(options);

			// then
			expect(getSpy).toBeCalledTimes(1);
			expect(result).toHaveLength(2);
			expect(result[0]).toMatchObject(posts[2]);
			expect(result[1]).toMatchObject(posts[3]);
		});
		it('Shows only blacklisted', async () => {
			// given
			const getSpy = jest.spyOn(db.posts, 'toArray');
			const options: FilterOptions = {
				blacklisted: true,
				nonBlacklisted: false,
				limit: 100,
				offset: 0,
				rating: 'any',
				showFavorites: false,
				showGifs: true,
				showImages: true,
				showVideos: true,
				sort: 'none',
				sortOrder: 'desc',
			};

			// when
			const result = await getAllWithOptions(options);

			// then
			expect(getSpy).toBeCalledTimes(1);
			expect(result).toHaveLength(3);
			expect(result[0]).toMatchObject(posts[3]);
			expect(result[1]).toMatchObject(posts[4]);
			expect(result[2]).toMatchObject(posts[5]);
		});
		it('Shows only non-blacklisted', async () => {
			// given
			const getSpy = jest.spyOn(db.posts, 'toArray');
			const options: FilterOptions = {
				blacklisted: false,
				nonBlacklisted: true,
				limit: 100,
				offset: 0,
				rating: 'any',
				showFavorites: false,
				showGifs: true,
				showImages: true,
				showVideos: true,
				sort: 'none',
				sortOrder: 'desc',
			};

			// when
			const result = await getAllWithOptions(options);

			// then
			expect(getSpy).toBeCalledTimes(1);
			expect(result).toHaveLength(3);
			expect(result[0]).toMatchObject(posts[0]);
			expect(result[1]).toMatchObject(posts[1]);
			expect(result[2]).toMatchObject(posts[2]);
		});
		it('Shows both non-blacklisted and blacklisted', async () => {
			// given
			const getSpy = jest.spyOn(db.posts, 'toArray');
			const options: FilterOptions = {
				blacklisted: true,
				nonBlacklisted: true,
				limit: 100,
				offset: 0,
				rating: 'any',
				showFavorites: false,
				showGifs: true,
				showImages: true,
				showVideos: true,
				sort: 'none',
				sortOrder: 'desc',
			};

			// when
			const result = await getAllWithOptions(options);

			// then
			expect(getSpy).toBeCalledTimes(1);
			expect(result).toHaveLength(6);
			expect(result[0]).toMatchObject(posts[0]);
			expect(result[1]).toMatchObject(posts[1]);
			expect(result[2]).toMatchObject(posts[2]);
			expect(result[3]).toMatchObject(posts[3]);
			expect(result[4]).toMatchObject(posts[4]);
			expect(result[5]).toMatchObject(posts[5]);
		});
		it('Shows favorited posts', async () => {
			// given
			const node: FavoritesTreeNode = {
				key: 1,
				parentKey: 0,
				title: 'title',
				childrenKeys: [],
				postIds: [0, 1, 2],
			};
			await db.favorites.put(node);
			const getSpy = jest.spyOn(db.posts, 'toArray');
			const options: FilterOptions = {
				blacklisted: true,
				nonBlacklisted: true,
				limit: 100,
				offset: 0,
				rating: 'any',
				showFavorites: true,
				showGifs: true,
				showImages: true,
				showVideos: true,
				sort: 'none',
				sortOrder: 'desc',
			};

			// when
			const result = await getAllWithOptions(options);
			// then
			expect(getSpy).toBeCalledTimes(1);
			expect(result).toHaveLength(6);
			expect(result[0]).toMatchObject(posts[0]);
			expect(result[1]).toMatchObject(posts[1]);
			expect(result[2]).toMatchObject(posts[2]);
			expect(result[3]).toMatchObject(posts[3]);
			expect(result[4]).toMatchObject(posts[4]);
			expect(result[5]).toMatchObject(posts[5]);
		});
		it('Does not show favorited posts', async () => {
			// given
			const node: FavoritesTreeNode = {
				key: 1,
				parentKey: 0,
				title: 'title',
				childrenKeys: [],
				postIds: [0, 1, 2],
			};
			await db.favorites.put(node);
			const getSpy = jest.spyOn(db.posts, 'toArray');
			const options: FilterOptions = {
				blacklisted: true,
				nonBlacklisted: true,
				limit: 100,
				offset: 0,
				rating: 'any',
				showFavorites: false,
				showGifs: true,
				showImages: true,
				showVideos: true,
				sort: 'none',
				sortOrder: 'desc',
			};

			// when
			const result = await getAllWithOptions(options);
			// then
			expect(getSpy).toBeCalledTimes(1);
			expect(result).toHaveLength(3);
			expect(result[0]).toMatchObject(posts[3]);
			expect(result[1]).toMatchObject(posts[4]);
			expect(result[2]).toMatchObject(posts[5]);
		});
		it('Filters rating correctly', async () => {
			// given
			const getSpy = jest.spyOn(db.posts, 'toArray');
			const options: FilterOptions = {
				blacklisted: true,
				nonBlacklisted: true,
				limit: 100,
				offset: 0,
				rating: 'questionable',
				showFavorites: false,
				showGifs: true,
				showImages: true,
				showVideos: true,
				sort: 'none',
				sortOrder: 'desc',
			};

			// when
			const result = await getAllWithOptions(options);

			// then
			expect(getSpy).toBeCalledTimes(1);
			expect(result).toHaveLength(2);
			expect(result[0]).toMatchObject(posts[1]);
			expect(result[1]).toMatchObject(posts[4]);
		});
		it('Sorts posts by date-downloaded asc', async () => {
			// given
			const getSpy = jest.spyOn(db.posts, 'toArray');
			const options: FilterOptions = {
				blacklisted: true,
				nonBlacklisted: true,
				limit: 100,
				offset: 0,
				rating: 'any',
				showFavorites: false,
				showGifs: true,
				showImages: true,
				showVideos: true,
				sort: 'date-downloaded',
				sortOrder: 'asc',
			};

			// when
			const result = await getAllWithOptions(options);

			// then
			expect(getSpy).toBeCalledTimes(1);
			expect(result).toHaveLength(6);
			expect(result[0]).toMatchObject(posts[5]);
			expect(result[1]).toMatchObject(posts[4]);
			expect(result[2]).toMatchObject(posts[3]);
			expect(result[3]).toMatchObject(posts[2]);
			expect(result[4]).toMatchObject(posts[1]);
			expect(result[5]).toMatchObject(posts[0]);
		});
		it('Sorts posts by date-downloaded desc', async () => {
			// given
			const getSpy = jest.spyOn(db.posts, 'toArray');
			const options: FilterOptions = {
				blacklisted: true,
				nonBlacklisted: true,
				limit: 100,
				offset: 0,
				rating: 'any',
				showFavorites: false,
				showGifs: true,
				showImages: true,
				showVideos: true,
				sort: 'date-downloaded',
				sortOrder: 'desc',
			};

			// when
			const result = await getAllWithOptions(options);

			// then
			expect(getSpy).toBeCalledTimes(1);
			expect(result).toHaveLength(6);
			expect(result[0]).toMatchObject(posts[0]);
			expect(result[1]).toMatchObject(posts[1]);
			expect(result[2]).toMatchObject(posts[2]);
			expect(result[3]).toMatchObject(posts[3]);
			expect(result[4]).toMatchObject(posts[4]);
			expect(result[5]).toMatchObject(posts[5]);
		});
		it('Sorts posts by date-updated asc', async () => {
			// given
			const getSpy = jest.spyOn(db.posts, 'toArray');
			const options: FilterOptions = {
				blacklisted: true,
				nonBlacklisted: true,
				limit: 100,
				offset: 0,
				rating: 'any',
				showFavorites: false,
				showGifs: true,
				showImages: true,
				showVideos: true,
				sort: 'date-updated',
				sortOrder: 'asc',
			};

			// when
			const result = await getAllWithOptions(options);

			// then
			expect(getSpy).toBeCalledTimes(1);
			expect(result).toHaveLength(6);
			expect(result[0]).toMatchObject(posts[5]);
			expect(result[1]).toMatchObject(posts[4]);
			expect(result[2]).toMatchObject(posts[3]);
			expect(result[3]).toMatchObject(posts[2]);
			expect(result[4]).toMatchObject(posts[1]);
			expect(result[5]).toMatchObject(posts[0]);
		});
		it('Sorts posts by date-updated desc', async () => {
			// given
			const getSpy = jest.spyOn(db.posts, 'toArray');
			const options: FilterOptions = {
				blacklisted: true,
				nonBlacklisted: true,
				limit: 100,
				offset: 0,
				rating: 'any',
				showFavorites: false,
				showGifs: true,
				showImages: true,
				showVideos: true,
				sort: 'date-updated',
				sortOrder: 'desc',
			};

			// when
			const result = await getAllWithOptions(options);

			// then
			expect(getSpy).toBeCalledTimes(1);
			expect(result).toHaveLength(6);
			expect(result[0]).toMatchObject(posts[0]);
			expect(result[1]).toMatchObject(posts[1]);
			expect(result[2]).toMatchObject(posts[2]);
			expect(result[3]).toMatchObject(posts[3]);
			expect(result[4]).toMatchObject(posts[4]);
			expect(result[5]).toMatchObject(posts[5]);
		});
		it('Sorts posts by rating asc', async () => {
			// given
			const getSpy = jest.spyOn(db.posts, 'toArray');
			const options: FilterOptions = {
				blacklisted: true,
				nonBlacklisted: true,
				limit: 100,
				offset: 0,
				rating: 'any',
				showFavorites: false,
				showGifs: true,
				showImages: true,
				showVideos: true,
				sort: 'rating',
				sortOrder: 'asc',
			};

			// when
			const result = await getAllWithOptions(options);

			// then
			expect(getSpy).toBeCalledTimes(1);
			expect(result).toHaveLength(6);
			expect(result[0]).toMatchObject(posts[0]);
			expect(result[1]).toMatchObject(posts[3]);
			expect(result[2]).toMatchObject(posts[1]);
			expect(result[3]).toMatchObject(posts[4]);
			expect(result[4]).toMatchObject(posts[2]);
			expect(result[5]).toMatchObject(posts[5]);
		});
		it('Sorts posts by rating desc', async () => {
			// given
			const getSpy = jest.spyOn(db.posts, 'toArray');
			const options: FilterOptions = {
				blacklisted: true,
				nonBlacklisted: true,
				limit: 100,
				offset: 0,
				rating: 'any',
				showFavorites: false,
				showGifs: true,
				showImages: true,
				showVideos: true,
				sort: 'rating',
				sortOrder: 'desc',
			};

			// when
			const result = await getAllWithOptions(options);

			// then
			expect(getSpy).toBeCalledTimes(1);
			expect(result).toHaveLength(6);
			expect(result[0]).toMatchObject(posts[2]);
			expect(result[1]).toMatchObject(posts[5]);
			expect(result[2]).toMatchObject(posts[1]);
			expect(result[3]).toMatchObject(posts[4]);
			expect(result[4]).toMatchObject(posts[0]);
			expect(result[5]).toMatchObject(posts[3]);
		});
	});
	describe('getForTagsWithOptions()', () => {
		it('Returns correctl result', async () => {
			// given
			const options: FilterOptions = {
				blacklisted: true,
				nonBlacklisted: true,
				limit: 100,
				offset: 0,
				rating: 'any',
				showFavorites: false,
				showGifs: true,
				showImages: true,
				showVideos: true,
				sort: 'rating',
				sortOrder: 'desc',
			};

			// when
			const result = await getForTagsWithOptions(options, ['tag1'], ['tag0']);

			// then
			expect(result).toHaveLength(1);
			expect(result[0]).toMatchObject(posts[1]);
		});
		it('Returns empty array when no tags are passed in', async () => {
			// given
			const options: FilterOptions = {
				blacklisted: true,
				nonBlacklisted: true,
				limit: 100,
				offset: 0,
				rating: 'any',
				showFavorites: false,
				showGifs: true,
				showImages: true,
				showVideos: true,
				sort: 'rating',
				sortOrder: 'desc',
			};

			// when
			const result = await getForTagsWithOptions(options, [], []);

			// then
			expect(result).toHaveLength(0);
		});
	});
	describe('saveOrUpdateFromApi()', () => {
		it('Returns correct result and calls put with correct post if post is already in db', async () => {
			// given
			const post = mPost({
				id: 1,
				downloaded: 0,
				rating: 'q',
				viewCount: 0,
				fileUrl: 'test.gif',
				downloadedAt: 4,
				createdAt: 4,
				tags: ['tag1', 'tag2'],
			});
			const getSpy = jest.spyOn(db.posts, 'get');
			const putSpy = jest.spyOn(db.posts, 'put');

			// when
			const result = await saveOrUpdateFromApi(post);

			// then
			expect(getSpy).toBeCalledWith(post.id);
			expect(putSpy).toBeCalledWith(posts[1]);
			expect(result).toMatchObject(posts[1]);
		});
		it('Returns correct result and calls put with correct post if post is not in db', async () => {
			// given
			const post = mPost({
				id: 123,
				downloaded: 0,
				rating: 'q',
				viewCount: 0,
				fileUrl: 'test.gif',
				downloadedAt: 4,
				createdAt: 4,
				tags: ['tag1', 'tag2'],
			});
			const getSpy = jest.spyOn(db.posts, 'get');
			const putSpy = jest.spyOn(db.posts, 'put');

			// when
			const result = await saveOrUpdateFromApi(post);

			// then
			expect(getSpy).toBeCalledWith(post.id);
			expect(putSpy).toBeCalledWith(post);
			expect(result).toMatchObject(post);
		});
	});
});
