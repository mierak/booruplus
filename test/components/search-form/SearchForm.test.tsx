import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../helpers/store.helper';

import SearchForm from '../../../src/components/search-form/SearchForm';
import '@testing-library/jest-dom';
import { mTag } from '../../helpers/test.helper';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('SearchForm', () => {
	const context = 'ctx';
	it('Renders correctly in online mode', async () => {
		// given
		const store = mockStore(
			mState({
				searchContexts: {
					[context]: {
						mode: 'online',
						page: 12,
						sort: 'rating',
						rating: 'questionable',
						sortOrder: 'asc',
						selectedTags: [mTag({ id: 1, tag: 'tag1' })],
						excludedTags: [mTag({ id: 2, tag: 'tag2' })],
					},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<SearchForm context={context} />
			</Provider>
		);

		// then
		expect(screen.getByText('Find Tag')).not.toBeNull();
		expect(screen.getByText('Selected Tags')).not.toBeNull();
		expect(screen.getByText('Excluded Tags')).not.toBeNull();
		expect(screen.getByText('Post Count')).not.toBeNull();
		expect(screen.getByText('Page')).not.toBeNull();
		expect(screen.getByText('Sort')).not.toBeNull();
		expect(screen.getByText('Order')).not.toBeNull();
		expect(screen.getByText('Questionable')).not.toBeNull();
		expect(screen.getAllByText('Rating')).toHaveLength(2);
		expect(screen.getByDisplayValue('100')).not.toBeNull();
		expect(screen.getByDisplayValue('12')).not.toBeNull();
		expect(screen.getByRole('radio', { name: 'Asc' })).toBeChecked();
		expect(screen.getByRole('radio', { name: 'Desc' })).not.toBeChecked();
		expect(screen.queryByRole('checkbox', { name: 'Favorites' })).toBeNull();
	});
	it('Renders correctly in offline mode', async () => {
		// given
		const store = mockStore(
			mState({
				searchContexts: {
					[context]: {
						mode: 'offline',
						page: 12,
						sort: 'rating',
						rating: 'questionable',
						sortOrder: 'asc',
						selectedTags: [mTag({ id: 1, tag: 'tag1' })],
						excludedTags: [mTag({ id: 2, tag: 'tag2' })],
					},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<SearchForm context={context} />
			</Provider>
		);

		// then
		expect(screen.getByText('Find Tag')).not.toBeNull();
		expect(screen.getByText('Selected Tags')).not.toBeNull();
		expect(screen.getByText('Excluded Tags')).not.toBeNull();
		expect(screen.getByText('Post Count')).not.toBeNull();
		expect(screen.getByText('Page')).not.toBeNull();
		expect(screen.getByText('Sort')).not.toBeNull();
		expect(screen.getByText('Order')).not.toBeNull();
		expect(screen.getByText('Questionable')).not.toBeNull();
		expect(screen.getAllByText('Rating')).toHaveLength(2);
		expect(screen.getByDisplayValue('100')).not.toBeNull();
		expect(screen.getByDisplayValue('12')).not.toBeNull();
		expect(screen.getByRole('radio', { name: 'Asc' })).toBeChecked();
		expect(screen.getByRole('radio', { name: 'Desc' })).not.toBeChecked();
		expect(screen.getByRole('checkbox', { name: 'Non-Blacklisted' })).not.toBeNull();
		expect(screen.getByRole('checkbox', { name: 'Blacklisted' })).not.toBeNull();
		expect(screen.getByRole('checkbox', { name: 'Favorites' })).not.toBeNull();
		expect(screen.getByRole('checkbox', { name: 'Images' })).not.toBeNull();
		expect(screen.getByRole('checkbox', { name: 'Gifs' })).not.toBeNull();
		expect(screen.getByRole('checkbox', { name: 'Videos' })).not.toBeNull();
	});
});
