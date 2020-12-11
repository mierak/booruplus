import { createAsyncThunk } from '@reduxjs/toolkit';

import * as api from '@service/apiService';
import { db } from '@db';
import { ThunkApi, RootState } from '@store/types';
import { Post, Tag, PostSearchOptions } from '@appTypes/gelbooruTypes';
import { thunkLoggerFactory } from '@util/logger';
import { thumbnailCache } from '@util/objectUrlCache';

const thunkLogger = thunkLoggerFactory();

export const getPostApiOptions = (state: RootState, incrementPage?: boolean): PostSearchOptions => {
	return {
		limit: state.onlineSearchForm.limit,
		page: incrementPage ? state.onlineSearchForm.page + 1 : state.onlineSearchForm.page,
		rating: state.onlineSearchForm.rating,
		apiKey: state.settings.apiKey,
		sort: state.onlineSearchForm.sort,
		sortOrder: state.onlineSearchForm.sortOrder,
	};
};

export const checkPostsAgainstDb = createAsyncThunk<Post[], Post[], ThunkApi>(
	'onlineSearchForm/checkPostsAgainstDb',
	async (posts, _): Promise<Post[]> => {
		const logger = thunkLogger.getActionLogger(checkPostsAgainstDb);
		logger.debug(`Checking ${posts.length} posts against DB to save or update`);
		const result = db.posts.bulkUpdateFromApi(posts);
		return result;
	}
);

export const fetchPosts = createAsyncThunk<Post[], void, ThunkApi>(
	'onlineSearchForm/fetchPosts',
	async (_, thunkApi): Promise<Post[]> => {
		thumbnailCache.revokeAll();
		const logger = thunkLogger.getActionLogger(fetchPosts);
		const { dispatch } = thunkApi;
		const getState = thunkApi.getState;

		const options = getPostApiOptions(getState());
		const excludedTagString = getState().onlineSearchForm.excludedTags.map((tag) => tag.tag);
		const tagsString = getState().onlineSearchForm.selectedTags.map((tag) => tag.tag);

		logger.debug(
			`Fetching posts from api. Selected Tags: [${tagsString}]. Excluded Tags: [${excludedTagString}]. API Options:`,
			JSON.stringify({
				...options,
				apiKey: 'redacted',
			})
		);
		const posts = await api.getPostsForTags(tagsString, options, excludedTagString);

		logger.debug(`Saving search to history for tags [${tagsString}]`);
		db.tagSearchHistory.saveSearch(getState().onlineSearchForm.selectedTags);
		await dispatch(checkPostsAgainstDb(posts));

		return posts;
	}
);

export const getTagsByPatternFromApi = createAsyncThunk<Tag[], string, ThunkApi>(
	'onlineSearchForm/getTagsByPatternFromApi',
	async (value: string, thunkApi): Promise<Tag[]> => {
		const logger = thunkLogger.getActionLogger(getTagsByPatternFromApi);
		logger.debug(`Gettings tags from API. Pattern: ${value}`);
		return api.getTagsByPattern(value, thunkApi.getState().settings.apiKey);
	}
);

export const fetchMorePosts = createAsyncThunk<Post[], void, ThunkApi>(
	'onlineSearchForm/fetchMorePosts',
	async (_, thunkApi): Promise<Post[]> => {
		const logger = thunkLogger.getActionLogger(fetchMorePosts);
		const getState = thunkApi.getState;

		const options = getPostApiOptions(getState(), true);
		const excludedTagString = getState().onlineSearchForm.excludedTags.map((tag) => tag.tag);
		const tagsString = getState().onlineSearchForm.selectedTags.map((tag) => tag.tag);

		logger.debug(
			`Fetching posts from api. Selected Tags: [${tagsString}]. Excluded Tags: [${excludedTagString}]. API Options:`,
			JSON.stringify({
				...options,
				apiKey: 'redacted',
			})
		);
		const posts = await api.getPostsForTags(tagsString, options, excludedTagString);
		await thunkApi.dispatch(checkPostsAgainstDb(posts));

		return posts;
	}
);
