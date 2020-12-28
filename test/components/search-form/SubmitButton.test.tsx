import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { actions } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import '@testing-library/jest-dom';
import { mState } from '../../helpers/store.helper';

import SubmitButton from '../../../src/components/search-form/SubmitButton';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('search-from/SubmitButton', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});
	const context = 'ctx';
	const onSubmitSpy = jest.fn();
	it('Renders correctly', () => {
		// given
		const store = mockStore(
			mState({
				onlineSearchForm: {
					[context]: {},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<SubmitButton context={context} onSubmit={onSubmitSpy} />
			</Provider>
		);

		// then
		expect(screen.getByRole('button', { name: 'Search' })).not.toBeNull();
		expect(screen.getByRole('button', { name: 'Search' })).not.toBeDisabled();
	});
	it('Is disabled when system.isSearchDisabled is true', () => {
		// given
		const store = mockStore(
			mState({
				loadingStates: {
					isSearchDisabled: true,
				},
				onlineSearchForm: {
					[context]: {},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<SubmitButton context={context} onSubmit={onSubmitSpy} />
			</Provider>
		);

		// then
		expect(screen.getByRole('button', { name: 'Search' })).toBeDisabled();
	});
	it('Calls onSubmit when pressed', () => {
		// given
		const store = mockStore(
			mState({
				loadingStates: {
					isSearchDisabled: false,
				},
				onlineSearchForm: {
					[context]: {},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<SubmitButton context={context} onSubmit={onSubmitSpy} />
			</Provider>
		);
		fireEvent.click(screen.getByRole('button'));

		// then
		expect(onSubmitSpy).toHaveBeenCalledTimes(1);
	});
	it('Renders PopConfirm when page is higher than 0 for online mode', () => {
		// given
		const page = 10;
		const store = mockStore(
			mState({
				onlineSearchForm: {
					[context]: {
						page,
					},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<SubmitButton context={context} onSubmit={onSubmitSpy} />
			</Provider>
		);
		fireEvent.click(screen.getByRole('button'));

		// then
		expect(screen.getByText(`Are you sure you want to start search from page ${page}?`)).not.toBeNull();
	});
	it('Does not set page to 0 and calls fetch posts if Popconfirm is accepted', () => {
		// given
		const page = 10;
		const store = mockStore(
			mState({
				// loadingStates: {
				// 	isSearchDisabled: false,
				// },
				onlineSearchForm: {
					[context]: {
						page,
					},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<SubmitButton context={context} onSubmit={onSubmitSpy} />
			</Provider>
		);
		fireEvent.click(screen.getByRole('button'));
		fireEvent.click(screen.getByRole('button', { name: `Start from page ${page}` }));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).not.toContainMatchingAction({
			type: actions.onlineSearchForm.setPage.type,
			payload: { context, data: 0 },
		});
		expect(onSubmitSpy).toHaveBeenCalledTimes(1);
	});
	it('Sets page to 0 and calls fetch posts if Popconfirm is accepted', () => {
		// given
		const page = 10;
		const store = mockStore(
			mState({
				onlineSearchForm: {
					[context]: {
						page,
					},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<SubmitButton context={context} onSubmit={onSubmitSpy} />
			</Provider>
		);
		fireEvent.click(screen.getByRole('button'));
		fireEvent.click(screen.getByRole('button', { name: 'Start from first page' }));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.onlineSearchForm.setPage.type,
			payload: { context, data: 0 },
		});
		expect(onSubmitSpy).toHaveBeenCalledTimes(1);
	});
});
