import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Post } from '../types/gelbooruTypes';
import { ThunkApi } from './types';
import { thunkLoggerFactory } from '../util/logger';
import { IpcChannels } from '../types/processDto';

const thunkLogger = thunkLoggerFactory();

export const setFullscreenLoadingMaskState = createAction<string | { message: string; progressPercent: number }>(
	'loadingState/setFullscreenLoadingMaskMessage'
);

export const exportPostsToDirectory = createAsyncThunk<Post[], 'all' | 'selected' | Post[], ThunkApi>(
	'posts/exportPostsToDirectory',
	async (param, thunkApi): Promise<Post[]> => {
		const initialMessage = ` - exporting ${typeof param === 'string' ? param : 'Post[]'}`;
		const logger = thunkLogger.getActionLogger(exportPostsToDirectory, { initialMessage });
		const folder = await window.api.invoke<string>(IpcChannels.OPEN_SELECT_FOLDER_DIALOG);
		if (!folder) {
			logger.debug('Select folder dialog closed without selecting a directory. Cancelling.');
			return [];
		}
		logger.debug('Selected folder', folder);

		const state = thunkApi.getState();

		let posts: Post[];
		switch (param) {
			case 'all': {
				posts = state.posts.posts;
				break;
			}
			case 'selected': {
				posts = state.posts.posts.filter((post) => post.selected);
				break;
			}
			default: {
				posts = param;
			}
		}
		logger.debug(`Exporting ${posts.length} posts.`);

		window.api.send(IpcChannels.EXPORT_POSTS, { path: folder, posts });

		return posts;
	}
);
