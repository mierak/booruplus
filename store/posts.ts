import { Post } from '../types/gelbooruTypes';

//types
export const SET_ACTIVE_POST = 'lolinizer/posts/SET_ACTIVE_POST';
export const SET_ACTIVE_POST_INDEX = 'lolinizer/posts/SET_ACTIVE_POST_INDEX';
export const SET_POSTS = 'lolinizer/posts/SET_POSTS';

//action interfaces
interface SetActivePost {
	type: typeof SET_ACTIVE_POST;
	post: Post;
}

interface SetActivePostIndex {
	type: typeof SET_ACTIVE_POST_INDEX;
	index: number;
}

interface SetPosts {
	type: typeof SET_POSTS;
	posts: Post[];
}

export type PostsAction = SetActivePost | SetActivePostIndex | SetPosts;

//action creators
// export const setActivePost = (post: Post): SetActivePost => {
// 	return {
// 		type: SET_ACTIVE_POST,
// 		post
// 	};
// };

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
		case SET_ACTIVE_POST:
			return {
				...state,
				activePost: action.post
			};
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
		default:
			return state;
	}
}
