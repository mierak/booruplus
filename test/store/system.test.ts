import { doDatabaseMock } from '../helpers/database.mock';
doDatabaseMock();
import reducer, { actions, initialState, SystemState } from '../../src/store/system';
import { thunks } from '../../src/store/';
import { createAction } from '../helpers/test.helper';

describe('store/system', () => {
	describe('reducers', () => {
		fit('Sets active view', () => {
			// given
			const activeView = 'image';
			const action = createAction(actions.setActiveView.type, activeView);

			// when
			const result = reducer(initialState, action);

			// then
			expect(result.activeView).toBe(activeView);
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
	});
	describe('extraReducers', () => {
		describe('thunks', () => {
			describe('onlineSearchForm', () => {
				describe('fetchPosts()', () => {
					it('pending', () => {
						// given
						const action = createAction(thunks.onlineSearchForm.fetchPosts.pending.type);
						const state: SystemState = {
							...initialState,
							activeView: 'favorites',
						};

						// when
						const result = reducer(state, action);

						// then
						expect(result.activeView).toBe('searches');
					});
				});
				describe('getTagsByPatternFromApi()', () => {
					it('pending', () => {
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
					it('fulfilled', () => {
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
					it('rejected', () => {
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
				});
			});
			describe('downloadedSearchForm', () => {
				describe('fetchPosts', () => {
					it('pending', () => {
						// given
						const action = createAction(thunks.downloadedSearchForm.fetchPosts.pending.type);
						const state: SystemState = {
							...initialState,
							activeView: 'favorites',
						};

						// when
						const result = reducer(state, action);

						// then
						expect(result.activeView).toBe('searches');
					});
				});
			});
			describe('tags', () => {
				describe('loadAllWithLimitAndOffset', () => {
					it('pending', () => {
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
					it('fulfilled', () => {
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
				});
				describe('searchOnline', () => {
					it('pending', () => {
						// given
						const action = createAction(thunks.tags.searchTagOnline.pending.type);
						const state: SystemState = {
							...initialState,
							activeView: 'dashboard',
						};

						// when
						const result = reducer(state, action);

						// then
						expect(result.activeView).toBe('searches');
					});
				});
				describe('searchOffline', () => {
					it('pending', () => {
						// given
						const action = createAction(thunks.tags.searchTagOffline.pending.type);
						const state: SystemState = {
							...initialState,
							activeView: 'dashboard',
						};

						// when
						const result = reducer(state, action);

						// then
						expect(result.activeView).toBe('searches');
					});
				});
			});
			describe('savedSearches', () => {
				describe('searchOnline()', () => {
					it('pending', () => {
						// given
						const action = createAction(thunks.savedSearches.searchOnline.pending.type);
						const state: SystemState = {
							...initialState,
							activeView: 'dashboard',
						};

						// when
						const result = reducer(state, action);

						// then
						expect(result.activeView).toBe('searches');
					});
				});
				describe('searchOffline()', () => {
					it('pending', () => {
						// given
						const action = createAction(thunks.savedSearches.searchOffline.pending.type);
						const state: SystemState = {
							...initialState,
							activeView: 'dashboard',
						};

						// when
						const result = reducer(state, action);

						// then
						expect(result.activeView).toBe('searches');
					});
				});
			});
			describe('posts', () => {
				describe('downloadPosts', () => {
					it('pending', () => {
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
				});
				describe('fetchPostsById', () => {
					it('pending', () => {
						// given
						const action = createAction(thunks.posts.fetchPostsByIds.pending.type);
						const state: SystemState = {
							...initialState,
							isTasksDrawerVisible: true,
							activeView: 'image',
						};

						// when
						const result = reducer(state, action);

						// then
						expect(result.isTasksDrawerVisible).toBe(false);
						expect(result.activeView).toBe('search-results');
					});
				});
			});
		});
	});
});
