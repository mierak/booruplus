import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { thunks, actions } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../helpers/store.helper';

import TagSearch from '../../../src/components/search-form/TagSearch';
import { mTag } from '../../helpers/test.helper';
import * as debouce from '../../../src/hooks/useDebounce';
import { act } from 'react-dom/test-utils';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('settings/SettingsModal', () => {
	const context = 'ctx';
	beforeEach(() => {
		jest.clearAllMocks();
	});
	it('Renders correctly', async () => {
		// given
		const tagOptions = [
			mTag({ id: 1, tag: 'opt1', type: 'artist' }),
			mTag({ id: 2, tag: 'opt2', type: 'character' }),
			mTag({ id: 3, tag: 'opt3', type: 'metadata' }),
		];
		const store = mockStore(
			mState({
				onlineSearchForm: {
					[context]: {
						tagOptions,
					},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<TagSearch context={context} open />
			</Provider>
		);

		// then
		expect(screen.getByText('Artist')).not.toBeNull();
		expect(screen.getByText('Character')).not.toBeNull();
		expect(screen.getByText('Metadata')).not.toBeNull();
		expect(screen.getByText('opt1 | Count: 123')).not.toBeNull();
		expect(screen.getByText('opt2 | Count: 123')).not.toBeNull();
		expect(screen.getByText('opt3 | Count: 123')).not.toBeNull();
		await waitFor(() => undefined);
	});
	it('Dispatches addTag', async () => {
		// given
		const tagOptions = [
			mTag({ id: 1, tag: 'opt1', type: 'artist' }),
			mTag({ id: 2, tag: 'opt2', type: 'character' }),
			mTag({ id: 3, tag: 'opt3', type: 'metadata' }),
		];
		const store = mockStore(
			mState({
				onlineSearchForm: {
					[context]: {
						tagOptions,
					},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<TagSearch context={context} open />
			</Provider>
		);
		fireEvent.click(screen.getByText('opt2 | Count: 123'));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.onlineSearchForm.addTag.type,
			payload: { context, data: tagOptions[1] },
		});
		await waitFor(() => undefined);
	});

	it('Calls useDebounce correct amount of times and dispatches search', async () => {
		// given
		const store = mockStore(
			mState({
				onlineSearchForm: {
					[context]: {
						tagOptions: [],
					},
				},
			})
		);
		const debounceSpy = jest.spyOn(debouce, 'useDebounce');

		// when
		render(
			<Provider store={store}>
				<TagSearch context={context} />
			</Provider>
		);
		act(() => {
			fireEvent.change(screen.getByRole('combobox'), {
				target: { value: 'a' },
			});
			fireEvent.change(screen.getByRole('combobox'), {
				target: { value: 'as' },
			});
			fireEvent.change(screen.getByRole('combobox'), {
				target: { value: 'asd' },
			});
			fireEvent.change(screen.getByRole('combobox'), {
				target: { value: 'asdf' },
			});
		});

		// then
		const dispatchedActions = store.getActions();
		await waitFor(() =>
			expect(dispatchedActions).toContainMatchingAction({
				type: thunks.onlineSearchForm.getTagsByPatternFromApi.pending.type,
				meta: { arg: { context, pattern: 'asdf' } },
			})
		);
		expect(debounceSpy).toBeCalledTimes(3);
	});

	it('Calls useDebounce correct amount of times and dispatches offline search', async () => {
		// given
		const store = mockStore(
			mState({
				onlineSearchForm: {
					[context]: {
						mode: 'offline',
						tagOptions: [],
					},
				},
			})
		);
		const debounceSpy = jest.spyOn(debouce, 'useDebounce');

		// when
		render(
			<Provider store={store}>
				<TagSearch context={context} />
			</Provider>
		);
		act(() => {
			fireEvent.change(screen.getByRole('combobox'), {
				target: { value: 'a' },
			});
			fireEvent.change(screen.getByRole('combobox'), {
				target: { value: 'as' },
			});
			fireEvent.change(screen.getByRole('combobox'), {
				target: { value: 'asd' },
			});
			fireEvent.change(screen.getByRole('combobox'), {
				target: { value: 'asdf' },
			});
		});

		// then
		const dispatchedActions = store.getActions();
		await waitFor(() =>
			expect(dispatchedActions).toContainMatchingAction({
				type: thunks.downloadedSearchForm.loadTagsByPattern.pending.type,
				meta: { arg: { context, pattern: 'asdf' } },
			})
		);
		expect(debounceSpy).toBeCalledTimes(3);
	});
	it('Shows loading state properly', async () => {
		// given
		const store = mockStore(
			mState({
				system: {
					isTagOptionsLoading: true,
				},
				onlineSearchForm: {
					[context]: {},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<TagSearch context={context} open />
			</Provider>
		);

		// then
		expect(screen.getByText('Fetching tags...')).not.toBeNull();
	});
});
