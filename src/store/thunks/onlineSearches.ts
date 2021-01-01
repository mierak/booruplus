import { createAsyncThunk } from '@reduxjs/toolkit';

import type { Post, Tag, PostSearchOptions } from '@appTypes/gelbooruTypes';
import type { PostsContext, RootState, ThunkApi } from '@store/types';

import { db } from '@db';
import * as api from '@service/apiService';
import { getActionLogger } from '@util/logger';
import { thumbnailCache } from '@util/objectUrlCache';

export const getPostApiOptions = (state: RootState, context: string, incrementPage?: boolean): PostSearchOptions => {
	return {
		limit: state.searchContexts[context].limit,
		page: incrementPage ? state.searchContexts[context].page + 1 : state.searchContexts[context].page,
		rating: state.searchContexts[context].rating,
		apiKey: state.settings.apiKey,
		sort: state.searchContexts[context].sort,
		sortOrder: state.searchContexts[context].sortOrder,
	};
};

export const checkPostsAgainstDb = createAsyncThunk<
	Post[],
	{ posts: Post[]; context: PostsContext | string },
	ThunkApi
>(
	'onlineSearchForm/checkPostsAgainstDb',
	async ({ posts }, _): Promise<Post[]> => {
		const logger = getActionLogger(checkPostsAgainstDb);
		logger.debug(`Checking ${posts.length} posts against DB to save or update`);
		const result = db.posts.bulkUpdateFromApi(posts);
		return result;
	}
);

export const fetchPosts = createAsyncThunk<Post[], { context: PostsContext | string }, ThunkApi>(
	'onlineSearchForm/fetchPosts',
	async ({ context }, thunkApi): Promise<Post[]> => {
		thumbnailCache.revokeAll();
		const logger = getActionLogger(fetchPosts);
		const { dispatch } = thunkApi;
		const getState = thunkApi.getState;

		const options = getPostApiOptions(getState(), context);
		const excludedTagString = getState().searchContexts[context].excludedTags.map((tag) => tag.tag);
		const tagsString = getState().searchContexts[context].selectedTags.map((tag) => tag.tag);

		logger.debug(
			`Fetching posts from api. Selected Tags: [${tagsString}]. Excluded Tags: [${excludedTagString}]. API Options:`,
			JSON.stringify({
				...options,
				apiKey: 'redacted',
			})
		);
		const posts = await api.getPostsForTags(tagsString, options, excludedTagString);

		logger.debug(`Saving search to history for tags [${tagsString}]`);
		db.tagSearchHistory.saveSearch(getState().searchContexts[context].selectedTags);
		await dispatch(checkPostsAgainstDb({ posts, context }));

		return posts;
	}
);

export const getTagsByPatternFromApi = createAsyncThunk<Tag[], { pattern: string; context: string }, ThunkApi>(
	'onlineSearchForm/getTagsByPatternFromApi',
	async ({ pattern }, thunkApi): Promise<Tag[]> => {
		const logger = getActionLogger(getTagsByPatternFromApi);
		logger.debug(`Gettings tags from API. Pattern: ${pattern}`);
		return api.getTagsByPattern(pattern, thunkApi.getState().settings.apiKey);
	}
);

export const fetchMorePosts = createAsyncThunk<Post[], { context: PostsContext | string }, ThunkApi>(
	'onlineSearchForm/fetchMorePosts',
	async ({ context }, thunkApi): Promise<Post[]> => {
		const logger = getActionLogger(fetchMorePosts);
		const getState = thunkApi.getState;

		const options = getPostApiOptions(getState(), context, true);
		const excludedTagString = getState().searchContexts[context].excludedTags.map((tag) => tag.tag);
		const tagsString = getState().searchContexts[context].selectedTags.map((tag) => tag.tag);

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
