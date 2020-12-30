import { doDatabaseMock } from '../helpers/database.mock';
doDatabaseMock();
import reducer, { actions, initialState } from '../../src/store/onlineSearchForm';
import { thunks } from '../../src/store/';
import { createAction, mTag, createPendingAction, createFulfilledAction } from '../helpers/test.helper';
import { DownloadedSearchFormState } from '@store/types';

describe('store/onlineSearchForm', () => {
	const defaultCtx = 'default';
	it('Adds tag', () => {
		//given
		const tag = mTag({ tag: 'tag1' });
		const action = createAction(actions.addTag.type, { context: defaultCtx, data: tag });

		// when
		const result = reducer(initialState, action);

		// then
		expect(result[defaultCtx].selectedTags).toContain(tag);
	});
	it('Adds excluded tag', () => {
		//given
		const tag = mTag({ tag: 'tag1' });
		const action = createAction(actions.addExcludedTag.type, { context: defaultCtx, data: tag });

		// when
		const result = reducer(initialState, action);

		// then
		expect(result[defaultCtx].excludedTags).toContain(tag);
	});
	it('Removes tag', () => {
		//given
		const context = 'ctx';
		const tag = mTag({ tag: 'tag1' });
		const action = createAction(actions.removeTag.type, { context: defaultCtx, data: tag });

		// when
		const result = reducer({ ...initialState, [context]: { ...initialState.default, selectedTags: [tag] } }, action);

		// then
		expect(result[defaultCtx].selectedTags).not.toContain(tag);
	});
	it('Removes excluded tag', () => {
		//given
		const context = 'ctx';
		const tag = mTag({ tag: 'tag1' });
		const action = createAction(actions.removeExcludedTag.type, { context: defaultCtx, data: tag });

		// when
		const result = reducer({ ...initialState, [context]: { ...initialState.default, excludedTags: [tag] } }, action);

		// then
		expect(result[defaultCtx].excludedTags).not.toContain(tag);
	});
	it('Sets selected tags', () => {
		//given
		const tags = [mTag({ tag: 'tag1' }), mTag({ tag: 'tag2' }), mTag({ tag: 'tag3' })];
		const action = createAction(actions.setSelectedTags.type, { context: defaultCtx, data: tags });

		// when
		const result = reducer(undefined, action);

		// then
		expect(result[defaultCtx].selectedTags).toStrictEqual(tags);
	});
	it('Clears tag options', () => {
		//given
		const context = 'ctx';
		const tags = [mTag({ tag: 'tag1' }), mTag({ tag: 'tag2' }), mTag({ tag: 'tag3' })];
		const action = createAction(actions.clearTagOptions.type, { context: defaultCtx, data: tags });

		// when
		const result = reducer({ ...initialState, [context]: { ...initialState.default, tagOptions: tags } }, action);

		// then
		expect(result[defaultCtx].tagOptions).toEqual([]);
	});
	it('Sets rating', () => {
		//given
		const rating = 'explicit';
		const action = createAction(actions.setRating.type, { context: defaultCtx, data: rating });

		// when
		const result = reducer(undefined, action);

		// then
		expect(result[defaultCtx].rating).toEqual(rating);
	});
	it('Sets post limit', () => {
		//given
		const limit = 123;
		const action = createAction(actions.setLimit.type, { context: defaultCtx, data: limit });

		// when
		const result = reducer(undefined, action);

		// then
		expect(result[defaultCtx].limit).toEqual(limit);
	});
	it('Sets page', () => {
		//given
		const page = 123;
		const action = createAction(actions.setPage.type, { context: defaultCtx, data: page });

		// when
		const result = reducer(undefined, action);

		// then
		expect(result[defaultCtx].page).toEqual(page);
	});
	it('Sets sort', () => {
		//given
		const sort = 'rating';
		const action = createAction(actions.setSort.type, { context: defaultCtx, data: sort });

		// when
		const result = reducer(undefined, action);

		// then
		expect(result[defaultCtx].sort).toEqual(sort);
	});
	it('Sets sort order', () => {
		//given
		const sort = 'asc';
		const action = createAction(actions.setSortOrder.type, { context: defaultCtx, data: sort });

		// when
		const result = reducer(undefined, action);

		// then
		expect(result[defaultCtx].sortOrder).toEqual(sort);
	});
	describe('Updates context', () => {
		//given
		const state: DownloadedSearchFormState = {
			mode: 'offline',
			excludedTags: [],
			page: 123,
			limit: 123,
			rating: 'explicit',
			selectedTags: [],
			sort: 'resolution',
			sortOrder: 'asc',
			tagOptions: [],
			showBlacklisted: true,
			showFavorites: false,
			showGifs: false,
			showImages: false,
			showNonBlacklisted: false,
			showVideos: false,
		};
		const action = createAction(actions.updateContext.type, { context: defaultCtx, data: state });

		// when
		const result = reducer(undefined, action);

		// then
		expect(result).toStrictEqual({ [defaultCtx]: state });
	});
	it('Clear reset to initialState', () => {
		//given
		const action = createAction(actions.clear.type, { context: defaultCtx });
		const state: DownloadedSearchFormState = {
			mode: 'offline',
			excludedTags: [],
			page: 123,
			limit: 123,
			rating: 'explicit',
			selectedTags: [],
			sort: 'resolution',
			sortOrder: 'asc',
			tagOptions: [],
			showBlacklisted: true,
			showFavorites: false,
			showGifs: false,
			showImages: false,
			showNonBlacklisted: false,
			showVideos: false,
		};

		// when
		const result = reducer({ [defaultCtx]: state }, action);

		// then
		expect(result).toStrictEqual(initialState);
	});
	describe('extraReducers', () => {
		it('Inits posts context', () => {
			// given
			const action = createFulfilledAction('common/initPostsContext', { context: defaultCtx });

			// when
			const result = reducer(undefined, action);

			// then
			expect(result).toStrictEqual(initialState);
		});
		it('deletes posts context', () => {
			// given
			const someCtx = 'someCtx';
			const action = createFulfilledAction('common/deletePostsContext', { context: someCtx });

			// when
			const result = reducer({ ...initialState, [someCtx]: initialState.default }, action);

			// then
			expect(result).toStrictEqual(initialState);
		});
		it('Sets tag options when getTagsByPatternFromApi is fullfiled', () => {
			// given
			const tags = [mTag({ tag: 'tag1' })];
			const action = createFulfilledAction(thunks.onlineSearchForm.getTagsByPatternFromApi.fulfilled.type, tags, {
				arg: { context: defaultCtx },
			});

			// when
			const result = reducer(undefined, action);

			// then
			expect(result[defaultCtx].tagOptions).toStrictEqual(tags);
		});
		it('Increments page on online fetchMorePosts', () => {
			//given
			const action = createFulfilledAction(thunks.onlineSearchForm.fetchMorePosts.fulfilled.type, undefined, {
				arg: { context: defaultCtx },
			});

			// when
			const result = reducer(undefined, action);

			// then
			expect(result[defaultCtx].page).toEqual(1);
		});
		it('Sets tag options on loadTagsByPattern fulfilled', () => {
			//given
			const tags = [mTag({ tag: 'tag1' })];
			const action = createFulfilledAction(thunks.downloadedSearchForm.loadTagsByPattern.fulfilled.type, tags, {
				arg: { context: defaultCtx },
			});

			// when
			const result = reducer(undefined, action);

			// then
			expect(result[defaultCtx].tagOptions).toStrictEqual(tags);
		});
		it('Increases page on offline fetchMorePosts', () => {
			//given
			const action = createPendingAction(thunks.downloadedSearchForm.fetchMorePosts.fulfilled.type, {
				arg: { context: defaultCtx },
			});

			// when
			const result = reducer(undefined, action);

			// then
			expect(result[defaultCtx].page).toEqual(1);
		});
		it('Sets savedSearchId for context when search is saved', () => {
			//given
			const action = createFulfilledAction(
				thunks.savedSearches.saveSearch.fulfilled.type,
				{ id: 123 },
				{
					arg: { context: defaultCtx },
				}
			);

			// when
			const result = reducer(undefined, action);

			// then
			expect(result[defaultCtx].savedSearchId).toEqual(123);
		});
	});
});
