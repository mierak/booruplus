import db from './database';

import { Post, Rating } from '@appTypes/gelbooruTypes';
import { intersection, getRatingName, isExtensionVideo, toAscii } from '@util/utils';

import { FilterOptions } from './types';

export const saveOrUpdateFromApi = async (post: Post): Promise<Post> => {
	const clone: Post = { ...post };
	const savedPost = await db.posts.get(clone.id);
	if (savedPost) {
		clone.blacklisted = savedPost.blacklisted;
		clone.downloaded = savedPost.downloaded;
		clone.viewCount = savedPost.viewCount;
		clone.selected = false;
	}
	db.posts.put(clone);
	return clone;
};

export const bulkUpdateFromApi = async (posts: Post[]): Promise<Post[]> => {
	const savedPosts = await db.posts.bulkGet(posts.map((post) => post.id));
	const result: Post[] = [];
	for (const [index, post] of savedPosts.entries()) {
		if (post === undefined) {
			result.push(posts[index]);
		} else {
			const clone = { ...posts[index] };
			clone.blacklisted = post.blacklisted;
			clone.downloaded = post.downloaded;
			clone.viewCount = post.viewCount;
			clone.downloadedAt = post.downloadedAt;
			clone.selected = false;
			db.posts.put(clone);
			result.push(clone);
		}
	}
	return result;
};

export const put = async (post: Post): Promise<number> => {
	return db.posts.put(post);
};

export const bulkSave = async (posts: Post[]): Promise<number | void> => {
	return db.posts.bulkPut(posts.map((post) => ({ ...post, selected: false })));
};

export const getAll = async (): Promise<Post[]> => {
	return db.posts.toArray();
};

export const getBulk = async (keys: number[]): Promise<Post[]> => {
	return db.posts.bulkGet(keys);
};

export const getAllDownloaded = async (): Promise<Post[]> => {
	return db.posts.where('downloaded').equals(1).toArray();
};

export const getAllBlacklisted = async (): Promise<Post[]> => {
	return db.posts.where('blacklisted').equals(1).toArray();
};

const sortPosts = (posts: Post[], options: FilterOptions): Post[] => {
	switch (options.sort) {
		case 'date-updated':
			return options.sortOrder === 'asc'
				? posts.sort((a, b) => a.createdAt - b.createdAt)
				: posts.sort((a, b) => b.createdAt - a.createdAt);
		case 'date-downloaded':
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
	const filterCallback = (post: Post): boolean => {
		let result = true;
		if (options.blacklisted && options.nonBlacklisted) {
			result = post.downloaded === 1 || post.blacklisted === 1;
		} else if (options.blacklisted && !options.nonBlacklisted) {
			result = post.blacklisted === 1;
		} else if (!options.blacklisted && options.nonBlacklisted) {
			result = post.downloaded === 1;
		}
		return result && (options.rating === 'any' || post.rating === getRatingName(options.rating));
	};

	return posts.filter(filterCallback);
};

const filterPosts = (posts: Post[], options: FilterOptions): Post[] => {
	const filterCallback = (post: Post): boolean => {
		let res = true;
		if (!options.showGifs) {
			res = res && post.extension !== 'gif';
		}
		if (!options.showVideos) {
			res = res && !isExtensionVideo(post.extension);
		}
		if (!options.showImages) {
			res = res && (isExtensionVideo(post.extension) || post.extension === 'gif');
		}
		return res;
	};
	const result = posts.filter(filterCallback);

	return result.slice(options.offset, options.limit + options.offset);
};

export const getAllWithOptions = async (options: FilterOptions): Promise<Post[]> => {
	let posts = await db.posts.toArray();
	if (!options.showFavorites) {
		const allFavoriteIds = Array.from(new Set((await db.favorites.toArray()).flatMap((node) => node.postIds)));
		posts = posts.filter(post => !allFavoriteIds.includes(post.id));
	}
	const filteredFirst = filterByDownloadedBlacklistedRating(posts, options);
	const sorted = sortPosts(filteredFirst, options);
	const filtered = filterPosts(sorted, options);
	return filtered;
};

export const getForTagsWithOptions = async (
	options: FilterOptions,
	tags: string[],
	excludedTags?: string[]
): Promise<Post[]> => {
	const arrays = await Promise.all(
		tags.map(async (tag) => {
			return db.posts.where('tags').equals(tag).toArray();
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

export const getDownloadedCount = async (): Promise<number> => {
	return db.posts.where('downloaded').equals(1).count();
};

export const getBlacklistedCount = async (): Promise<number> => {
	return db.posts.where('blacklisted').equals(1).count();
};

export const getCountForRating = async (rating: Rating): Promise<number> => {
	return db.posts
		.where('rating')
		.equals(getRatingName(rating))
		.filter((post) => post.downloaded === 1)
		.count();
};

export const getMostViewed = async (limit = 20): Promise<Post[]> => {
	return db.posts
		.orderBy('viewCount')
		.reverse()
		.filter((post) => post.viewCount > 0)
		.limit(limit)
		.toArray();
};
