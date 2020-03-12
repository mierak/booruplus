import Dexie from 'dexie';
import 'dexie-export-import';
import { Post, SavedSearch, Tag } from '../types/gelbooruTypes';
import { intersection } from '../util/utils';

class Database extends Dexie {
	posts: Dexie.Table<Post, number>;
	savedSearches: Dexie.Table<SavedSearch, number>;
	tags: Dexie.Table<Tag, number>;

	constructor(databaseName: string) {
		super(databaseName);
		this.version(1).stores({
			posts:
				'id, source, directory, hash, height, width, owner, parentId, rating, sample, sampleHeight, sampleWidth, score, *tags, fileUrl, createdAt, image, favorite',
			savedSearches: '++id, tags, type, rating, lastSearched',
			tags: 'id, tag, count, type, ambiguous'
		});
		this.posts = this.table('posts');
		this.savedSearches = this.table('savedSearches');
		this.tags = this.table('tags');
	}
}

const database = new Database('lolinizerDb');

database.open().catch((err) => {
	console.error('Could not open database: ', err);
});

//Tag
export const saveTag = async (tag: Tag): Promise<number | void> => {
	return database.tags.put(tag).catch((err) => {
		console.error(err);
		throw err;
	});
};

export const saveTags = async (tags: Tag[]): Promise<number | void> => {
	return database.tags.bulkPut(tags).catch((err) => {
		console.error(err);
		throw err;
	});
};

export const loadTags = async (): Promise<Tag[] | void> => {
	const tags = await database.tags.toArray().catch((err) => {
		console.error(err);
		throw err;
	});
	return tags;
};

//SavedSearch
export const saveSearch = async (savedSearch: SavedSearch): Promise<number | void> => {
	return database.savedSearches.put(savedSearch).catch((err) => {
		console.error(err);
		throw err;
	});
};

export const getSavedSearches = async (): Promise<SavedSearch[] | void> => {
	const savedSearches = await database.savedSearches.toArray().catch((err) => {
		console.error(err);
		throw err;
	});
	return savedSearches;
};

export const deleteSavedSearch = async (savedSearch: SavedSearch): Promise<void> => {
	savedSearch.id &&
		database.savedSearches.delete(savedSearch.id).catch((err) => {
			console.error(err);
			throw err;
		});
};

//Post
export const saveOrUpdatePostFromApi = async (post: Post): Promise<Post> => {
	const savedPost = await database.posts.get(post.id);
	if (savedPost) {
		post.favorite = savedPost.favorite;
	}
	database.posts.put(post).catch((err) => {
		console.error(err);
		throw err;
	});
	return post;
};

export const updatePostInDb = async (post: Post): Promise<number | void> => {
	post.selected = false;
	return database.posts.update(post.id, post).catch((err) => {
		console.error(err);
		throw err;
	});
};

export const bullUpdatePostsInDb = async (posts: Post[]): Promise<number | void> => {
	return database.posts.bulkPut(posts).catch((err) => {
		console.error(err);
		throw err;
	});
};

export const getFavoritePosts = async (): Promise<Post[]> => {
	return database.posts
		.where('favorite')
		.equals(1)
		.toArray()
		.catch((err) => {
			console.error(err);
			throw err;
		});
};

export const getPostsForTags = async (...tags: string[]): Promise<Post[]> => {
	const arrays: Post[][] = await Promise.all(
		tags.map(async (tag) => {
			const posts = database.posts
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

export const getPostCountForTag = async (tag: string): Promise<number> => {
	return database.posts
		.where('tags')
		.equals(tag)
		.count();
};

export default database;
