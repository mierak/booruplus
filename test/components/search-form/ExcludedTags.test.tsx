import React from 'react';
import { render, screen, fireEvent, createEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { actions } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import '@testing-library/jest-dom';
import { mState } from '../../helpers/store.helper';

import ExcludedTags from '../../../src/components/search-form/ExcludedTags';
import { mTag } from '../../helpers/test.helper';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('search-from/ExcludedTags', () => {
	it('Renders correctly for online mode', () => {
		// given
		const excludedTags = [mTag({ tag: 'excluded1', id: 1 }), mTag({ tag: 'excluded2', id: 2 })];
		const store = mockStore(
			mState({
				onlineSearchForm: {
					excludedTags,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<ExcludedTags mode='online' />
			</Provider>
		);

		// then
		expect(screen.getByText(excludedTags[0].tag)).not.toBeNull();
		expect(screen.getByText(excludedTags[1].tag)).not.toBeNull();
	});
	it('Renders correctly for offline mode', () => {
		// given
		const excludedTags = [mTag({ tag: 'excluded1', id: 1 }), mTag({ tag: 'excluded2', id: 2 })];
		const store = mockStore(
			mState({
				downloadedSearchForm: {
					excludedTags,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<ExcludedTags mode='offline' />
			</Provider>
		);

		// then
		expect(screen.getByText(excludedTags[0].tag)).not.toBeNull();
		expect(screen.getByText(excludedTags[1].tag)).not.toBeNull();
	});
	it('Removes tag correctly for offline mode', () => {
		// given
		const excludedTags = [mTag({ tag: 'excluded1', id: 1 }), mTag({ tag: 'excluded2', id: 2 })];
		const store = mockStore(
			mState({
				downloadedSearchForm: {
					excludedTags,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<ExcludedTags mode='offline' />
			</Provider>
		);
		fireEvent.click(screen.getAllByRole('img', { name: 'close' })[0]);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.downloadedSearchForm.removeExcludedTag.type,
			payload: excludedTags[0],
		});
	});
	it('Removes tag correctly for online mode', () => {
		// given
		const excludedTags = [mTag({ tag: 'excluded1', id: 1 }), mTag({ tag: 'excluded2', id: 2 })];
		const store = mockStore(
			mState({
				onlineSearchForm: {
					excludedTags,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<ExcludedTags mode='online' />
			</Provider>
		);
		fireEvent.click(screen.getAllByRole('img', { name: 'close' })[0]);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: actions.onlineSearchForm.removeExcludedTag.type, payload: excludedTags[0] });
	});
	it('Removes selected tag and adds it to excluded tags for online mode', () => {
		// given
		const tag = mTag({ id: 1, tag: 'tag1' });
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<ExcludedTags mode='online' />
			</Provider>
		);
		const destination = screen.getByTestId('excluded-tags-container');
		const dropEvent = createEvent.drop(destination);
		Object.defineProperty(dropEvent, 'dataTransfer', {
			value: {
				getData: (): string => JSON.stringify(tag),
			},
		});
		fireEvent(destination, dropEvent);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: actions.onlineSearchForm.removeTag.type, payload: tag });
		expect(dispatchedActions).toContainMatchingAction({ type: actions.onlineSearchForm.addExcludedTag.type, payload: tag });
	});
	it('Removes selected tag and adds it to excluded tags for offline mode', () => {
		// given
		const tag = mTag({ id: 1, tag: 'tag1' });
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<ExcludedTags mode='offline' />
			</Provider>
		);
		const destination = screen.getByTestId('excluded-tags-container');
		const dropEvent = createEvent.drop(destination);
		Object.defineProperty(dropEvent, 'dataTransfer', {
			value: {
				getData: (): string => JSON.stringify(tag),
			},
		});
		fireEvent(destination, dropEvent);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: actions.downloadedSearchForm.removeTag.type, payload: tag });
		expect(dispatchedActions).toContainMatchingAction({ type: actions.downloadedSearchForm.addExcludedTag.type, payload: tag });
	});
	it('Adds stringified tag to dataTransfer on drag start over tage', () => {
		// given
		const tag = mTag({ id: 1, tag: 'tag1' });
		const store = mockStore(
			mState({
				onlineSearchForm: {
					excludedTags: [tag],
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<ExcludedTags mode='online' />
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
		const tag = mTag({ id: 1, tag: 'tag1' });
		const store = mockStore(
			mState({
				onlineSearchForm: {
					excludedTags: [tag],
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<ExcludedTags mode='online' />
			</Provider>
		);
		const source = screen.getByTestId('excluded-tags-container');
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
