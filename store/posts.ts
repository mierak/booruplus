import { Post } from '../types/gelbooruTypes';

//types
export const SET_ACTIVE_POST_INDEX = 'lolinizer/posts/SET_ACTIVE_POST_INDEX';
export const SET_POSTS = 'lolinizer/posts/SET_POSTS';
export const ADD_POSTS = 'lolinizer/posts/ADD_POSTS';

//action interfaces

interface SetActivePostIndex {
	type: typeof SET_ACTIVE_POST_INDEX;
	index: number;
}

interface SetPosts {
	type: typeof SET_POSTS;
	posts: Post[];
}

interface AddPosts {
	type: typeof ADD_POSTS;
	posts: Post[];
}

export type PostsAction = AddPosts | SetActivePostIndex | SetPosts;

//action creators
export const setActivePostIndex = (index: number): SetActivePostIndex => {
	return {
		type: SET_ACTIVE_POST_INDEX,
		index
	};
};

export const setPosts = (posts: Post[]): SetPosts => {
	return {
		type: SET_POSTS,
		posts
	};
};

export const addPosts = (posts: Post[]): AddPosts => {
	return {
		type: ADD_POSTS,
		posts
	};
};

//state interface
export interface PostsState {
	activePost: Post | undefined;
	activePostIndex: number | undefined;
	posts: Post[];
}

//initial state
const initialState: PostsState = {
	activePost: undefined,
	activePostIndex: undefined,
	posts: []
};

//reducer
export default function reducer(state: PostsState = initialState, action: PostsAction): PostsState {
	switch (action.type) {
		case SET_ACTIVE_POST_INDEX:
			return {
				...state,
				activePostIndex: action.index
			};
		case SET_POSTS:
			return {
				...state,
				posts: action.posts
			};
		case ADD_POSTS:
			return {
				...state,
				posts: [...state.posts, ...action.posts]
			};
		default:
			return state;
	}
}
