import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../helpers/store.helper';

import TagSearchFilter from '../../../src/components/tags/TagSearchFilter';
import '@testing-library/jest-dom';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('tags/TagSearchFilter', () => {
	it('Renders correctly', () => {
		// given
		const store = mockStore(mState());
		const confirm = jest.fn();
		const search = jest.fn();

		// when
		render(
			<Provider store={store}>
				<TagSearchFilter confirm={confirm} onSearch={search} visible={true} />
			</Provider>
		);

		// then
		expect(screen.getByRole('button', { name: 'search Search' })).not.toBeNull();
		expect(screen.getByRole('button', { name: 'Reset' })).not.toBeNull();
		expect(screen.getByRole('textbox')).toHaveFocus();
	});
	it('Calls confirm() callback on Search click', () => {
		// given
		const store = mockStore(mState());
		const confirm = jest.fn();
		const search = jest.fn();

		// when
		render(
			<Provider store={store}>
				<TagSearchFilter confirm={confirm} onSearch={search} visible={true} />
			</Provider>
		);
		fireEvent.change(screen.getByRole('textbox'), { target: { value: 'asdftest' } });
		fireEvent.click(screen.getByRole('button', { name: 'search Search' }));

		// then
		expect(search).toBeCalledTimes(1);
		expect(search).toBeCalledWith('asdftest');
		expect(confirm).toBeCalledTimes(1);
	});
	it('Sets value to empty string, calls onSearch() and confirm()', () => {
		// given
		const store = mockStore(mState());
		const confirm = jest.fn();
		const search = jest.fn();

		// when
		render(
			<Provider store={store}>
				<TagSearchFilter confirm={confirm} onSearch={search} visible={true} />
			</Provider>
		);
		fireEvent.change(screen.getByRole('textbox'), { target: { value: 'asdftest' } });
		fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

		// then
		expect(search).toBeCalledTimes(1);
		expect(search).toBeCalledWith('');
		expect(confirm).toBeCalledTimes(1);
	});
});
