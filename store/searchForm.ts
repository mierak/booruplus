import { Tag, Rating } from '../types/gelbooruTypes';

const ADD_TAG = 'lolinizer/searchForm/ADD_TAG';
const REMOVE_TAG = 'lolinizer/searchForm/REMOVE_TAG';
const CLEAR_TAGS = 'lolinizer/searchForm/CLEAR_TAGS';
const SET_POST_COUNT = 'lolinizer/searchForm/SET_POST_COUNT';
const SET_RATING = 'lolinizer/searchForm/SET_RATING';
const SET_PAGE = 'lolinizer/searchForm/SET_PAGE';
const SET_LOADING = 'lolinizer/searchForm/SET_LOADING';

interface AddTag {
	type: typeof ADD_TAG;
	tag: Tag;
}

interface RemoveTag {
	type: typeof REMOVE_TAG;
	tag: Tag;
}

interface ClearTags {
	type: typeof CLEAR_TAGS;
}

interface SetPostCount {
	type: typeof SET_POST_COUNT;
	count: number;
}

interface SetRating {
	type: typeof SET_RATING;
	rating: Rating;
}

interface SetPage {
	type: typeof SET_PAGE;
	page: number;
}

interface SetLoading {
	type: typeof SET_LOADING;
	loading: boolean;
}

export type SearchFormAction = AddTag | RemoveTag | ClearTags | SetPostCount | SetRating | SetPage | SetLoading;

export const addTag = (tag: Tag): AddTag => {
	return {
		type: ADD_TAG,
		tag
	};
};

export const removeTag = (tag: Tag): RemoveTag => {
	return {
		type: REMOVE_TAG,
		tag
	};
};

export const clearTags = (): ClearTags => {
	return {
		type: CLEAR_TAGS
	};
};

export const setPostCount = (count: number): SetPostCount => {
	return {
		type: SET_POST_COUNT,
		count
	};
};

export const setRating = (rating: Rating): SetRating => {
	return {
		type: SET_RATING,
		rating
	};
};

export const setPage = (page: number): SetPage => {
	return {
		type: SET_PAGE,
		page
	};
};

export const setLoading = (loading: boolean): SetLoading => {
	return {
		type: SET_LOADING,
		loading
	};
};

export interface SearchFormState {
	selectedTags: Tag[];
	postCount: number;
	rating: Rating;
	page: number;
	loading: boolean;
}

export const initialState: SearchFormState = {
	selectedTags: [],
	postCount: 10,
	rating: 'any',
	page: 0,
	loading: false
};

export default function reducer(state: SearchFormState = initialState, action: SearchFormAction): SearchFormState {
	switch (action.type) {
		case ADD_TAG:
			if (state.selectedTags.includes(action.tag)) {
				return state;
			} else {
				return {
					...state,
					selectedTags: [...state.selectedTags, action.tag]
				};
			}
		case REMOVE_TAG:
			return {
				...state,
				selectedTags: state.selectedTags.filter((el) => el.id !== action.tag.id)
			};
		case CLEAR_TAGS:
			return {
				...state,
				selectedTags: []
			};
		case SET_POST_COUNT:
			return {
				...state,
				postCount: action.count
			};
		case SET_RATING:
			return {
				...state,
				rating: action.rating
			};
		case SET_PAGE:
			return {
				...state,
				page: action.page
			};
		case SET_LOADING:
			return {
				...state,
				loading: action.loading
			};
		default:
			return state;
	}
}
