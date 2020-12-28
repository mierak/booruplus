import { doDatabaseMock } from '../helpers/database.mock';
doDatabaseMock();
import reducer, { actions, initialState } from '../../src/store/onlineSearchForm';
import { thunks } from '../../src/store/';
import { createAction, mTag, createPendingAction } from '../helpers/test.helper';
import { DownloadedSearchFormState } from '@store/types';

describe('store/onlineSearchForm', () => {
	it('Adds tag', () => {
		//given
		const tag = mTag({ tag: 'tag1' });
		const action = createAction(actions.addTag.type, tag);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.selectedTags).toContain(tag);
	});
	it('Adds excluded tag', () => {
		//given
		const tag = mTag({ tag: 'tag1' });
		const action = createAction(actions.addExcludedTag.type, tag);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.excludedTags).toContain(tag);
	});
	it('Removes tag', () => {
		//given
		const context = 'ctx';
		const tag = mTag({ tag: 'tag1' });
		const action = createAction(actions.removeTag.type, tag);

		// when
		const result = reducer({ ...initialState, [context]: { ...initialState.default, selectedTags: [tag] } }, action);

		// then
		expect(result.selectedTags).not.toContain(tag);
	});
	it('Removes tag', () => {
		//given
		const context = 'ctx';
		const tag = mTag({ tag: 'tag1' });
		const action = createAction(actions.removeExcludedTag.type, tag);

		// when
		const result = reducer({ ...initialState, [context]: { ...initialState.default, excludedTags: [tag] } }, action);

		// then
		expect(result.excludedTags).not.toContain(tag);
	});
	it('Sets selected tags', () => {
		//given
		const tags = [mTag({ tag: 'tag1' }), mTag({ tag: 'tag2' }), mTag({ tag: 'tag3' })];
		const action = createAction(actions.setSelectedTags.type, tags);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.selectedTags).toStrictEqual(tags);
	});
	it('Clears tag options', () => {
		//given
		const context = 'ctx';
		const tags = [mTag({ tag: 'tag1' }), mTag({ tag: 'tag2' }), mTag({ tag: 'tag3' })];
		const action = createAction(actions.clearTagOptions.type, tags);

		// when
		const result = reducer({ ...initialState, [context]: { ...initialState.default, tagOptions: tags } }, action);

		// then
		expect(result.tagOptions).toEqual([]);
	});
	it('Sets rating', () => {
		//given
		const rating = 'explicit';
		const action = createAction(actions.setRating.type, rating);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.rating).toEqual(rating);
	});
	it('Sets post limit', () => {
		//given
		const limit = 123;
		const action = createAction(actions.setLimit.type, limit);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.limit).toEqual(limit);
	});
	it('Sets page', () => {
		//given
		const page = 123;
		const action = createAction(actions.setPage.type, page);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.page).toEqual(page);
	});
	it('Sets sort', () => {
		//given
		const sort = 'rating';
		const action = createAction(actions.setSort.type, sort);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.sort).toEqual(sort);
	});
	it('Sets sort order', () => {
		//given
		const sort = 'asc';
		const action = createAction(actions.setSortOrder.type, sort);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.sortOrder).toEqual(sort);
	});
	it('Clear reset to initialState', () => {
		//given
		const context = 'ctx';
		const action = createAction(actions.clear.type, { context });
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
		const result = reducer({ [context]: state }, action);

		// then
		expect(result).toStrictEqual(initialState);
	});
	it('Sets tag options when getTagsByPatternFromApi is fullfiled', () => {
		// given
		const tags = [mTag({ tag: 'tag1' })];
		const action = createAction(thunks.onlineSearchForm.getTagsByPatternFromApi.fulfilled.type, tags);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.tagOptions).toStrictEqual(tags);
	});
	it('Increments page on fetchMorePosts fulfilled', () => {
		//given
		const action = createPendingAction(thunks.onlineSearchForm.fetchMorePosts.fulfilled.type);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.page).toEqual(1);
	});
});
