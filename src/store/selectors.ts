import { Post } from '@appTypes/gelbooruTypes';
import { PostsContext, RootState } from './types';

export const postsSelector = (state: RootState, context?: PostsContext | string): Post[] => {
	if (!context) return state.posts.posts.posts;
	return state.posts.posts[context];
};
