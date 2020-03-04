import { Post } from '../types/gelbooruTypes';

//types
export const SET_ACTIVE_POST_INDEX = 'lolinizer/posts/SET_ACTIVE_POST_INDEX';
export const SET_POSTS = 'lolinizer/posts/SET_POSTS';
export const ADD_POSTS = 'lolinizer/posts/ADD_POSTS';
export const SET_POST_FAVORITE = 'lolinizer/posts/SET_POST_FAVORITE';
export const SET_ACTIVE_POST = 'lolinizer/posts/SET_ACTIVE_POST';

//action interfaces

interface SetActivePostIndex {
	type: typeof SET_ACTIVE_POST_INDEX;
	index: number;
}

interface SetActivePost {
	type: typeof SET_ACTIVE_POST;
	post: Post | undefined;
}

interface SetPosts {
	type: typeof SET_POSTS;
	posts: Post[];
}

interface AddPosts {
	type: typeof ADD_POSTS;
	posts: Post[];
}

interface SetPostFavorite {
	type: typeof SET_POST_FAVORITE;
	post: Post;
	favorite: 0 | 1;
}

export type PostsAction = AddPosts | SetActivePostIndex | SetPosts | SetPostFavorite | SetActivePost;

//action creators
export const setActivePostIndex = (index: number): SetActivePostIndex => {
	return {
		type: SET_ACTIVE_POST_INDEX,
		index
	};
};

export const setActivePost = (post: Post | undefined): SetActivePost => {
	return {
		type: SET_ACTIVE_POST,
		post
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

export const setPostFavorite = (post: Post, favorite: 0 | 1): SetPostFavorite => {
	return {
		type: SET_POST_FAVORITE,
		post,
		favorite
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
		case SET_ACTIVE_POST_INDEX: {
			const activePost = state.posts[action.index];
			return {
				...state,
				activePostIndex: action.index,
				activePost: activePost
			};
		}
		case SET_ACTIVE_POST: {
			const getIndex = (): number | undefined => {
				if (!action.post) return undefined;
				return state.posts.findIndex((post) => post === action.post);
			};
			return {
				...state,
				activePost: action.post,
				activePostIndex: getIndex()
			};
		}
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
		case SET_POST_FAVORITE: {
			const post = state.posts.find((p) => p.id === action.post.id);
			if (post) {
				post.favorite = action.favorite;
			}
			return {
				...state
			};
		}
		default:
			return state;
	}
}
