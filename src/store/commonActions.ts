import { createAction, createAsyncThunk } from '@reduxjs/toolkit';

import type { Post } from '@appTypes/gelbooruTypes';
import type { SearchContext, PostsContext, ThunkApi, WithContext } from '@store/types';

import { getActionLogger } from '@util/logger';
import { IpcInvokeChannels, IpcSendChannels } from '@appTypes/processDto';

export const setFullscreenLoadingMaskState = createAction<string | { message: string; progressPercent: number }>(
	'loadingState/setFullscreenLoadingMaskMessage'
);

export const initPostsContext = createAction<WithContext<Partial<SearchContext>>>(
	'common/initPostsContext'
);

export const deletePostsContext = createAction<{ context: PostsContext | string }>('common/deletePostsContext');

export const exportPostsToDirectory = createAsyncThunk<
	Post[],
	{ type: 'all' | 'selected'; context: PostsContext | string } | Post[],
	ThunkApi
>(
	'posts/exportPostsToDirectory',
	async (param, thunkApi): Promise<Post[]> => {
		const initialMessage = `exporting ${'context' in param ? param : 'Post[]'}`;
		const logger = getActionLogger(exportPostsToDirectory);
		logger.debug(initialMessage);
		const folder = await window.api.invoke(IpcInvokeChannels.OPEN_SELECT_FOLDER_DIALOG);
		if (!folder) {
			logger.debug('Select folder dialog closed without selecting a directory. Cancelling.');
			return [];
		}
		logger.debug('Selected folder', folder);

		const state = thunkApi.getState();

		let posts: Post[];
		if ('context' in param) {
			switch (param.type) {
				case 'all':
					posts = state.posts.posts[param.context];
					break;
				case 'selected':
					posts = state.posts.posts[param.context].filter((p) => p.selected);
					break;
			}
		} else {
			posts = param;
		}
		logger.debug(`Exporting ${posts.length} posts.`);

		window.api.send(IpcSendChannels.EXPORT_POSTS, { path: folder, posts });

		return posts;
	}
);
