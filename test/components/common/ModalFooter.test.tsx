import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../helpers/store.helper';

import ModalFooter from '../../../src/components/common/ModalFooter';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('favorites/modal/common/ModalFooter', () => {
	const okText = 'test ok';
	const cancelText = 'test cancel';
	const onConfirm = jest.fn();
	const onCancel = jest.fn();
	beforeEach(() => {
		jest.clearAllMocks();
	});
	it('Renders correctly', () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<ModalFooter okText={okText} cancelText={cancelText} onCancel={onCancel} onConfirm={onConfirm} />
			</Provider>
		);

		// then
		expect(screen.getByRole('button', { name: okText })).not.toBeNull();
		expect(screen.getByRole('button', { name: cancelText })).not.toBeNull();
	});
	it('Calls onClose when OK button is clicked', () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<ModalFooter okText={okText} cancelText={cancelText} onCancel={onCancel} onConfirm={onConfirm} />
			</Provider>
		);
		fireEvent.click(screen.getByRole('button', { name: okText }));

		// then
		expect(onConfirm).toBeCalledTimes(1);
		expect(onCancel).toBeCalledTimes(0);
	});
	it('Calls onClose when Close button is clicked', () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<ModalFooter okText={okText} cancelText={cancelText} onCancel={onCancel} onConfirm={onConfirm} />
			</Provider>
		);
		fireEvent.click(screen.getByRole('button', { name: cancelText }));

		// then
		expect(onConfirm).toBeCalledTimes(0);
		expect(onCancel).toBeCalledTimes(1);
	});
});
