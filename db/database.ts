/* eslint-disable @typescript-eslint/ban-ts-ignore */
import Dexie from 'dexie';
import { Post, SavedSearch, Tag, PostTag } from '../types/gelbooruTypes';
import { SettingsPair } from './types';

class Database extends Dexie {
	posts: Dexie.Table<Post, number>;
	savedSearches: Dexie.Table<SavedSearch, number>;
	tags: Dexie.Table<Tag, number>;
	postsTags: Dexie.Table<PostTag, number>;
	settings: Dexie.Table<SettingsPair, string>;

	constructor(databaseName: string) {
		super(databaseName);
		this.version(2).stores({
			posts: 'id, height, width, rating, *tags, createdAt, favorite, extension, downloaded',
			savedSearches: '++id, tags, type, rating, lastSearched',
			tags: 'id, tag, count, type, ambiguous',
			postsTags: '[postId+tag], postId, tag, post.favorite, post.blacklisted, post.downloaded'
		});
		this.version(3).stores({
			posts: 'id, height, width, rating, *tags, createdAt, favorite, extension, downloaded, blacklisted'
		});
		this.version(4).stores({
			settings: 'name'
		});
		this.settings = this.table('settings');
		this.posts = this.table('posts');
		this.savedSearches = this.table('savedSearches');
		this.tags = this.table('tags');
		this.postsTags = this.table('postsTags');
	}
}

const db = new Database('lolinizerDb');

db.on('populate', () => {
	const settings: SettingsPair = {
		name: 'default',
		values: {
			imagesFolderPath: 'C:\\temp' // TODO change to userfolder
		}
	};
	db.settings.put(settings);
});

db.open().catch((err) => {
	console.error('Could not open database: ', err);
});

db.posts.hook('creating', (primKey, post) => {
	post.tags.forEach((tag) => {
		db.postsTags.put({ postId: post.id, tag: tag, post: post });
	});
});

db.posts.hook('updating', (mods, primKey, post) => {
	const clonedPost = Object.assign({}, post);

	const favorite = Object.prototype.hasOwnProperty.call(mods, 'favorite');
	const blacklisted = Object.prototype.hasOwnProperty.call(mods, 'blacklisted');
	const downloaded = Object.prototype.hasOwnProperty.call(mods, 'downloaded');

	// @ts-ignore
	favorite && mods['favorite'] !== undefined && (clonedPost.favorite = mods['favorite']);
	// @ts-ignore
	blacklisted && mods['blacklisted'] !== undefined && (clonedPost.blacklisted = mods['blacklisted']);
	// @ts-ignore
	downloaded && mods['downloaded'] !== undefined && (clonedPost.downloaded = mods['downloaded']);

	post.tags.forEach((tag) => {
		db.postsTags.put({
			post: clonedPost,
			postId: post.id,
			tag: tag
		});
	});
});

//Post

export default db;
