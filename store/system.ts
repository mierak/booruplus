//types
const SET_ACTIVE_VIEW = 'lolinizer/system/SET_ACTIVE_VIEW';

//action interfaces
export type View = 'thumbnails' | 'image' | 'dashboard';

interface SetActiveView {
	type: typeof SET_ACTIVE_VIEW;
	view: View;
}

export type SystemAction = SetActiveView;

//action creators
export const setActiveView = (view: View): SetActiveView => {
	return {
		type: SET_ACTIVE_VIEW,
		view
	};
};

//state interface
export interface SystemState {
	activeView: View;
}

//initial state
const initialState: SystemState = {
	activeView: 'thumbnails'
};

//reducer
export default function reducer(state: SystemState = initialState, action: SystemAction): SystemState {
	switch (action.type) {
		case SET_ACTIVE_VIEW:
			return {
				...state,
				activeView: action.view
			};
		default:
			return state;
	}
}
