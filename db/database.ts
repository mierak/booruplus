import Dexie from 'dexie';
import 'dexie-export-import';
import { Post, SavedSearch } from '../types/gelbooruTypes';

class Database extends Dexie {
	posts: Dexie.Table<Post, number>;
	savedSearches: Dexie.Table<SavedSearch, number>;

	constructor(databaseName: string) {
		super(databaseName);
		this.version(1).stores({
			posts:
				'id, source, directory, hash, height, width, owner, parent_id, rating, sample, sample_height, sample_width, score, tags, file_url, created_at, image, favorite',
			savedSearches: '++id, tags, type'
		});
		this.posts = this.table('posts');
		this.savedSearches = this.table('savedSearches');
	}
}

const database = new Database('lolinizerDb');

database.open().catch((err) => {
	console.error('Could not open database: ', err);
});

export const saveSearch = async (savedSearch: SavedSearch): Promise<number | void> => {
	return database.savedSearches.put(savedSearch).catch((err) => console.error(err));
};

export const getSavedSearches = async (): Promise<SavedSearch[] | void> => {
	const SavedSearches = await database.savedSearches.toArray().catch((err) => console.error(err));
	return SavedSearches;
};

export const saveOrUpdatePostFromApi = async (post: Post): Promise<Post> => {
	const savedPost = await database.posts.get(post.id);
	if (savedPost) {
		post.favorite = savedPost.favorite;
	}
	database.posts.put(post);
	return post;
};

export const updatePost = async (post: Post): Promise<number | void> => {
	return database.posts.update(post.id, post).catch((err) => console.error(err));
};

export const getFavoritePosts = async (): Promise<Post[]> => {
	return database.posts
		.where('favorite')
		.equals(1)
		.toArray();
};

export default database;
