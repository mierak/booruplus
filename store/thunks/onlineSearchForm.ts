import { createAsyncThunk } from '@reduxjs/toolkit';

import * as api from 'service/apiService';
import { db } from 'db';

import { ThunkApi, RootState } from 'store/types';
import { Post, Tag, PostSearchOptions } from 'types/gelbooruTypes';

const getPostApiOptions = (state: RootState, incrementPage?: boolean): PostSearchOptions => {
	return {
		limit: state.onlineSearchForm.limit,
		page: incrementPage ? state.onlineSearchForm.page + 1 : state.onlineSearchForm.page,
		rating: state.onlineSearchForm.rating,
		apiKey: state.settings.apiKey,
	};
};

const checkPostsAgainstDb = createAsyncThunk<Post[], Post[], ThunkApi>(
	'posts/checkPostsAgainstdb',
	async (posts, _): Promise<Post[]> => {
		const result = db.posts.bulkSaveOrUpdateFromApi(posts);
		return result;
	}
);

const fetchPosts = createAsyncThunk<Post[], void, ThunkApi>(
	'posts/fetchPosts',
	async (_, thunkApi): Promise<Post[]> => {
		const { dispatch } = thunkApi;
		const getState = thunkApi.getState;

		const options = getPostApiOptions(getState());
		const excludedTagString = getState().onlineSearchForm.excludededTags.map((tag) => tag.tag);
		const tagsString = getState().onlineSearchForm.selectedTags.map((tag) => tag.tag);

		const posts = await api.getPostsForTags(tagsString, options, excludedTagString);

		db.tagSearchHistory.saveSearch(getState().onlineSearchForm.selectedTags);
		dispatch(checkPostsAgainstDb(posts));

		return posts;
	}
);

const getTagsByPatternFromApi = createAsyncThunk<Tag[], string, ThunkApi>(
	'posts/getTagsByPatternFromApi',
	async (value: string, thunkApi): Promise<Tag[]> => {
		return api.getTagsByPattern(value, thunkApi.getState().settings.apiKey);
	}
);

const fetchMorePosts = createAsyncThunk<Post[], void, ThunkApi>(
	'posts/fetchMorePosts',
	async (_, thunkApi): Promise<Post[]> => {
		const getState = thunkApi.getState;

		const options = getPostApiOptions(getState(), true);
		const excludedTagString = getState().onlineSearchForm.excludededTags.map((tag) => tag.tag);
		const tagsString = getState().onlineSearchForm.selectedTags.map((tag) => tag.tag);

		const posts = await api.getPostsForTags(tagsString, options, excludedTagString);
		thunkApi.dispatch(checkPostsAgainstDb(posts));

		return posts;
	}
);

export const onlineSearchFormThunk = {
	getTagsByPatternFromApi,
	fetchMorePosts,
	fetchPosts,
	checkPostsAgainstDb,
};
