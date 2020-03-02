import { combineReducers } from 'redux';
import postsReducer, { PostsState } from './posts';
import systemReducer, { SystemState } from './system';
import searchFormReducer, { SearchFormState } from './searchForm';

export interface State {
	system: SystemState;
	posts: PostsState;
	searchForm: SearchFormState;
}

export const mainReducer = combineReducers({
	system: systemReducer,
	posts: postsReducer,
	searchForm: searchFormReducer
});
