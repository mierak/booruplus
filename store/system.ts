//types
const SET_ACTIVE_VIEW = 'lolinizer/system/SET_ACTIVE_VIEW';
const SET_SEARCH_FORM_DRAWER_VISIBLE = 'lolinizer/system/SET_SEARCH_FORM_DRAWER_VISIBLE';

//action interfaces
export type View = 'thumbnails' | 'image' | 'dashboard' | 'online-search';

interface SetActiveView {
	type: typeof SET_ACTIVE_VIEW;
	view: View;
}

interface SetSearchFormDrawerVisible {
	type: typeof SET_SEARCH_FORM_DRAWER_VISIBLE;
	visible: boolean;
}

export type SystemAction = SetActiveView | SetSearchFormDrawerVisible;

//action creators
export const setActiveView = (view: View): SetActiveView => {
	return {
		type: SET_ACTIVE_VIEW,
		view
	};
};

export const setSearchFormDrawerVisible = (visible: boolean): SetSearchFormDrawerVisible => {
	return {
		type: SET_SEARCH_FORM_DRAWER_VISIBLE,
		visible
	};
};

//state interface
export interface SystemState {
	activeView: View;
	searchFormDrawerVsibile: boolean;
}

//initial state
const initialState: SystemState = {
	activeView: 'thumbnails',
	searchFormDrawerVsibile: false
};

//reducer
export default function reducer(state: SystemState = initialState, action: SystemAction): SystemState {
	switch (action.type) {
		case SET_ACTIVE_VIEW:
			return {
				...state,
				activeView: action.view
			};
		case SET_SEARCH_FORM_DRAWER_VISIBLE:
			return {
				...state,
				searchFormDrawerVsibile: action.visible
			};
		default:
			return state;
	}
}
