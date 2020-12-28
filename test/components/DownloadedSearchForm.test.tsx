// import React from 'react';
// import { render, screen, fireEvent } from '@testing-library/react';
// import { Provider } from 'react-redux';
// import { actions } from '../../src/store';
// import { RootState, AppDispatch } from '../../src/store/types';
// import configureStore from 'redux-mock-store';
// import thunk from 'redux-thunk';
// import { mState } from '../helpers/store.helper';

// import DownloadedSearchForm from '../../src/components/SearchForm';
// import '@testing-library/jest-dom';
// import { mTag } from '../helpers/test.helper';

// const mockStore = configureStore<RootState, AppDispatch>([thunk]);

// describe('DownloadedSearchForm', () => {
// 	it('Renders correctly', async () => {
// 		// given
// 		const store = mockStore(
// 			mState({
// 				downloadedSearchForm: {
// 					page: 12,
// 					sort: 'rating',
// 					rating: 'questionable',
// 					sortOrder: 'asc',
// 					selectedTags: [mTag({ id: 1, tag: 'tag1' })],
// 					excludedTags: [mTag({ id: 2, tag: 'tag2' })],
// 				},
// 			})
// 		);

// 		// when
// 		render(
// 			<Provider store={store}>
// 				<DownloadedSearchForm />
// 			</Provider>
// 		);

// 		// then
// 		expect(screen.getByText('Find Tag')).not.toBeNull();
// 		expect(screen.getByText('Selected Tags')).not.toBeNull();
// 		expect(screen.getByText('Excluded Tags')).not.toBeNull();
// 		expect(screen.getByText('Post Count')).not.toBeNull();
// 		expect(screen.getByText('Page')).not.toBeNull();
// 		expect(screen.getByText('Sort')).not.toBeNull();
// 		expect(screen.getByText('Order')).not.toBeNull();
// 		expect(screen.getByText('Questionable')).not.toBeNull();
// 		expect(screen.getAllByText('Rating')).toHaveLength(2);
// 		expect(screen.getByDisplayValue('100')).not.toBeNull();
// 		expect(screen.getByDisplayValue('12')).not.toBeNull();
// 		expect(screen.getByRole('button', { name: 'Search' })).not.toBeNull();
// 		expect(screen.getByRole('button', { name: 'Clear' })).not.toBeNull();
// 		expect(screen.getByRole('button', { name: 'Close' })).not.toBeNull();
// 		expect(screen.getByRole('radio', { name: 'Asc' })).toBeChecked();
// 		expect(screen.getByRole('radio', { name: 'Desc' })).not.toBeChecked();
// 		expect(screen.getByRole('checkbox', { name: 'Non-Blacklisted' })).not.toBeNull();
// 		expect(screen.getByRole('checkbox', { name: 'Blacklisted' })).not.toBeNull();
// 		expect(screen.getByRole('checkbox', { name: 'Favorites' })).not.toBeNull();
// 		expect(screen.getByRole('checkbox', { name: 'Images' })).not.toBeNull();
// 		expect(screen.getByRole('checkbox', { name: 'Gifs' })).not.toBeNull();
// 		expect(screen.getByRole('checkbox', { name: 'Videos' })).not.toBeNull();
// 	});
// 	it('Dispatches clear() when CLear button is pressed', () => {
// 		// given
// 		const store = mockStore(mState());

// 		// when
// 		render(
// 			<Provider store={store}>
// 				<DownloadedSearchForm />
// 			</Provider>
// 		);
// 		fireEvent.click(screen.getByRole('button', { name: 'Clear' }));

// 		// then
// 		expect(store.getActions()).toContainMatchingAction({ type: actions.downloadedSearchForm.clear.type });
// 	});
// 	it('Dispatches setSearchFormDrawerVisible(false)when Close button is pressed', () => {
// 		// given
// 		const store = mockStore(mState());

// 		// when
// 		render(
// 			<Provider store={store}>
// 				<DownloadedSearchForm />
// 			</Provider>
// 		);
// 		fireEvent.click(screen.getByRole('button', { name: 'Close' }));

// 		// then
// 		expect(store.getActions()).toContainMatchingAction({ type: actions.system.setDownloadedSearchFormDrawerVisible.type, payload: false });
// 	});
// });
