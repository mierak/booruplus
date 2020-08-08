import { doDatabaseMock } from '../helpers/database.mock';
doDatabaseMock();
import reducer, { actions, initialState, SystemState } from '../../src/store/system';
import { thunks } from '../../src/store/';
import { createAction } from '../helpers/test.helper';

describe('store/system', () => {
	it('Sets active view', () => {
		// given
		const activeView = 'image';
		const action = createAction(actions.setActiveView.type, activeView);

		// when
		const result = reducer(initialState, action);

		// then
		expect(result.activeView).toBe(activeView);
	});
	it('Sets search mode', () => {
		// given
		const mode = 'offline';
		const action = createAction(actions.setSearchMode.type, mode);

		// when
		const result = reducer(initialState, action);

		// then
		expect(result.searchMode).toBe(mode);
	});
	it('Sets search form drawer visible', () => {
		// given
		const visible = true;
		const action = createAction(actions.setSearchFormDrawerVisible.type, visible);

		// when
		const result = reducer(initialState, action);

		// then
		expect(result.isSearchFormDrawerVsibile).toBe(visible);
	});
	it('Sets downloaded search form drawer visible', () => {
		// given
		const visible = true;
		const action = createAction(actions.setDownloadedSearchFormDrawerVisible.type, visible);

		// when
		const result = reducer(initialState, action);

		// then
		expect(result.isDownloadedSearchFormDrawerVisible).toBe(visible);
	});
	it('Sets task drawer visible', () => {
		// given
		const visible = true;
		const action = createAction(actions.setTasksDrawerVisible.type, visible);

		// when
		const result = reducer(initialState, action);

		// then
		expect(result.isTasksDrawerVisible).toBe(visible);
	});
	it('Sets tags popover visible', () => {
		// given
		const visible = true;
		const action = createAction(actions.setTagsPopovervisible.type, visible);

		// when
		const result = reducer(initialState, action);

		// then
		expect(result.isTagsPopoverVisible).toBe(visible);
	});
	it('Sets image view thumbnails sider collapsed', () => {
		// given
		const collapsed = false;
		const action = createAction(actions.setImageViewThumbnailsCollapsed.type, collapsed);

		// when
		const result = reducer(initialState, action);

		// then
		expect(result.isImageViewThumbnailsCollapsed).toBe(collapsed);
	});
	it('Toggles image view thumbnails sider collapsed', () => {
		// given
		const collapsed = true;
		const action = createAction(actions.toggleFavoritesDirectoryTreeCollapsed.type);

		// when
		const result = reducer(initialState, action);

		// then
		expect(result.isImageViewThumbnailsCollapsed).toBe(collapsed);
	});
	it('Correctly changes state when online fetchPosts is initiated', () => {
		// given
		const action = createAction(thunks.onlineSearchForm.fetchPosts.pending.type);
		const state: SystemState = {
			...initialState,
			activeView: 'favorites',
			isSearchFormDrawerVsibile: true,
			isDownloadedSearchFormDrawerVisible: true,
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.activeView).toBe('thumbnails');
		expect(result.isSearchFormDrawerVsibile).toBe(false);
		expect(result.isDownloadedSearchFormDrawerVisible).toBe(false);
	});
	it('Correctly changes state when offline fetchPosts is initiated', () => {
		// given
		const action = createAction(thunks.downloadedSearchForm.fetchPosts.pending.type);
		const state: SystemState = {
			...initialState,
			activeView: 'favorites',
			isSearchFormDrawerVsibile: true,
			isDownloadedSearchFormDrawerVisible: true,
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.activeView).toBe('thumbnails');
		expect(result.isSearchFormDrawerVsibile).toBe(false);
		expect(result.isDownloadedSearchFormDrawerVisible).toBe(false);
	});
	it('Correctly changes when getTagsByPattern is pending', () => {
		// given
		const action = createAction(thunks.onlineSearchForm.getTagsByPatternFromApi.pending.type);
		const state: SystemState = {
			...initialState,
			isTagOptionsLoading: false,
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.isTagOptionsLoading).toBe(true);
	});
	it('Correctly changes when getTagsByPattern is fulfilled', () => {
		// given
		const action = createAction(thunks.onlineSearchForm.getTagsByPatternFromApi.fulfilled.type);
		const state: SystemState = {
			...initialState,
			isTagOptionsLoading: true,
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.isTagOptionsLoading).toBe(false);
	});
	it('Correctly changes when getTagsByPattern is rejected', () => {
		// given
		const action = createAction(thunks.onlineSearchForm.getTagsByPatternFromApi.rejected.type);
		const state: SystemState = {
			...initialState,
			isTagOptionsLoading: true,
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.isTagOptionsLoading).toBe(false);
	});
	it('Correctly changes when tags.loadAllWithLimitAndOffset is pending', () => {
		// given
		const action = createAction(thunks.tags.loadAllWithLimitAndOffset.pending.type);
		const state: SystemState = {
			...initialState,
			isTagTableLoading: false,
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.isTagTableLoading).toBe(true);
	});
	it('Correctly changes when tags.loadAllWithLimitAndOffset is fulfilled', () => {
		// given
		const action = createAction(thunks.tags.loadAllWithLimitAndOffset.fulfilled.type);
		const state: SystemState = {
			...initialState,
			isTagTableLoading: true,
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.isTagTableLoading).toBe(false);
	});
	it('Correctly changes when tags.searchOnline is pending', () => {
		// given
		const action = createAction(thunks.tags.searchTagOnline.pending.type);
		const state: SystemState = {
			...initialState,
			searchMode: 'most-viewed',
			activeView: 'dashboard',
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.searchMode).toBe('online');
		expect(result.activeView).toBe('thumbnails');
	});
	it('Correctly changes when tags.searchOffline is pending', () => {
		// given
		const action = createAction(thunks.tags.searchTagOffline.pending.type);
		const state: SystemState = {
			...initialState,
			searchMode: 'most-viewed',
			activeView: 'dashboard',
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.searchMode).toBe('online');
		expect(result.activeView).toBe('thumbnails');
	});
	it('Correctly changes when savedSearches.searchOnline is pending', () => {
		// given
		const action = createAction(thunks.savedSearches.searchOnline.pending.type);
		const state: SystemState = {
			...initialState,
			searchMode: 'most-viewed',
			activeView: 'dashboard',
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.searchMode).toBe('saved-search-online');
		expect(result.activeView).toBe('thumbnails');
	});
	it('Correctly changes when savedSearches.searchOffline is pending', () => {
		// given
		const action = createAction(thunks.savedSearches.searchOffline.pending.type);
		const state: SystemState = {
			...initialState,
			searchMode: 'most-viewed',
			activeView: 'dashboard',
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.searchMode).toBe('saved-search-offline');
		expect(result.activeView).toBe('thumbnails');
	});
	it('Shows task download panel when batch posts download is initiated', () => {
		// given
		const action = createAction(thunks.posts.downloadPosts.pending.type);
		const state: SystemState = {
			...initialState,
			isTasksDrawerVisible: false,
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.isTasksDrawerVisible).toBe(true);
	});
	it('Correctly changes state when posts.fetchPostsByIds is initiated', () => {
		// given
		const action = createAction(thunks.posts.fetchPostsByIds.pending.type);
		const state: SystemState = {
			...initialState,
			isTasksDrawerVisible: true,
			activeView: 'image',
			searchMode: 'most-viewed',
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.isTasksDrawerVisible).toBe(false);
		expect(result.activeView).toBe('thumbnails');
		expect(result.searchMode).toBe('open-download');
	});
});
