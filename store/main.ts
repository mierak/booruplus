import { combineReducers } from 'redux';
import postsReducer, { PostsState } from './posts';
import systemReducer, { SystemState } from './system';

export interface State {
	system: SystemState;
	posts: PostsState;
}

export const mainReducer = combineReducers({
	system: systemReducer,
	posts: postsReducer
});
