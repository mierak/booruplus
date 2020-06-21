import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { actions } from '../../src/store';
import { RootState, AppDispatch } from '../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../helpers/store.helper';

import EmptyThumbnails from '../../src/components/EmptyThumbnails';
import '@testing-library/jest-dom';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('EmptyThumbnails', () => {
	it('Renders correctly', () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<EmptyThumbnails />
			</Provider>
		);

		// then
		expect(screen.getByText('Open Search Form')).not.toBeNull();
		expect(screen.getByText('No Posts To Show')).not.toBeNull();
	});
	it('Opens online search form on button click', () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<EmptyThumbnails />
			</Provider>
		);
		fireEvent.click(screen.getByText('Open Search Form'));

		// then
		expect(store.getActions()).toContainMatchingAction({ type: actions.system.setSearchFormDrawerVisible.type, payload: true });
	});
});
