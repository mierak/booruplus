import { Post } from '../types/gelbooruTypes';

//types
export const SET_ACTIVE_POST_INDEX = 'lolinizer/posts/SET_ACTIVE_POST_INDEX';
export const SET_POSTS = 'lolinizer/posts/SET_POSTS';
export const ADD_POSTS = 'lolinizer/posts/ADD_POSTS';
export const REMOVE_POST = 'lolinizer/posts/REMOVE_POST';
export const SET_POST_FAVORITE = 'lolinizer/posts/SET_POST_FAVORITE';
export const SET_POST_BLACKLISTED = 'lolinizer/posts/SET_POST_BLACKLISTED';
export const SET_POST_SELECTED = ' lolinizer/posts/SET_POST_SELECTED';

//action interfaces

interface SetActivePostIndex {
	type: typeof SET_ACTIVE_POST_INDEX;
	index: number | undefined;
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

interface RemovePost {
	type: typeof REMOVE_POST;
	post: Post;
}

interface SetPostBlacklisted {
	type: typeof SET_POST_BLACKLISTED;
	post: Post;
	blacklisted: 0 | 1;
}

interface SetPostSelected {
	type: typeof SET_POST_SELECTED;
	post: Post;
	selected: boolean;
}

export type PostsAction = AddPosts | SetActivePostIndex | SetPosts | SetPostFavorite | RemovePost | SetPostBlacklisted | SetPostSelected;

//action creators
export const setActivePostIndex = (index: number | undefined): SetActivePostIndex => {
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

export const setPostFavorite = (post: Post, favorite: 0 | 1): SetPostFavorite => {
	return {
		type: SET_POST_FAVORITE,
		post,
		favorite
	};
};

export const removePost = (post: Post): RemovePost => {
	return {
		type: REMOVE_POST,
		post
	};
};

export const setPostBlacklisted = (post: Post, blacklisted: 0 | 1): SetPostBlacklisted => {
	return {
		type: SET_POST_BLACKLISTED,
		blacklisted,
		post
	};
};

export const setPostSelected = (post: Post, selected: boolean): SetPostSelected => {
	return {
		type: SET_POST_SELECTED,
		selected,
		post
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
			const activePost = (action.index && state.posts[action.index]) || undefined;
			return {
				...state,
				activePostIndex: action.index,
				activePost: activePost
			};
		}
		case REMOVE_POST: {
			let newIndex = state.activePostIndex;
			let newActivePost = state.activePost;
			const newPosts = state.posts.filter((post: Post, index: number) => {
				if (post.id === action.post.id && index === state.activePostIndex) {
					newIndex = 0;
					newActivePost = state.posts[0];
				}
				return post.id !== action.post.id;
			});
			return {
				...state,
				posts: newPosts,
				activePost: newActivePost,
				activePostIndex: newIndex
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
			return {
				...state,
				posts: state.posts.map((post) => (post.id === action.post.id ? { ...post, favorite: action.favorite } : post))
			};
		}
		case SET_POST_BLACKLISTED: {
			return {
				...state,
				posts: state.posts.map((post) => (post.id === action.post.id ? { ...post, blacklisted: action.blacklisted } : post))
			};
		}
		case SET_POST_SELECTED: {
			return {
				...state,
				posts: state.posts.map((post) => (post.id === action.post.id ? { ...post, selected: action.selected } : post))
			};
		}
		default:
			return state;
	}
}
