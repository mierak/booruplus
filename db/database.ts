import Dexie from 'dexie';
import 'dexie-export-import';
import { Post } from '../types/gelbooruTypes';

class Database extends Dexie {
	posts: Dexie.Table<Post, number>;

	constructor(databaseName: string) {
		super(databaseName);
		this.version(1).stores({
			posts:
				'id, source, directory, hash, height, width, owner, parent_id, rating, sample, sample_height, sample_width, score, tags, file_url, created_at, image, favorite'
		});
		this.posts = this.table('posts');
	}
}

const database = new Database('lolinizerDb');

database.open().catch((err) => {
	console.error('Could not open database: ', err);
});

export const saveOrUpdatePost = async (post: Post): Promise<void> => {
	const savedPost = await database.posts.get(post.id);
	if (savedPost) {
		post.favorite = savedPost.favorite;
	}
	database.posts.put(post);
};

export default database;
