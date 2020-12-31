import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../helpers/store.helper';

import SearchTab from '../../../src/components/common/SearchTab';
import { mTag } from '../../helpers/test.helper';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('common/SearchTab', () => {
	it('Renders with online icon correctly', () => {
		// given
		const title = 'tabtitle123';
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<SearchTab mode='online' title={title} />
			</Provider>
		);

		// then
		expect(screen.getByText(title)).not.toBeNull();
		expect(screen.getByRole('img', { name: 'global' }));
	});
	it('Renders with offline icon correctly', () => {
		// given
		const title = 'tabtitle123';
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<SearchTab mode='offline' title={title} />
			</Provider>
		);

		// then
		expect(screen.getByText(title)).not.toBeNull();
		expect(screen.getByRole('img', { name: 'disconnect' }));
	});
	it('Renders first tag as a title', () => {
		// given
		const context = 'ctx';
		const store = mockStore(
			mState({
				searchContexts: {
					[context]: {
						selectedTags: [mTag({ tag: 'shouldbetitle' }), mTag({ tag: 'shouldnotbetitle' })],
					},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<SearchTab mode='offline' title='' context={context} />
			</Provider>
		);

		// then
		expect(screen.getByText('shouldbetitle')).not.toBeNull();
	});
	it('Renders New Tab as a title', () => {
		// given
		const context = 'ctx';
		const store = mockStore(
			mState({
				searchContexts: {
					[context]: {},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<SearchTab mode='offline' title='' context={context} />
			</Provider>
		);

		// then
		expect(screen.getByText('New Tab')).not.toBeNull();
	});
});
