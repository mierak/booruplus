import React from 'react';
import { render, screen, fireEvent, createEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { actions } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import '@testing-library/jest-dom';
import { mState } from '../../helpers/store.helper';

import SelectedTags from '../../../src/components/search-form/SelectedTags';
import { mTag } from '../../helpers/test.helper';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('search-from/SelectedTags', () => {
	it('Renders correctly for online mode', () => {
		// given
		const selectedTags = [mTag({ tag: 'selected1', id: 1 }), mTag({ tag: 'selected2', id: 2 })];
		const store = mockStore(
			mState({
				onlineSearchForm: {
					selectedTags,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<SelectedTags mode='online' />
			</Provider>
		);

		// then
		expect(screen.getByText(selectedTags[0].tag)).not.toBeNull();
		expect(screen.getByText(selectedTags[1].tag)).not.toBeNull();
	});
	it('Renders correctly for offline mode', () => {
		// given
		const selectedTags = [mTag({ tag: 'selected1', id: 1 }), mTag({ tag: 'selected2', id: 2 })];
		const store = mockStore(
			mState({
				downloadedSearchForm: {
					selectedTags,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<SelectedTags mode='offline' />
			</Provider>
		);

		// then
		expect(screen.getByText(selectedTags[0].tag)).not.toBeNull();
		expect(screen.getByText(selectedTags[1].tag)).not.toBeNull();
	});
	it('Removes tag correctly for offline mode', () => {
		// given
		const selectedTags = [mTag({ tag: 'selected1', id: 1 }), mTag({ tag: 'selected2', id: 2 })];
		const store = mockStore(
			mState({
				downloadedSearchForm: {
					selectedTags,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<SelectedTags mode='offline' />
			</Provider>
		);
		fireEvent.click(screen.getAllByRole('img', { name: 'close' })[0]);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: actions.downloadedSearchForm.removeTag.type, payload: selectedTags[0] });
	});
	it('Removes tag correctly for online mode', () => {
		// given
		const selectedTags = [mTag({ tag: 'selected1', id: 1 }), mTag({ tag: 'selected2', id: 2 })];
		const store = mockStore(
			mState({
				onlineSearchForm: {
					selectedTags,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<SelectedTags mode='online' />
			</Provider>
		);
		fireEvent.click(screen.getAllByRole('img', { name: 'close' })[0]);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: actions.onlineSearchForm.removeTag.type, payload: selectedTags[0] });
	});
	it('Removes excluded tag and adds it to selected tags for online mode', () => {
		// given
		const tag = mTag({ id: 1, tag: 'excludedTag' });
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<SelectedTags mode='online' />
			</Provider>
		);
		const destination = screen.getByTestId('selected-tags-container');
		const dropEvent = createEvent.drop(destination);
		Object.defineProperty(dropEvent, 'dataTransfer', {
			value: {
				getData: (): string => JSON.stringify(tag),
			},
		});
		fireEvent(destination, dropEvent);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: actions.onlineSearchForm.removeExcludedTag.type, payload: tag });
		expect(dispatchedActions).toContainMatchingAction({ type: actions.onlineSearchForm.addTag.type, payload: tag });
	});
	it('Removes excluded tag and adds it to selected tags for offline mode', () => {
		// given
		const tag = mTag({ id: 1, tag: 'excludedTag' });
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<SelectedTags mode='offline' />
			</Provider>
		);
		const destination = screen.getByTestId('selected-tags-container');
		const dropEvent = createEvent.drop(destination);
		Object.defineProperty(dropEvent, 'dataTransfer', {
			value: {
				getData: (): string => JSON.stringify(tag),
			},
		});
		fireEvent(destination, dropEvent);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: actions.downloadedSearchForm.removeExcludedTag.type, payload: tag });
		expect(dispatchedActions).toContainMatchingAction({ type: actions.downloadedSearchForm.addTag.type, payload: tag });
	});
	it('Adds stringified tag to dataTransfer on drag start over tage', () => {
		// given
		const tag = mTag({ id: 1, tag: 'excludedTag' });
		const store = mockStore(
			mState({
				onlineSearchForm: {
					selectedTags: [tag],
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<SelectedTags mode='online' />
			</Provider>
		);
		const source = screen.getByText(tag.tag);
		const dragStartEvent = createEvent.dragStart(source);
		const setDataSpy = jest.fn();
		Object.defineProperty(dragStartEvent, 'dataTransfer', {
			value: {
				setData: setDataSpy,
			},
		});
		fireEvent(source, dragStartEvent);

		// then
		expect(setDataSpy).toBeCalledWith('tag', JSON.stringify(tag));
	});
	it('Adds stringified tag to dataTransfer on drag start over tage', () => {
		// given
		const tag = mTag({ id: 1, tag: 'excludedTag' });
		const store = mockStore(
			mState({
				onlineSearchForm: {
					selectedTags: [tag],
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<SelectedTags mode='online' />
			</Provider>
		);
		const source = screen.getByTestId('selected-tags-container');
		const dragStartEvent = createEvent.dragOver(source);
		const preventDefaultSpy = jest.fn();
		Object.defineProperty(dragStartEvent, 'preventDefault', {
			value: preventDefaultSpy,
		});
		fireEvent.dragStart(screen.getByText(tag.tag));
		fireEvent(source, dragStartEvent);

		// then
		expect(preventDefaultSpy).toBeCalledTimes(1);
	});
});