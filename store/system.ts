//types
const SET_ACTIVE_VIEW = 'lolinizer/system/SET_ACTIVE_VIEW';
const SET_SEARCH_FORM_DRAWER_VISIBLE = 'lolinizer/system/SET_SEARCH_FORM_DRAWER_VISIBLE';
const SET_IMAGE_VIEW_THUMBNAILS_COLLAPSED = 'lolinizer/system/SET_IMAGE_VIEW_THUMBNAILS_COLLAPSED';

//action interfaces
export type View = 'thumbnails' | 'image' | 'dashboard' | 'online-search' | 'saved-searches' | 'favorites' | 'tag-list';

interface SetActiveView {
	type: typeof SET_ACTIVE_VIEW;
	view: View;
}

interface SetSearchFormDrawerVisible {
	type: typeof SET_SEARCH_FORM_DRAWER_VISIBLE;
	visible: boolean;
}

interface SetImageViewThumbnailsCollapsed {
	type: typeof SET_IMAGE_VIEW_THUMBNAILS_COLLAPSED;
	collapsed: boolean;
}

export type SystemAction = SetActiveView | SetSearchFormDrawerVisible | SetImageViewThumbnailsCollapsed;

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

export const setImageViewThumbnailsCollapsed = (collapsed: boolean): SetImageViewThumbnailsCollapsed => {
	return {
		type: SET_IMAGE_VIEW_THUMBNAILS_COLLAPSED,
		collapsed
	};
};

//state interface
export interface SystemState {
	activeView: View;
	searchFormDrawerVsibile: boolean;
	imageViewThumbnailsCollapsed: boolean;
}

//initial state
const initialState: SystemState = {
	activeView: 'thumbnails',
	searchFormDrawerVsibile: false,
	imageViewThumbnailsCollapsed: true
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
		case SET_IMAGE_VIEW_THUMBNAILS_COLLAPSED:
			return {
				...state,
				imageViewThumbnailsCollapsed: action.collapsed
			};
		default:
			return state;
	}
}
