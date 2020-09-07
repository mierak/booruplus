/* eslint-disable @typescript-eslint/ban-ts-ignore */
import Dexie from 'dexie';
import moment from 'moment';

import { Post, Tag } from '@appTypes/gelbooruTypes';
import { Task } from '@store/types';

import { SettingsPair, SavedSearch, FavoritesTreeNode } from './types';

class Database extends Dexie {
	posts: Dexie.Table<Post, number>;
	savedSearches: Dexie.Table<SavedSearch, number>;
	tags: Dexie.Table<Tag, number>;
	settings: Dexie.Table<SettingsPair, string>;
	tagSearchHistory: Dexie.Table<{ tag: Tag; date: string }, number>;
	favorites: Dexie.Table<FavoritesTreeNode, number>;
	tasks: Dexie.Table<Task, number>;

	constructor(databaseName: string) {
		super(databaseName);
		this.version(2).stores({
			posts: 'id, height, width, rating, *tags, createdAt, favorite, extension, downloaded',
			savedSearches: '++id, tags, type, rating, lastSearched',
			tags: 'id, tag, count, type, ambiguous',
			postsTags: '[postId+tag], postId, tag, post.favorite, post.blacklisted, post.downloaded',
		});
		this.version(3).stores({
			posts: 'id, height, width, rating, *tags, createdAt, favorite, extension, downloaded, blacklisted',
		});
		this.version(4).stores({
			settings: 'name',
		});
		this.version(5).stores({
			tagSearchHistory: 'tag, date',
		});
		this.version(6).stores({
			tagSearchHistory: '++id, tag.tag, date',
		});
		this.version(7).stores({
			posts: 'id, height, width, rating, *tags, createdAt, favorite, extension, downloaded, viewCount',
		});
		this.version(8).stores({
			posts: 'id, height, width, rating, *tags, createdAt, favorite, extension, downloaded, viewCount, blacklisted',
		});
		this.version(9).stores({
			savedSearches: '++id, tags, type, rating, lastSearched, previews.id',
		});
		this.version(10)
			.stores({
				savedSearches: '++id, tags, excludedTags, type, rating, lastSearched, previews.id',
			})
			.upgrade((tx) => {
				return tx
					.table('savedSearches')
					.toCollection()
					.modify((savedSearch) => {
						savedSearch.excludedTags = [];
					});
			});
		this.version(11).stores({
			favoritesTree: 'key',
		});
		this.version(12).stores({
			posts: 'id, rating, *tags, extension, downloaded, viewCount, blacklisted',
		});
		this.version(13).stores({
			posts: 'id, rating, *tags, extension, downloaded, viewCount, blacklisted, favorite',
		});
		this.version(14).stores({
			tasks: 'id, timestampStarted, timestampDone',
		});
		this.version(15).stores({ favorites: '++key' });
		this.version(15).stores({ favoritesTree: null });
		this.version(16).upgrade((tx) => {
			return tx
				.table('posts')
				.toCollection()
				.modify((post) => {
					post.createdAt = moment(post.createdAt).unix();
				});
		});
		this.version(17).upgrade((tx) => {
			return tx
				.table('posts')
				.toCollection()
				.modify((post) => {
					post.downloadedAt = moment().valueOf();
				});
		});
		this.version(18).stores({
			postsTags: null,
		});
		this.version(19).stores({
			posts: 'id, rating, *tags, downloaded, viewCount, blacklisted',
		});
		this.version(20).upgrade((tx) => {
			return tx
				.table('posts')
				.toCollection()
				.modify((post) => {
					post.createdAt = post.createdAt * 1000;
				});
		});
		this.version(21).upgrade((tx) => {
			return tx
				.table('savedSearches')
				.toCollection()
				.modify((ss) => {
					ss.lastSearched = moment(ss.lastSearched).valueOf();
				});
		});
		this.tagSearchHistory = this.table('tagSearchHistory');
		this.settings = this.table('settings');
		this.posts = this.table('posts');
		this.savedSearches = this.table('savedSearches');
		this.tags = this.table('tags');
		this.favorites = this.table('favorites');
		this.tasks = this.table('tasks');
	}
}

const db = new Database('booru_plus');

const favoritesRootNode: FavoritesTreeNode = {
	key: 0,
	title: 'root',
	childrenKeys: [1],
	postIds: [],
	parentKey: 0,
};
const favoritesDefaultNode: FavoritesTreeNode = {
	key: 1,
	title: 'default',
	childrenKeys: [],
	postIds: [],
	parentKey: 0,
};

db.on('populate', async () => {
	const settings: SettingsPair = {
		name: 'default',
		values: {
			imagesFolderPath: 'null',
			theme: 'dark',
			apiKey: undefined,
			downloadMissingImages: true,
			imageHover: true,
			dashboard: {
				mostViewedCount: 28,
				loadMostFavoritedTags: true,
				loadMostSearchedTags: true,
				loadMostViewedPosts: true,
				loadRatingDistributionChart: true,
				loadTagStatistics: true,
				saveTagsNotFoundInDb: true,
			},
			favorites: {
				siderWidth: 250,
				expandedKeys: [],
			},
		},
	};
	db.settings.put(settings);
	db.favorites.put(favoritesRootNode);
	db.favorites.put(favoritesDefaultNode);
});

db.open().catch((err) => {
	console.error('Could not open database: ', err);
});

const checkAndAddFavoritesRootNode = async (): Promise<void> => {
	const root = await db.favorites.get(0);
	if (!root) {
		db.favorites.put(favoritesRootNode);
	} else if (!root.childrenKeys.includes(1)) {
		const newRoot = { ...root, childrenKeys: [1, ...root.childrenKeys] };
		db.favorites.put(newRoot);
	}

	const defaultNode = await db.favorites.get(1);
	if (!defaultNode) {
		db.favorites.put(favoritesDefaultNode);
	}
};
checkAndAddFavoritesRootNode();

export default db;
