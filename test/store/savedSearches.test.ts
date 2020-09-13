import { doDatabaseMock } from '../helpers/database.mock';
doDatabaseMock();
import reducer, { actions, initialState, SavedSearchesState } from '../../src/store/savedSearches';
import { thunks } from '../../src/store/';
import { createAction, mSavedSearch, mSavedSearchPreview } from '../helpers/test.helper';
import { NoActiveSavedSearchError, SavedSearchAlreadyExistsError } from '@errors/savedSearchError';

describe('store/savedSearches', () => {
	describe('setActiveSavedSearch()', () => {
		it('Sets active Saved Search by id', () => {
			// given
			const savedSearch = mSavedSearch({ id: 123 });
			const action = createAction(actions.setActiveSavedSearch.type, savedSearch.id);
			const state: SavedSearchesState = {
				...initialState,
				activeSavedSearch: undefined,
				savedSearches: [mSavedSearch({ id: 1 }), savedSearch, mSavedSearch({ id: 2 }), mSavedSearch({ id: 3 })],
			};

			// when
			const result = reducer(state, action);

			// then
			expect(result.activeSavedSearch?.id).toBe(savedSearch.id);
		});
		it('Sets active Saved Search with SavedSearch oject', () => {
			// given
			const savedSearch = mSavedSearch({ id: 123 });
			const action = createAction(actions.setActiveSavedSearch.type, savedSearch);
			const state: SavedSearchesState = {
				...initialState,
				activeSavedSearch: undefined,
				savedSearches: [mSavedSearch({ id: 1 }), mSavedSearch({ id: 2 }), mSavedSearch({ id: 3 })],
			};

			// when
			const result = reducer(state, action);

			// then
			expect(result.activeSavedSearch).toMatchObject(savedSearch);
		});
	});
	it('Updates saved search when searchOnline is fullfiled', () => {
		// given
		const savedSearch = mSavedSearch({ id: 123 });
		const updatedSearch = { ...savedSearch, lastSearched: 'updated' };
		const action = createAction(thunks.savedSearches.searchOnline.fulfilled.type, updatedSearch);
		const state: SavedSearchesState = {
			...initialState,
			savedSearches: [mSavedSearch({ id: 1 }), savedSearch, mSavedSearch({ id: 2 })],
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.savedSearches[1]).toMatchObject(updatedSearch);
		expect(result.activeSavedSearch).toMatchObject(updatedSearch);
	});
	it('Updates saved search when searchOffline is fullfiled', () => {
		// given
		const savedSearch = mSavedSearch({ id: 123 });
		const updatedSearch = { ...savedSearch, lastSearched: 'updated' };
		const action = createAction(thunks.savedSearches.searchOffline.fulfilled.type, updatedSearch);
		const state: SavedSearchesState = {
			...initialState,
			savedSearches: [mSavedSearch({ id: 1 }), savedSearch, mSavedSearch({ id: 2 })],
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.savedSearches[1]).toMatchObject(updatedSearch);
		expect(result.activeSavedSearch).toMatchObject(updatedSearch);
	});
	it('Adds saved search when saveSearch is fulfilled', () => {
		// given
		const savedSearch = mSavedSearch({ id: 123 });
		const action = createAction(thunks.savedSearches.saveSearch.fulfilled.type, savedSearch);
		const state: SavedSearchesState = {
			...initialState,
			savedSearches: [],
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.savedSearches).toHaveLength(1);
		expect(result.savedSearches[0]).toMatchObject(savedSearch);
	});
	it('Sets savedSearches when loadSavedSearchesFromDb is fulfilled', () => {
		// given
		const savedSearches = [mSavedSearch({ id: 123 }), mSavedSearch({ id: 456 })];
		const action = createAction(thunks.savedSearches.loadSavedSearchesFromDb.fulfilled.type, savedSearches);
		const state: SavedSearchesState = {
			...initialState,
			savedSearches: [],
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.savedSearches).toHaveLength(savedSearches.length);
		expect(result.savedSearches).toStrictEqual(savedSearches);
	});
	it('Removes preview when removePreview is fulfilled', () => {
		// given
		const savedSearchId = 123;
		const previewId = 789;
		const savedSearch = mSavedSearch({
			id: savedSearchId,
			previews: [mSavedSearchPreview({ id: 456 }), mSavedSearchPreview({ id: previewId })],
		});
		const action = createAction(thunks.savedSearches.removePreview.fulfilled.type, { savedSearchId, previewId });
		const state: SavedSearchesState = {
			...initialState,
			savedSearches: [savedSearch],
		};

		// when
		const result = reducer(state, action);

		// then
		expect(result.savedSearches[0].previews).toHaveLength(1);
		expect(result.savedSearches[0].previews[0].id).toBe(456);
	});
	describe('extraReducers', () => {
		describe('thunks/savedSearches/saveSearch', () => {
			describe('savedSearches', () => {
				describe('saveSearch', () => {
					it('fulfilled', () => {
						// given
						const savedSearch = mSavedSearch({ id: 123 });
						const action = createAction(thunks.savedSearches.saveSearch.fulfilled.type, savedSearch);
						const state: SavedSearchesState = {
							...initialState,
							savedSearches: [],
							activeSavedSearch: undefined,
						};

						// when
						const result = reducer(state, action);

						// then
						expect(result.activeSavedSearch).toMatchObject(savedSearch);
						expect(result.savedSearches[0]).toMatchObject(savedSearch);
					});
					it('rejected', () => {
						// given
						const savedSearch = mSavedSearch({ id: 123 });
						const err = new SavedSearchAlreadyExistsError(savedSearch);
						const action = createAction(thunks.savedSearches.saveSearch.rejected.type, err);
						const state: SavedSearchesState = {
							...initialState,
							savedSearches: [],
							activeSavedSearch: undefined,
						};

						// when
						const result = reducer(state, action);

						// then
						expect(result.activeSavedSearch).toMatchObject(savedSearch);
					});
				});
				describe('addPreviewsToSavedSearch()', () => {
					it('rejected', () => {
						// given
						const err = new NoActiveSavedSearchError();
						const action = createAction(thunks.savedSearches.saveSearch.rejected.type, err);
						const state: SavedSearchesState = initialState;
						const notificationSpy = jest.spyOn(err, 'showNotification').mockImplementationOnce(() => undefined);

						// when
						reducer(state, action);

						// then
						expect(notificationSpy).toHaveBeenCalledTimes(1);
					});
				});
				describe('remove()', () => {
					it('fulfilled', () => {
						// given
						const savedSearch = mSavedSearch({ id: 123 });
						const action = createAction(thunks.savedSearches.remove.fulfilled.type, savedSearch.id);
						const state: SavedSearchesState = {
							...initialState,
							savedSearches: [mSavedSearch({ id: 1 }), savedSearch, mSavedSearch({ id: 2 })],
						};

						// when
						const result = reducer(state, action);

						// then
						expect(result.savedSearches).toHaveLength(2);
						expect(result.savedSearches[0].id).toBe(1);
						expect(result.savedSearches[1].id).toBe(2);
					});
				});
			});
		});
	});
});
