import { createAsyncThunk } from '@reduxjs/toolkit';

import { db } from '../../db';
import { FilterOptions } from '../../db/types';

import { ThunkApi } from '../../store/types';
import { DownloadedSearchFormState } from '../../store/downloadedSearchForm';

import { Tag, Post } from '../../types/gelbooruTypes';
import { thunkLoggerFactory } from '../../util/logger';

const thunkLogger = thunkLoggerFactory();

export const getFilterOptions = (state: DownloadedSearchFormState): FilterOptions => {
	return {
		blacklisted: state.showBlacklisted,
		nonBlacklisted: state.showNonBlacklisted,
		limit: state.postLimit,
		offset: state.postLimit * state.page,
		rating: state.rating,
		sort: state.sort,
		sortOrder: state.sortOrder,
		showGifs: state.showGifs,
		showImages: state.showImages,
		showVideos: state.showVideos,
		showFavorites: state.showFavorites,
	};
};

export const loadTagsByPattern = createAsyncThunk<Tag[], string, ThunkApi>(
	'downloadedSearchForm/loadTagsByPattern',
	async (pattern): Promise<Tag[]> => {
		const logger = thunkLogger.getActionLogger(loadTagsByPattern);
		logger.debug('Getting tags with Pattern:', pattern);
		return db.tags.getByPattern(pattern);
	}
);

export const fetchPosts = createAsyncThunk<Post[], void, ThunkApi>(
	'downloadedSearchForm/fetchPosts',
	async (_, thunkApi): Promise<Post[]> => {
		const logger = thunkLogger.getActionLogger(fetchPosts);
		const state = thunkApi.getState();

		const filterOptions = getFilterOptions(state.downloadedSearchForm);

		const tags = state.downloadedSearchForm.selectedTags.map((tag) => tag.tag);
		const excludedTags = state.downloadedSearchForm.excludedTags.map((tag) => tag.tag);

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
		db.tagSearchHistory.saveSearch(state.downloadedSearchForm.selectedTags);
		return posts;
	}
);

// TODO change to dispatch fetchPosts()
export const fetchMorePosts = createAsyncThunk<Post[], void, ThunkApi>(
	'downloadedSearchForm/fetchMorePosts',
	async (_, thunkApi): Promise<Post[]> => {
		const logger = thunkLogger.getActionLogger(fetchMorePosts);
		const state = thunkApi.getState();

		const filterOptions = getFilterOptions(state.downloadedSearchForm);

		const tags = state.downloadedSearchForm.selectedTags.map((tag) => tag.tag);
		const excludedTags = state.downloadedSearchForm.excludedTags.map((tag) => tag.tag);

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
