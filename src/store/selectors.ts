import { Post } from '@appTypes/gelbooruTypes';
import { PostsContext, RootState } from './types';

export const postsSelector = (state: RootState, context?: PostsContext): Post[] => {
	if (!context || context === 'posts') {
		return state.posts.posts.posts;
	} else {
		return state.posts.posts.favorites;
	}
};
