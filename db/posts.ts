import db from './database';

import { Post, Rating } from '../types/gelbooruTypes';
import { FilterOptions } from './types';
import { intersection, getRatingName, isExtensionVideo } from '../util/utils';

export const saveOrUpdateFromApi = async (post: Post): Promise<Post> => {
	const savedPost = await db.transaction(
		'rw',
		db.posts,
		db.postsTags,
		async (): Promise<Post> => {
			const savedPost = await db.posts.get(post.id);
			if (savedPost) {
				post.favorite = savedPost.favorite;
				post.blacklisted = savedPost.blacklisted;
				post.downloaded = savedPost.downloaded;
				post.viewCount = savedPost.viewCount;
			}
			db.posts.put(post).catch((err) => {
				console.error(err);
				throw err;
			});
			return post;
		}
	);
	return savedPost;
};

export const update = async (post: Post): Promise<number | void> => {
	return db.transaction('rw', db.posts, db.postsTags, async () => {
		const postClone = Object.assign({}, post);
		postClone.selected = false;
		return db.posts.update(postClone.id, postClone).catch((err) => {
			console.error(err);
			throw err;
		});
	});
};

export const updateBulk = async (posts: Post[]): Promise<number | void> => {
	return db.posts.bulkPut(posts).catch((err) => {
		console.error(err);
		throw err;
	});
};

export const getById = async (post: Post): Promise<Post | undefined> => {
	return db.posts.get(post.id);
};

export const getAll = async (): Promise<Post[]> => {
	return db.posts.toArray();
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

// CONSIDER - Add cache to not run expensive filtering on fetchMore()
const filterPosts = (posts: Post[], options: FilterOptions): Post[] => {
	let result: Post[] = [];
	if (options.blacklisted && options.nonBlacklisted) {
		result = posts.filter((post) => post.downloaded === 1 || post.blacklisted === 1);
	} else if (options.blacklisted && !options.nonBlacklisted) {
		result = posts.filter((post) => post.blacklisted === 1);
	} else if (!options.blacklisted && options.nonBlacklisted) {
		result = posts.filter((post) => post.downloaded === 1);
	}

	result = result.filter((post) => options.rating === 'any' || post.rating === getRatingName(options.rating));

	if (!options.showGifs) {
		result = result.filter((post) => post.extension !== 'gif');
	}
	if (!options.showVideos) {
		result = result.filter((post) => !isExtensionVideo(post.extension));
	}
	if (!options.showImages) {
		result = result.filter((post) => isExtensionVideo(post.extension) || post.extension === 'gif');
	}
	if (!options.showFavorites) {
		result = result.filter((post) => post.favorite !== 1);
	}

	return result.slice(options.offset, options.limit + options.offset);
};

export const getAllWithOptions = async (options: FilterOptions): Promise<Post[]> => {
	const posts = await db.posts.offset(0).toArray();
	const filteredPosts = filterPosts(posts, options);
	return filteredPosts;
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

export const getForTagsWithOptions = async (options: FilterOptions, ...tags: string[]): Promise<Post[]> => {
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
	const result = intersection(...arrays);
	return filterPosts(result, options);
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

export const getFavoriteCount = async (): Promise<number> => {
	return db.posts
		.where('favorite')
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
			const clone = Object.assign({}, post);
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
