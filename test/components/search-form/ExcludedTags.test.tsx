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
	it('Renders correctly', () => {
		// given
		const context = 'ctx';
		const excludedTags = [mTag({ tag: 'excluded1', id: 1 }), mTag({ tag: 'excluded2', id: 2 })];
		const store = mockStore(
			mState({
				onlineSearchForm: {
					[context]: {
						excludedTags,
					},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<ExcludedTags context={context} />
			</Provider>
		);

		// then
		expect(screen.getByText(excludedTags[0].tag)).not.toBeNull();
		expect(screen.getByText(excludedTags[1].tag)).not.toBeNull();
	});
	it('Removes tag correctly', () => {
		// given
		const context = 'ctx';
		const excludedTags = [mTag({ tag: 'excluded1', id: 1 }), mTag({ tag: 'excluded2', id: 2 })];
		const store = mockStore(
			mState({
				onlineSearchForm: {
					[context]: {
						excludedTags,
					},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<ExcludedTags context={context} />
			</Provider>
		);
		fireEvent.click(screen.getAllByRole('img', { name: 'close' })[0]);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.onlineSearchForm.removeExcludedTag.type,
			payload: { context, data: excludedTags[0] },
		});
	});
	it('Removes selected tag and adds it to excluded tags', () => {
		// given
		const context = 'ctx';
		const tag = mTag({ id: 1, tag: 'tag1' });
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
				<ExcludedTags context={context} />
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
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.onlineSearchForm.removeTag.type,
			payload: { context, data: tag },
		});
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.onlineSearchForm.addExcludedTag.type,
			payload: { context, data: tag },
		});
	});
	it('Adds stringified tag to dataTransfer on drag start over tag', () => {
		// given
		const context = 'ctx';
		const tag = mTag({ id: 1, tag: 'tag1' });
		const store = mockStore(
			mState({
				onlineSearchForm: {
					[context]: {
						excludedTags: [tag],
					},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<ExcludedTags context={context} />
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
		const context = 'ctx';
		const tag = mTag({ id: 1, tag: 'tag1' });
		const store = mockStore(
			mState({
				onlineSearchForm: {
					[context]: {
						excludedTags: [tag],
					},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<ExcludedTags context={context} />
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
	it('Does not duplicate excluded tag on drag', () => {
		// given
		const context = 'ctx';
		const tag = mTag({ id: 1, tag: 'excludedTag' });
		const store = mockStore(
			mState({
				onlineSearchForm: {
					[context]: {
						excludedTags: [tag],
					},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<ExcludedTags context={context} />
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
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.onlineSearchForm.removeTag.type,
			payload: { context, data: tag },
		});
		expect(dispatchedActions).not.toContainMatchingAction({
			type: actions.onlineSearchForm.addExcludedTag.type,
			payload: { context, data: tag },
		});
	});
});
