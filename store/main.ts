import { combineReducers } from 'redux';
import postsReducer, { PostsState } from './posts';
import systemReducer, { SystemState } from './system';
import searchFormReducer, { SearchFormState } from './searchForm';
import savedSearchesReducer, { SavedSearchesState } from './savedSearches';

export interface State {
	system: SystemState;
	posts: PostsState;
	searchForm: SearchFormState;
	savedSearches: SavedSearchesState;
}

export const mainReducer = combineReducers({
	system: systemReducer,
	posts: postsReducer,
	searchForm: searchFormReducer,
	savedSearches: savedSearchesReducer
});
