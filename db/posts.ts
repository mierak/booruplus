import db from './database';
import { Post } from '../types/gelbooruTypes';
import { intersection } from '../util/utils';

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

export const getFavorites = async (): Promise<Post[]> => {
	// const uniquePostIds = await database.postsTags.orderBy('postId').uniqueKeys();
	// console.log('uniquePostIds', uniquePostIds);
	// uniquePostIds.forEach((postId) => {
	// 	database.postsTags.where();
	// });

	// console.log(
	// 	await database.postsTags
	// 		.where('post.favorite')
	// 		.equals(1)
	// 		.count()
	// ); //TODO group by postid? Most favorited tag -
	return db.posts
		.where('favorite')
		.equals(1)
		.toArray()
		.catch((err) => {
			console.error(err);
			throw err;
		});
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
