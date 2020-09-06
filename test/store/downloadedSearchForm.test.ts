import { doDatabaseMock } from '../helpers/database.mock';
doDatabaseMock();
import reducer, { actions, initialState } from '../../src/store/downloadedSearchForm';
import { thunks } from '../../src/store/';
import { createAction, mTag, createPendingAction } from '../helpers/test.helper';
import { DownloadedSearchFormState } from '@store/types';

describe('store/downloadedSearchForm', () => {
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
		const tag = mTag({ tag: 'tag1' });
		const action = createAction(actions.removeTag.type, tag);

		// when
		const result = reducer({ ...initialState, selectedTags: [tag] }, action);

		// then
		expect(result.selectedTags).not.toContain(tag);
	});
	it('Removes tag', () => {
		//given
		const tag = mTag({ tag: 'tag1' });
		const action = createAction(actions.removeExcludedTag.type, tag);

		// when
		const result = reducer({ ...initialState, excludedTags: [tag] }, action);

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
		const tags = [mTag({ tag: 'tag1' }), mTag({ tag: 'tag2' }), mTag({ tag: 'tag3' })];
		const action = createAction(actions.clearTagOptions.type, tags);

		// when
		const result = reducer({ ...initialState, tagOptions: tags }, action);

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
		const action = createAction(actions.setPostLimit.type, limit);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.postLimit).toEqual(limit);
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
	it('Toggles show non blacklisted', () => {
		//given
		const action = createAction(actions.toggleShowNonBlacklisted.type);

		// when
		const result = reducer({ ...initialState, showNonBlacklisted: false }, action);

		// then
		expect(result.showNonBlacklisted).toEqual(true);
	});
	it('Toggles show blacklisted', () => {
		//given
		const action = createAction(actions.toggleShowBlacklisted.type);

		// when
		const result = reducer({ ...initialState, showBlacklisted: false }, action);

		// then
		expect(result.showBlacklisted).toEqual(true);
	});
	it('Toggles show favorites', () => {
		//given
		const action = createAction(actions.toggleShowFavorites.type);

		// when
		const result = reducer({ ...initialState, showFavorites: false }, action);

		// then
		expect(result.showFavorites).toEqual(true);
	});
	it('Toggles show videos', () => {
		//given
		const action = createAction(actions.toggleShowVideos.type);

		// when
		const result = reducer({ ...initialState, showVideos: false }, action);

		// then
		expect(result.showVideos).toEqual(true);
	});
	it('Toggles show images', () => {
		//given
		const action = createAction(actions.toggleShowImages.type);

		// when
		const result = reducer({ ...initialState, showImages: false }, action);

		// then
		expect(result.showImages).toEqual(true);
	});
	it('Toggles show gifs', () => {
		//given
		const action = createAction(actions.toggleShowGifs.type);

		// when
		const result = reducer({ ...initialState, showGifs: false }, action);

		// then
		expect(result.showGifs).toEqual(true);
	});
	it('Clear reset to initialState', () => {
		//given
		const action = createAction(actions.clear.type);
		const state: DownloadedSearchFormState = {
			excludedTags: [],
			page: 123,
			postLimit: 123,
			rating: 'explicit',
			selectedTags: [],
			showBlacklisted: true,
			showFavorites: false,
			showGifs: false,
			showImages: false,
			showNonBlacklisted: false,
			showVideos: false,
			sort: 'resolution',
			sortOrder: 'asc',
			tagOptions: [],
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result).toStrictEqual(initialState);
	});
	it('Resets state properly when savedSearches searchOffline is pending', () => {
		//given
		const selectedTags = [mTag({ tag: 'tag1' })];
		const excludedTags = [mTag({ tag: 'tag2' })];
		const action = createPendingAction(thunks.savedSearches.searchOffline.pending.type, { arg: { tags: selectedTags, excludedTags } });

		// when
		const result = reducer({ ...initialState, page: 123 }, action);

		// then
		expect(result.selectedTags).toEqual(selectedTags);
		expect(result.excludedTags).toEqual(excludedTags);
		expect(result.page).toEqual(0);
	});
	it('Resets state properly when tags searchTagOffline is pending', () => {
		//given
		const selectedTag = mTag({ tag: 'tag1' });
		const excludedTags = [mTag({ tag: 'tag2' })];
		const action = createPendingAction(thunks.tags.searchTagOffline.pending.type, { arg: selectedTag });

		// when
		const result = reducer({ ...initialState, page: 123, excludedTags }, action);

		// then
		expect(result.selectedTags).toEqual([selectedTag]);
		expect(result.excludedTags).toEqual([]);
		expect(result.page).toEqual(0);
	});
	it('Increases page on fetchMorePosts', () => {
		//given
		const action = createPendingAction(thunks.downloadedSearchForm.fetchMorePosts.pending.type);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.page).toEqual(1);
	});
	it('Sets tag options on loadTagsByPattern fulfilled', () => {
		//given
		const tags = [mTag({ tag: 'tag1' })];
		const action = createAction(thunks.downloadedSearchForm.loadTagsByPattern.fulfilled.type, tags);

		// when
		const result = reducer(undefined, action);

		// then
		expect(result.tagOptions).toStrictEqual(tags);
	});
});
