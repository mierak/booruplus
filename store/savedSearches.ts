import { SavedSearch } from '../types/gelbooruTypes';

export const ADD_SAVED_SEARCH = 'lolinizer/savedSearches/ADD_SAVED_SEARCH';
export const REMOVE_SAVED_SEARCH = 'lolinizer/savedSearches/REMOVE_SAVED_SEARCH';
export const SET_SAVED_SEARCHES = 'lolinizer/savedSearches/SET_SAVED_SEARCHES';

interface AddSavedSearch {
	type: typeof ADD_SAVED_SEARCH;
	savedSearch: SavedSearch;
}

interface RemoveSavedSearch {
	type: typeof REMOVE_SAVED_SEARCH;
	savedSearch: SavedSearch;
}

interface SetSavedSearches {
	type: typeof SET_SAVED_SEARCHES;
	savedSearches: SavedSearch[];
}

export type SavedSearchAction = AddSavedSearch | RemoveSavedSearch | SetSavedSearches;

export const addSavedSearch = (savedSearch: SavedSearch): AddSavedSearch => {
	return {
		type: ADD_SAVED_SEARCH,
		savedSearch
	};
};

export const removeSavedSearch = (savedSearch: SavedSearch): RemoveSavedSearch => {
	return {
		type: REMOVE_SAVED_SEARCH,
		savedSearch
	};
};

export const setSavedSearches = (savedSearches: SavedSearch[]): SetSavedSearches => {
	return {
		type: SET_SAVED_SEARCHES,
		savedSearches
	};
};

export interface SavedSearchesState {
	savedSearches: SavedSearch[];
}

const initialState = {
	savedSearches: []
};

export default function reducer(state: SavedSearchesState = initialState, action: SavedSearchAction): SavedSearchesState {
	switch (action.type) {
		case ADD_SAVED_SEARCH:
			return {
				...state,
				savedSearches: [...state.savedSearches, action.savedSearch]
			};
		case REMOVE_SAVED_SEARCH:
			return {
				...state,
				savedSearches: state.savedSearches.filter((s) => s.id !== action.savedSearch.id)
			};
		case SET_SAVED_SEARCHES:
			return {
				...state,
				savedSearches: action.savedSearches
			};
		default:
			return state;
	}
}
