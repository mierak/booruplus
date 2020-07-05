import { createAsyncThunk } from '@reduxjs/toolkit';

import * as api from '../../service/apiService';
import { db } from '../../db';

import { ThunkApi, RootState } from '../types';
import { Post, Tag, PostSearchOptions } from '../../types/gelbooruTypes';

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
		const result = db.posts.bulkSaveOrUpdateFromApi(posts);
		return result;
	}
);

export const fetchPosts = createAsyncThunk<Post[], void, ThunkApi>(
	'onlineSearchForm/fetchPosts',
	async (_, thunkApi): Promise<Post[]> => {
		const { dispatch } = thunkApi;
		const getState = thunkApi.getState;

		const options = getPostApiOptions(getState());
		const excludedTagString = getState().onlineSearchForm.excludedTags.map((tag) => tag.tag);
		const tagsString = getState().onlineSearchForm.selectedTags.map((tag) => tag.tag);

		const posts = await api.getPostsForTags(tagsString, options, excludedTagString);

		db.tagSearchHistory.saveSearch(getState().onlineSearchForm.selectedTags);
		await dispatch(checkPostsAgainstDb(posts));

		return posts;
	}
);

export const getTagsByPatternFromApi = createAsyncThunk<Tag[], string, ThunkApi>(
	'onlineSearchForm/getTagsByPatternFromApi',
	async (value: string, thunkApi): Promise<Tag[]> => {
		return api.getTagsByPattern(value, thunkApi.getState().settings.apiKey);
	}
);

export const fetchMorePosts = createAsyncThunk<Post[], void, ThunkApi>(
	'onlineSearchForm/fetchMorePosts',
	async (_, thunkApi): Promise<Post[]> => {
		const getState = thunkApi.getState;

		const options = getPostApiOptions(getState(), true);
		const excludedTagString = getState().onlineSearchForm.excludedTags.map((tag) => tag.tag);
		const tagsString = getState().onlineSearchForm.selectedTags.map((tag) => tag.tag);

		const posts = await api.getPostsForTags(tagsString, options, excludedTagString);
		await thunkApi.dispatch(checkPostsAgainstDb(posts));

		return posts;
	}
);