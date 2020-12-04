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
	beforeEach(() => {
		jest.clearAllMocks();
	});
	it('Renders correctly for online mode', async () => {
		// given
		const tagOptions = [
			mTag({ id: 1, tag: 'opt1', type: 'artist' }),
			mTag({ id: 2, tag: 'opt2', type: 'character' }),
			mTag({ id: 3, tag: 'opt3', type: 'metadata' }),
		];
		const store = mockStore(
			mState({
				onlineSearchForm: {
					tagOptions,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<TagSearch mode='online' open />
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
	it('Renders correctly for offline mode', async () => {
		// given
		const tagOptions = [
			mTag({ id: 1, tag: 'opt1', type: 'artist' }),
			mTag({ id: 2, tag: 'opt2', type: 'character' }),
			mTag({ id: 3, tag: 'opt3', type: 'metadata' }),
		];
		const store = mockStore(
			mState({
				downloadedSearchForm: {
					tagOptions,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<TagSearch mode='offline' open />
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
	it('Dispatches addTag for online mode', async () => {
		// given
		const tagOptions = [
			mTag({ id: 1, tag: 'opt1', type: 'artist' }),
			mTag({ id: 2, tag: 'opt2', type: 'character' }),
			mTag({ id: 3, tag: 'opt3', type: 'metadata' }),
		];
		const store = mockStore(
			mState({
				onlineSearchForm: {
					tagOptions,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<TagSearch mode='online' open />
			</Provider>
		);
		fireEvent.click(screen.getByText('opt2 | Count: 123'));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.onlineSearchForm.addTag.type,
			payload: tagOptions[1],
		});
		await waitFor(() => undefined);
	});
	it('Dispatches addTag for offline mode', async () => {
		// given
		const tagOptions = [
			mTag({ id: 1, tag: 'opt1', type: 'artist' }),
			mTag({ id: 2, tag: 'opt2', type: 'character' }),
			mTag({ id: 3, tag: 'opt3', type: 'metadata' }),
		];
		const store = mockStore(
			mState({
				downloadedSearchForm: {
					tagOptions,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<TagSearch mode='offline' open />
			</Provider>
		);
		fireEvent.click(screen.getByText('opt2 | Count: 123'));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.downloadedSearchForm.addTag.type,
			payload: tagOptions[1],
		});
		await waitFor(() => undefined);
	});

	it('Calls useDebounce correct amount of times and dispatches search for online mode', async () => {
		// given
		const store = mockStore(
			mState({
				onlineSearchForm: {
					tagOptions: [],
				},
			})
		);
		const debounceSpy = jest.spyOn(debouce, 'useDebounce');

		// when
		render(
			<Provider store={store}>
				<TagSearch mode='online' />
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
				meta: { arg: 'asdf' },
			})
		);
		expect(debounceSpy).toBeCalledTimes(3);
	});
	it('Calls useDebounce correct amount of times and dispatches search for offline mode', async () => {
		// given
		const store = mockStore(
			mState({
				onlineSearchForm: {
					tagOptions: [],
				},
			})
		);
		const debounceSpy = jest.spyOn(debouce, 'useDebounce');

		// when
		render(
			<Provider store={store}>
				<TagSearch mode='offline' />
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
				meta: { arg: 'asdf' },
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
			})
		);

		// when
		render(
			<Provider store={store}>
				<TagSearch mode='offline' open />
			</Provider>
		);

		// then
		expect(screen.getByText('Fetching tags...')).not.toBeNull();
	});
});
