import { createAsyncThunk } from '@reduxjs/toolkit';

import type { FilterOptions } from '@db/types';
import type { DownloadedSearchFormState, PostsContext, ThunkApi } from '@store/types';
import type { Tag, Post } from '@appTypes/gelbooruTypes';

import { db } from '@db';
import { thunkLoggerFactory } from '@util/logger';
import { thumbnailCache } from '@util/objectUrlCache';

const thunkLogger = thunkLoggerFactory();

export const getFilterOptions = (state: DownloadedSearchFormState): FilterOptions => {
	return {
		blacklisted: state.showBlacklisted,
		nonBlacklisted: state.showNonBlacklisted,
		limit: state.limit,
		offset: state.limit * state.page,
		rating: state.rating,
		sort: state.sort,
		sortOrder: state.sortOrder,
		showGifs: state.showGifs,
		showImages: state.showImages,
		showVideos: state.showVideos,
		showFavorites: state.showFavorites,
	};
};

export const loadTagsByPattern = createAsyncThunk<Tag[], { pattern: string; context: string }, ThunkApi>(
	'downloadedSearchForm/loadTagsByPattern',
	async ({ pattern }): Promise<Tag[]> => {
		const logger = thunkLogger.getActionLogger(loadTagsByPattern);
		logger.debug('Getting tags with Pattern:', pattern);
		return db.tags.getByPattern(pattern);
	}
);

export const fetchPosts = createAsyncThunk<Post[], { context: PostsContext | string }, ThunkApi>(
	'downloadedSearchForm/fetchPosts',
	async ({ context }, thunkApi): Promise<Post[]> => {
		thumbnailCache.revokeAll();
		const logger = thunkLogger.getActionLogger(fetchPosts);
		const state = thunkApi.getState().onlineSearchForm[context];
		if (!('showImages' in state)) {
			return [];
		}

		const filterOptions = getFilterOptions(state);

		const tags = state.selectedTags.map((tag) => tag.tag);
		const excludedTags = state.excludedTags.map((tag) => tag.tag);

		let posts: Post[];
		if (tags.length === 0 && excludedTags.length === 0) {
			logger.debug('Gettings posts from DB with options', JSON.stringify(filterOptions));
			posts = await db.posts.getAllWithOptions(filterOptions);
		} else {
			logger.debug(
				`Gettings posts from DB for Tags [${tags.join(' ')}], Excluded Tags: [${excludedTags.join(' ')}] and options`,
				JSON.stringify(filterOptions)
			);
			posts = await db.posts.getForTagsWithOptions(filterOptions, tags, excludedTags);
		}

		logger.debug(`Saving search history for Tags [${tags.join(' ')}]`);
		db.tagSearchHistory.saveSearch(state.selectedTags);
		return posts;
	}
);

// TODO change to dispatch fetchPosts()
export const fetchMorePosts = createAsyncThunk<Post[], { context: PostsContext | string }, ThunkApi>(
	'downloadedSearchForm/fetchMorePosts',
	async ({ context }, thunkApi): Promise<Post[]> => {
		const logger = thunkLogger.getActionLogger(fetchMorePosts);
		const state = thunkApi.getState().onlineSearchForm[context];
		if (!('showImages' in state)) {
			return [];
		}

		const filterOptions = getFilterOptions(state);

		const tags = state.selectedTags.map((tag) => tag.tag);
		const excludedTags = state.excludedTags.map((tag) => tag.tag);

		let posts: Post[];
		if (tags.length === 0 && excludedTags.length === 0) {
			logger.debug('Gettings posts from DB with options', JSON.stringify(filterOptions));
			posts = await db.posts.getAllWithOptions(filterOptions);
		} else {
			logger.debug(
				`Gettings posts from DB for Tags [${tags.join(' ')}], Excluded Tags: [${excludedTags.join(' ')}] and options`,
				JSON.stringify(filterOptions)
			);
			posts = await db.posts.getForTagsWithOptions(filterOptions, tags, excludedTags);
		}

		return posts;
	}
);
