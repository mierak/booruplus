import { Tag, Post, SavedSearch, SavedSearchPreview } from '../../src/types/gelbooruTypes';
import { Task, Settings, TagHistory, TreeNode } from '@store/types';
import { FavoritesTreeNode } from '../../src/db/types';
import { getImageExtensionFromFilename } from '../../src/util/utils';
import { AnyAction } from 'redux';

export const mTag = (tag?: Partial<Tag>): Tag => {
	return {
		id: tag?.id ?? 123,
		count: tag?.count ?? 123,
		ambiguous: tag?.ambiguous ?? 0,
		tag: tag?.tag ?? 'test-tag',
		type: tag?.type ?? 'artist',
		blacklistedCount: tag?.blacklistedCount ?? 0,
		downloadedCount: tag?.downloadedCount ?? 0,
		favoriteCount: tag?.favoriteCount ?? 0,
	};
};

export const mPost = (post?: Partial<Post>): Post => {
	return {
		id: post?.id ?? 123,
		createdAt: post?.createdAt ?? 1586435438,
		directory: post?.directory ?? '34/9a',
		fileUrl: post?.fileUrl ?? 'https://img2.gelbooru.com/images/34/9a/349ac255514baa60c23fcd25e4effa7e.jpg',
		extension: post?.extension ?? ((post?.fileUrl && getImageExtensionFromFilename(post.fileUrl)) || 'jpg'),
		hash: post?.hash ?? '349ac255514baa60c23fcd25e4effa7e',
		height: post?.height ?? 3541,
		width: post?.width ?? 2508,
		image: post?.image ?? '349ac255514baa60c23fcd25e4effa7e.jpg',
		owner: post?.owner ?? 'gelbooru',
		parentId: post?.parentId ?? null,
		rating: post?.rating ?? 'e',
		sample: post?.sample ?? false,
		sampleHeight: post?.sampleHeight ?? 1200,
		sampleWidth: post?.sampleWidth ?? 850,
		score: post?.score ?? 0,
		selected: post?.selected ?? false,
		source: post?.source ?? 'https://fantia.jp/posts/318668',
		tags: post?.tags ?? ['1girl', 'absurdres', 'all_fours', 'anus_peek', 'ass'],
		viewCount: post?.viewCount ?? 0,
		blacklisted: post?.blacklisted ?? 0,
		downloaded: post?.downloaded ?? 0,
		downloadedAt: post?.downloadedAt,
	};
};

export const mTask = (task?: Partial<Task>): Task => {
	return {
		id: task?.id ?? 123,
		items: task?.items ?? 100,
		itemsDone: task?.itemsDone ?? 50,
		postIds: task?.postIds ?? [1, 2, 3],
		state: task?.state ?? 'downloading',
		timestampStarted: task?.timestampStarted ?? 1000,
		timestampDone: task?.timestampDone ?? 1500,
	};
};

export const mSettings = (settings?: Partial<Settings>): Settings => {
	const dashboard = settings?.dashboard;
	return {
		theme: settings?.theme ?? 'dark',
		imagesFolderPath: settings?.imagesFolderPath ?? '/path/to/images/folder',
		apiKey: settings?.apiKey ?? 'mock_api_key',
		gelbooruUsername: settings?.gelbooruUsername ?? 'gelUser',
		downloadMissingImages: settings?.downloadMissingImages ?? true,
		imageHover: settings?.imageHover ?? true,
		dashboard: settings?.dashboard ?? {
			loadMostFavoritedTags: dashboard?.loadMostFavoritedTags ?? true,
			loadMostSearchedTags: dashboard?.loadMostSearchedTags ?? true,
			loadMostViewedPosts: dashboard?.loadMostViewedPosts ?? true,
			loadRatingDistributionChart: dashboard?.loadRatingDistributionChart ?? true,
			loadTagStatistics: dashboard?.loadTagStatistics ?? true,
			mostViewedCount: dashboard?.mostViewedCount ?? 25,
			saveTagsNotFoundInDb: dashboard?.saveTagsNotFoundInDb ?? true,
		},
		favorites: settings?.favorites ?? {
			siderWidth: settings?.favorites?.siderWidth ?? 250,
			expandedKeys: settings?.favorites?.expandedKeys ?? [],
		},
	};
};

export const mTagHistory = (th?: Partial<TagHistory>): TagHistory => {
	return {
		count: th?.count ?? 123,
		date: th?.date ?? new Date().toUTCString(),
		tag: th?.tag ?? mTag({ id: 123, tag: 'tag_history_tag' }),
	};
};

export const mTreeNode = (tn?: Partial<TreeNode>): TreeNode => {
	return {
		key: tn?.key ?? '1',
		postIds: tn?.postIds ?? [1, 2, 3],
		title: tn?.title ?? 'root',
		children: tn?.children ?? [],
	};
};

export const mFavoritesTreeNode = (ftn?: Partial<FavoritesTreeNode>): FavoritesTreeNode => {
	return {
		key: ftn?.key ?? 0,
		title: ftn?.title ?? 'root',
		parentKey: ftn?.parentKey ?? 0,
		childrenKeys: ftn?.childrenKeys ?? [],
		postIds: ftn?.postIds ?? [],
	};
};

export const mSavedSearch = (ss?: Partial<SavedSearch>): SavedSearch => {
	return {
		id: ss?.id ?? 1,
		previews: ss?.previews ?? [],
		rating: ss?.rating ?? 'explicit',
		lastSearched: ss?.lastSearched,
		tags: ss?.tags ?? [],
		excludedTags: ss?.excludedTags ?? [],
	};
};

export const mSavedSearchPreview = (p?: Partial<SavedSearchPreview>): SavedSearchPreview => {
	return {
		id: p?.id ?? 123,
		objectUrl: p?.objectUrl ?? 'object_url',
		postId: p?.postId ?? mPost().id,
	};
};

export const createAction = (type: string, payload?: unknown): AnyAction => {
	return { type, payload };
};

export const createPendingAction = (type: string, meta?: unknown): AnyAction => {
	return { type, meta };
};

export const createFulfilledAction = (type: string, payload?: unknown, meta?: unknown): AnyAction => {
	return { type, payload, meta };
};
