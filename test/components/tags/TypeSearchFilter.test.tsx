import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../helpers/store.helper';

import TypeSearchFilter from '../../../src/components/tags/TypeSearchFilter';
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
				<TypeSearchFilter confirm={confirm} onSearch={search} visible={true} />
			</Provider>
		);

		// then
		expect(screen.getByRole('button', { name: 'search OK' })).not.toBeNull();
		expect(screen.getByRole('button', { name: 'Reset' })).not.toBeNull();
		expect(screen.getByRole('checkbox', { name: 'Artist' }));
		expect(screen.getByRole('checkbox', { name: 'Character' }));
		expect(screen.getByRole('checkbox', { name: 'Copyright' }));
		expect(screen.getByRole('checkbox', { name: 'Metadata' }));
		expect(screen.getByRole('checkbox', { name: 'Tag' }));
	});
	it('Calls confirm() callback on OK click', () => {
		// given
		const store = mockStore(mState());
		const confirm = jest.fn();
		const search = jest.fn();

		// when
		render(
			<Provider store={store}>
				<TypeSearchFilter confirm={confirm} onSearch={search} visible={true} />
			</Provider>
		);
		fireEvent.click(screen.getByRole('checkbox', { name: 'Artist' }));
		fireEvent.click(screen.getByRole('checkbox', { name: 'Character' }));
		fireEvent.click(screen.getByRole('checkbox', { name: 'Copyright' }));
		fireEvent.click(screen.getByRole('button', { name: 'search OK' }));

		// then
		expect(search).toBeCalledTimes(1);
		expect(search).toBeCalledWith(['metadata', 'tag']);
		expect(confirm).toBeCalledTimes(1);
	});
	it('Calls confirm() with default values', () => {
		// given
		const store = mockStore(mState());
		const confirm = jest.fn();
		const search = jest.fn();

		// when
		render(
			<Provider store={store}>
				<TypeSearchFilter confirm={confirm} onSearch={search} visible={true} />
			</Provider>
		);
		fireEvent.click(screen.getByRole('checkbox', { name: 'Artist' }));
		fireEvent.click(screen.getByRole('checkbox', { name: 'Character' }));
		fireEvent.click(screen.getByRole('checkbox', { name: 'Copyright' }));
		fireEvent.click(screen.getByRole('checkbox', { name: 'Metadata' }));
		fireEvent.click(screen.getByRole('checkbox', { name: 'Tag' }));
		fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

		// then
		expect(search).toBeCalledTimes(1);
		expect(search).toBeCalledWith(['artist', 'character', 'copyright', 'metadata', 'tag']);
		expect(confirm).toBeCalledTimes(1);
	});
});
