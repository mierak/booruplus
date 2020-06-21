import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { thunks } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../helpers/store.helper';

import SaveSearchButton from '../../../src/components/search-form/SaveSearchButton';
import { mTag } from '../../helpers/test.helper';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('search-form/SaveSearchButton', () => {
	it('Renders correctly', () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<SaveSearchButton mode="online" />
			</Provider>
		);

		// then
		expect(screen.getByRole('button', { name: 'Save Search' })).not.toBeNull();
	});
	it('Dispatches saveSearch with correct params for online mode', () => {
		// given
		const selectedTags = [mTag({ tag: 'tag1' }), mTag({ tag: 'tag2' })];
		const excludedTags = [mTag({ tag: 'tag3' }), mTag({ tag: 'tag4' })];
		const rating = 'explicit';
		const store = mockStore(
			mState({
				onlineSearchForm: {
					selectedTags,
					excludedTags,
					rating,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<SaveSearchButton mode="online" />
			</Provider>
		);
		fireEvent.click(screen.getByRole('button', { name: 'Save Search' }));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: thunks.savedSearches.saveSearch.pending.type,
			meta: { arg: { tags: selectedTags, excludedTags, rating } },
		});
	});
	it('Dispatches saveSearch with correct params for offline mode', () => {
		// given
		const selectedTags = [mTag({ tag: 'tag1' }), mTag({ tag: 'tag2' })];
		const excludedTags = [mTag({ tag: 'tag3' }), mTag({ tag: 'tag4' })];
		const rating = 'explicit';
		const store = mockStore(
			mState({
				downloadedSearchForm: {
					selectedTags,
					excludedTags,
					rating,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<SaveSearchButton mode="offline" />
			</Provider>
		);
		fireEvent.click(screen.getByRole('button', { name: 'Save Search' }));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: thunks.savedSearches.saveSearch.pending.type,
			meta: { arg: { tags: selectedTags, excludedTags, rating } },
		});
	});
});
