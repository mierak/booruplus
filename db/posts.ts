import db from './database';

import { Post, Rating } from '../types/gelbooruTypes';
import { FilterOptions } from './types';
import { intersection, getRatingName, isExtensionVideo, toAscii } from '../util/utils';

export const saveOrUpdateFromApi = async (post: Post): Promise<Post> => {
	const clone: Post = { ...post };
	const savedPost = await db.transaction(
		'rw',
		db.posts,
		db.postsTags,
		async (): Promise<Post> => {
			const savedPost = await db.posts.get(clone.id);
			if (savedPost) {
				clone.blacklisted = savedPost.blacklisted;
				clone.downloaded = savedPost.downloaded;
				clone.viewCount = savedPost.viewCount;
			}
			db.posts.put(clone).catch((err) => {
				console.error(err);
				throw err;
			});
			return clone;
		}
	);
	return savedPost;
};

export const bulkSaveOrUpdateFromApi = async (posts: Post[]): Promise<Post[]> => {
	const savedPosts = await db.transaction(
		'rw',
		db.posts,
		db.postsTags,
		async (): Promise<Post[]> => {
			const savedPosts = await db.posts.bulkGet(posts.map((post) => post.id));
			const result: Post[] = [];
			for (const [index, post] of savedPosts.entries()) {
				if (post === undefined) {
					db.posts.put(posts[index]);
					result.push(posts[index]);
				} else {
					const clone = { ...posts[index] };
					clone.blacklisted = post.blacklisted;
					clone.downloaded = post.downloaded;
					clone.viewCount = post.viewCount;
					clone.downloadedAt = post.downloadedAt;
					db.posts.put(clone);
					result.push(clone);
				}
			}
			return result;
		}
	);
	return savedPosts;
};

export const update = async (post: Post): Promise<number> => {
	return db.transaction('rw', db.posts, db.postsTags, async () => {
		const postClone = { ...post };
		postClone.selected = false;
		return db.posts.update(postClone.id, postClone);
	});
};

export const bulkSave = async (posts: Post[]): Promise<number | void> => {
	return db.transaction('rw', db.posts, db.postsTags, async () => {
		return db.posts.bulkPut(posts);
	});
};

export const getById = async (post: Post): Promise<Post | undefined> => {
	return db.posts.get(post.id);
};

export const getAll = async (): Promise<Post[]> => {
	return db.posts.toArray();
};

export const getBulk = async (keys: number[]): Promise<Post[]> => {
	return db.posts.bulkGet(keys);
};

export const getAllDownloaded = async (): Promise<Post[]> => {
	return db.posts
		.where('downloaded')
		.equals(1)
		.toArray();
};

export const getAllBlacklisted = async (): Promise<Post[]> => {
	return db.posts
		.where('blacklisted')
		.equals(1)
		.toArray();
};

const sortPosts = (posts: Post[], options: FilterOptions): Post[] => {
	switch (options.sort) {
		case 'date-updated':
			return options.sortOrder === 'asc'
				? posts.sort((a, b) => a.createdAt - b.createdAt)
				: posts.sort((a, b) => b.createdAt - a.createdAt);
		case 'date-downloaded':
			console.log(posts);
			return options.sortOrder === 'asc'
				? posts.sort((a, b) => (a.downloadedAt ?? 0) - (b.downloadedAt ?? 0))
				: posts.sort((a, b) => (b.downloadedAt ?? 0) - (a.downloadedAt ?? 0));
		case 'rating':
			return options.sortOrder === 'asc'
				? posts.sort((a, b) => toAscii(a.rating) - toAscii(b.rating))
				: posts.sort((a, b) => toAscii(b.rating) - toAscii(a.rating));
		default:
			return posts;
	}
};

const filterByDownloadedBlacklistedRating = (posts: Post[], options: FilterOptions): Post[] => {
	let result: Post[] = [];
	if (options.blacklisted && options.nonBlacklisted) {
		result = posts.filter((post) => post.downloaded === 1 || post.blacklisted === 1);
	} else if (options.blacklisted && !options.nonBlacklisted) {
		result = posts.filter((post) => post.blacklisted === 1);
	} else if (!options.blacklisted && options.nonBlacklisted) {
		result = posts.filter((post) => post.downloaded === 1);
	}

	result = result.filter((post) => options.rating === 'any' || post.rating === getRatingName(options.rating));
	return result;
};

