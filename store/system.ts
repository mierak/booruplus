import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// export type SystemAction = SetActiveView | SetSearchFormDrawerVisible | SetImageViewThumbnailsCollapsed;

export type View = 'thumbnails' | 'image' | 'dashboard' | 'online-search' | 'saved-searches' | 'favorites' | 'tag-list';

export interface SystemState {
	activeView: View;
	searchFormDrawerVsibile: boolean;
	imageViewThumbnailsCollapsed: boolean;
}

const initialState: SystemState = {
	activeView: 'thumbnails',
	searchFormDrawerVsibile: false,
	imageViewThumbnailsCollapsed: true
};

const systemSlice = createSlice({
	name: 'system',
	initialState: initialState,
	reducers: {
		setActiveView: (state, action: PayloadAction<View>): void => {
			state.activeView = action.payload;
		},
		setSearchFormDrawerVisible: (state, action: PayloadAction<boolean>): void => {
			state.searchFormDrawerVsibile = action.payload;
		},
		setImageViewThumbnailsCollapsed: (state, action: PayloadAction<boolean>): void => {
			state.imageViewThumbnailsCollapsed = action.payload;
		}
	}
});

export const { setActiveView, setSearchFormDrawerVisible, setImageViewThumbnailsCollapsed } = systemSlice.actions;

export default systemSlice.reducer;
