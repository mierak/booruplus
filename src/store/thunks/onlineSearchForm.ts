import { createAsyncThunk } from '@reduxjs/toolkit';

import * as api from '@service/apiService';
import { db } from '@db';
import { ThunkApi, RootState, PostsContext } from '@store/types';
import { Post, Tag, PostSearchOptions } from '@appTypes/gelbooruTypes';
import { thunkLoggerFactory } from '@util/logger';
import { thumbnailCache } from '@util/objectUrlCache';

const thunkLogger = thunkLoggerFactory();

export const getPostApiOptions = (state: RootState, context: string, incrementPage?: boolean): PostSearchOptions => {
	return {
		limit: state.onlineSearchForm[context].limit,
		page: incrementPage ? state.onlineSearchForm[context].page + 1 : state.onlineSearchForm[context].page,
		rating: state.onlineSearchForm[context].rating,
		apiKey: state.settings.apiKey,
		sort: state.onlineSearchForm[context].sort,
		sortOrder: state.onlineSearchForm[context].sortOrder,
	};
};

export const checkPostsAgainstDb = createAsyncThunk<
	Post[],
	{ posts: Post[]; context: PostsContext | string },
	ThunkApi
>(
	'onlineSearchForm/checkPostsAgainstDb',
	async ({ posts }, _): Promise<Post[]> => {
		const logger = thunkLogger.getActionLogger(checkPostsAgainstDb);
		logger.debug(`Checking ${posts.length} posts against DB to save or update`);
		const result = db.posts.bulkUpdateFromApi(posts);
		return result;
	}
);

export const fetchPosts = createAsyncThunk<Post[], { context: PostsContext | string }, ThunkApi>(
	'onlineSearchForm/fetchPosts',
	async ({ context }, thunkApi): Promise<Post[]> => {
		thumbnailCache.revokeAll();
		const logger = thunkLogger.getActionLogger(fetchPosts);
		const { dispatch } = thunkApi;
		const getState = thunkApi.getState;

		const options = getPostApiOptions(getState(), context);
		const excludedTagString = getState().onlineSearchForm[context].excludedTags.map((tag) => tag.tag);
		const tagsString = getState().onlineSearchForm[context].selectedTags.map((tag) => tag.tag);

		logger.debug(
			`Fetching posts from api. Selected Tags: [${tagsString}]. Excluded Tags: [${excludedTagString}]. API Options:`,
			JSON.stringify({
				...options,
				apiKey: 'redacted',
			})
		);
		const posts = await api.getPostsForTags(tagsString, options, excludedTagString);

		logger.debug(`Saving search to history for tags [${tagsString}]`);
		db.tagSearchHistory.saveSearch(getState().onlineSearchForm[context].selectedTags);
		await dispatch(checkPostsAgainstDb({ posts, context }));

		return posts;
	}
);

export const getTagsByPatternFromApi = createAsyncThunk<Tag[], { pattern: string; context: string }, ThunkApi>(
	'onlineSearchForm/getTagsByPatternFromApi',
	async ({ pattern }, thunkApi): Promise<Tag[]> => {
		const logger = thunkLogger.getActionLogger(getTagsByPatternFromApi);
		logger.debug(`Gettings tags from API. Pattern: ${pattern}`);
		return api.getTagsByPattern(pattern, thunkApi.getState().settings.apiKey);
	}
);

export const fetchMorePosts = createAsyncThunk<Post[], { context: PostsContext | string }, ThunkApi>(
	'onlineSearchForm/fetchMorePosts',
	async ({ context }, thunkApi): Promise<Post[]> => {
		const logger = thunkLogger.getActionLogger(fetchMorePosts);
		const getState = thunkApi.getState;

		const options = getPostApiOptions(getState(), context, true);
		const excludedTagString = getState().onlineSearchForm[context].excludedTags.map((tag) => tag.tag);
		const tagsString = getState().onlineSearchForm[context].selectedTags.map((tag) => tag.tag);

		logger.debug(
			`Fetching posts from api. Selected Tags: [${tagsString}]. Excluded Tags: [${excludedTagString}]. API Options:`,
			JSON.stringify({
				...options,
				apiKey: 'redacted',
			})
		);
		const posts = await api.getPostsForTags(tagsString, options, excludedTagString);
		await thunkApi.dispatch(checkPostsAgainstDb({ posts, context }));

		return posts;
	}
);