// CONSIDER - Add cache to not run expensive filtering on fetchMore()
const filterPosts = (posts: Post[], options: FilterOptions): Post[] => {
	let result: Post[] = posts;

	if (!options.showGifs) {
		result = result.filter((post) => post.extension !== 'gif');
	}
	if (!options.showVideos) {
		result = result.filter((post) => !isExtensionVideo(post.extension));
	}
	if (!options.showImages) {
		result = result.filter((post) => isExtensionVideo(post.extension) || post.extension === 'gif');
	}

	return result.slice(options.offset, options.limit + options.offset);
};

export const getAllWithOptions = async (options: FilterOptions): Promise<Post[]> => {
	const posts = await db.posts.offset(0).toArray();
	const filteredFirst = filterByDownloadedBlacklistedRating(posts, options);
	const sorted = sortPosts(filteredFirst, options);
	const filtered = filterPosts(sorted, options);
	return filtered;
};

export const getFavorites = async (): Promise<Post[]> => {
	return db.posts
		.where('favorite')
		.equals(1)
		.toArray()
		.catch((err) => {
			console.error(err);
			throw err;
		});
};

export const getForTagsWithOptions = async (options: FilterOptions, tags: string[], excludedTags?: string[]): Promise<Post[]> => {
	const arrays = await Promise.all(
		tags.map(async (tag) => {
			return db.posts
				.where('tags')
				.equals(tag)
				.toArray();
		})
	);
	if (arrays.length === 0) {
		return [];
	}
	let result = intersection(...arrays);

	if (excludedTags && excludedTags.length > 0) {
		result = result.filter((post) => {
			let found = false;
			for (const tag of post.tags) {
				if (excludedTags.includes(tag)) {
					found = true;
					break;
				}
			}
			return !found;
		});
	}
	const filteredFirst = filterByDownloadedBlacklistedRating(result, options);
	const sorted = sortPosts(filteredFirst, options);
	const filtered = filterPosts(sorted, options);
	return filtered;
};

export const getForTags = async (...tags: string[]): Promise<Post[]> => {
	const arrays: Post[][] = await Promise.all(
		tags.map(async (tag) => {
			const posts = db.posts
				.where('tags')
				.equals(tag)
				.filter((post) => post.downloaded === 1)
				.toArray();
			return posts;
		})
	);
	const result: Post[] = intersection(...arrays);
	return result;
};

export const getBlacklistedForTags = async (...tags: string[]): Promise<Post[]> => {
	const arrays: Post[][] = await Promise.all(
		tags.map(async (tag) => {
			const posts = db.posts
				.where('tags')
				.equals(tag)
				.filter((post) => post.blacklisted === 1)
				.toArray();
			return posts;
		})
	);
	const result: Post[] = intersection(...arrays);
	return result;
};

export const getBlacklistedAndDownloadedForTags = async (...tags: string[]): Promise<Post[]> => {
	const arrays: Post[][] = await Promise.all(
		tags.map(async (tag) => {
			const posts = db.posts
				.where('tags')
				.equals(tag)
				.toArray();
			return posts;
		})
	);
	const result: Post[] = intersection(...arrays);
	return result;
};

export const getDownloadedCount = async (): Promise<number> => {
	return db.posts
		.where('downloaded')
		.equals(1)
		.count();
};

export const getBlacklistedCount = async (): Promise<number> => {
	return db.posts
		.where('blacklisted')
		.equals(1)
		.count();
};

export const getCountForRating = async (rating: Rating): Promise<number> => {
	return db.posts
		.where('rating')
		.equals(getRatingName(rating))
		.filter((post) => post.downloaded === 1)
		.count();
};

export const getMostViewed = async (limit = 20): Promise<Post[]> => {
	const asdf = db.posts
		.orderBy('viewCount')
		.reverse()
		.filter((post) => post.viewCount > 0)
		.limit(limit)
		.toArray();
	return asdf;
};

export const incrementviewcount = async (post: Post): Promise<Post> => {
	const savedPost = await db.transaction(
		'rw',
		db.posts,
		db.postsTags,
		async (): Promise<Post> => {
			const clone = { ...post };
			if (isNaN(clone.viewCount)) {
				clone.viewCount = 0; //TODO remove check after db recreation as viewCount is set to 0 in parser
			}
			clone.viewCount = clone.viewCount + 1;
			await db.posts.put(clone);
			return clone;
		}
	);
	return savedPost;
};
