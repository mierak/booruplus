import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { thunks, actions } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../helpers/store.helper';

import SavedSearches from '../../../src/pages/SavedSearches';
import '@testing-library/jest-dom';
import { mTag, mSavedSearch, mSavedSearchPreview } from '../../helpers/test.helper';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('pages/SavedSearches', () => {
	it('Renders correctly', () => {
		// given
		const store = mockStore(
			mState({
				savedSearches: {
					savedSearches: [
						mSavedSearch({ id: 1, tags: [mTag({ id: 1, tag: 'tag1' })], rating: 'any', lastSearched: 'somedate' }),
						mSavedSearch({ id: 2, excludedTags: [mTag({ id: 2, tag: 'tag2' })] }),
						mSavedSearch({ id: 3, tags: [mTag({ id: 3, tag: 'tag3' })], rating: 'questionable' }),
					],
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<SavedSearches />
			</Provider>
		);

		// then
		expect(screen.getByRole('columnheader', { name: 'Tags' })).not.toBeNull();
		expect(screen.getByRole('columnheader', { name: 'Excluded Tags' })).not.toBeNull();
		expect(screen.getByRole('columnheader', { name: 'Rating' })).not.toBeNull();
		expect(screen.getByRole('columnheader', { name: 'Last Searched' })).not.toBeNull();
		expect(screen.getByRole('columnheader', { name: 'Actions' })).not.toBeNull();
		expect(screen.getByRole('row', { name: 'tag1 any somedate Online Offline Delete' }));
		expect(screen.getByRole('row', { name: 'tag2 explicit Never Online Offline Delete' }));
		expect(screen.getByRole('row', { name: 'tag3 questionable Never Online Offline Delete' }));
	});
	it('Calls searchOnline with correct Saved Search when Online buttons is pressed()', () => {
		// given
		const savedSearches = [
			mSavedSearch({ id: 1, tags: [mTag({ id: 1, tag: 'tag1' })], rating: 'any', lastSearched: 'somedate' }),
			mSavedSearch({ id: 2, excludedTags: [mTag({ id: 2, tag: 'tag2' })] }),
			mSavedSearch({ id: 3, tags: [mTag({ id: 3, tag: 'tag3' })], rating: 'questionable' }),
		];
		const store = mockStore(
			mState({
				savedSearches: {
					savedSearches,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<SavedSearches />
			</Provider>
		);
		fireEvent.click(screen.getAllByRole('button', { name: 'Online' })[2]);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: thunks.savedSearches.searchOnline.pending.type,
			meta: { arg: savedSearches[2] },
		});
	});
	it('Calls searchOffline with correct Saved Search when Offline buttons is pressed()', () => {
		// given
		const savedSearches = [
			mSavedSearch({ id: 1, tags: [mTag({ id: 1, tag: 'tag1' })], rating: 'any', lastSearched: 'somedate' }),
			mSavedSearch({ id: 2, excludedTags: [mTag({ id: 2, tag: 'tag2' })] }),
			mSavedSearch({ id: 3, tags: [mTag({ id: 3, tag: 'tag3' })], rating: 'questionable' }),
		];
		const store = mockStore(
			mState({
				savedSearches: {
					savedSearches,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<SavedSearches />
			</Provider>
		);
		fireEvent.click(screen.getAllByRole('button', { name: 'Offline' })[2]);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: thunks.savedSearches.searchOffline.pending.type,
			meta: { arg: savedSearches[2] },
		});
	});
	it('Calls removeSavedSearch with correct Saved Search when Delete buttons is pressed()', () => {
		// given
		const savedSearches = [
			mSavedSearch({ id: 1, tags: [mTag({ id: 1, tag: 'tag1' })], rating: 'any', lastSearched: 'somedate' }),
			mSavedSearch({ id: 2, excludedTags: [mTag({ id: 2, tag: 'tag2' })] }),
			mSavedSearch({ id: 3, tags: [mTag({ id: 3, tag: 'tag3' })], rating: 'questionable' }),
		];
		const store = mockStore(
			mState({
				savedSearches: {
					savedSearches,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<SavedSearches />
			</Provider>
		);
		fireEvent.click(screen.getAllByRole('button', { name: 'Delete' })[2]);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.savedSearches.removeSavedSearch.type,
			payload: savedSearches[2],
		});
	});
	it('Renders previews when expand button is clicked', () => {
		// given
		const savedSearches = [
			mSavedSearch({
				id: 1,
				tags: [mTag({ id: 1, tag: 'tag1' })],
				rating: 'any',
				lastSearched: 'somedate',
				previews: [
					mSavedSearchPreview({ id: 1, objectUrl: 'url1' }),
					mSavedSearchPreview({ id: 2, objectUrl: 'url2' }),
					mSavedSearchPreview({ id: 3, objectUrl: 'url3' }),
				],
			}),
			mSavedSearch({ id: 2, excludedTags: [mTag({ id: 2, tag: 'tag2' })] }),
			mSavedSearch({ id: 3, tags: [mTag({ id: 3, tag: 'tag3' })], rating: 'questionable' }),
		];
		const store = mockStore(
			mState({
				savedSearches: {
					savedSearches,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<SavedSearches />
			</Provider>
		);
		fireEvent.click(screen.getAllByRole('button', { name: 'Expand row' })[0]);

		// then
		expect(screen.getAllByTestId('preview-image')[0]).toHaveAttribute('src', 'url1');
		expect(screen.getAllByTestId('preview-image')[1]).toHaveAttribute('src', 'url2');
		expect(screen.getAllByTestId('preview-image')[2]).toHaveAttribute('src', 'url3');
	});
	it('Dispatches removePreview() when delete button on preview is clicked', async () => {
		// given
		const savedSearches = [
			mSavedSearch({
				id: 1,
				tags: [mTag({ id: 1, tag: 'tag1' })],
				rating: 'any',
				lastSearched: 'somedate',
				previews: [
					mSavedSearchPreview({ id: 1, objectUrl: 'url1' }),
					mSavedSearchPreview({ id: 2, objectUrl: 'url2' }),
					mSavedSearchPreview({ id: 3, objectUrl: 'url3' }),
				],
			}),
			mSavedSearch({ id: 2, excludedTags: [mTag({ id: 2, tag: 'tag2' })] }),
			mSavedSearch({ id: 3, tags: [mTag({ id: 3, tag: 'tag3' })], rating: 'questionable' }),
		];
		const store = mockStore(
			mState({
				savedSearches: {
					savedSearches,
				},
			})
		);

		// when
		const { unmount } = render(
			<Provider store={store}>
				<SavedSearches />
			</Provider>
		);
		fireEvent.click(screen.getAllByRole('button', { name: 'Expand row' })[0]);
		fireEvent.click(screen.getAllByRole('img', { name: 'delete' })[1]);
		await waitFor(() => screen.getByText('Delete preview from Saved Search?'));
		fireEvent.click(screen.getAllByRole('button', { name: 'Delete' })[3]);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: thunks.savedSearches.removePreview.pending.type,
			meta: { arg: { savedSearch: savedSearches[0], previewId: 2 } },
		});
		unmount();
	});
});
