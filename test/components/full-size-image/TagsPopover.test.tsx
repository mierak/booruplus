import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { thunks, actions } from '../../../src/store';
import { RootState, AppDispatch, AppThunk } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../helpers/store.helper';

import TagsPopover from '../../../src/components/full-size-image/TagsPopover';
import '@testing-library/jest-dom';
import { mTag } from '../../helpers/test.helper';
import { Tag } from '../../../src/types/gelbooruTypes';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('TagsPopover', () => {
	let fetchTagsSpy: jest.SpyInstance;
	const context = 'ctx';
	const tags = [mTag({ id: 1, tag: 'tag1' }), mTag({ id: 2, tag: 'tag2' }), mTag({ id: 3, tag: 'tag3' })];
	beforeEach(() => {
		fetchTagsSpy = jest.spyOn(thunks.tags, 'fetchTags').mockImplementation(
			(_: string[]): AppThunk<Tag[]> => async (__, __notNeeded): Promise<Tag[]> => {
				return tags;
			}
		);
		(global as any).window.HTMLDivElement.prototype.scrollTo = jest.fn();
	});
	afterEach(() => {
		fetchTagsSpy.mockClear();
	});
	it('Renders correctly', async () => {
		// given
		const tagsString = ['tag1', 'tag2', 'tag3'];
		const store = mockStore(
			mState({
				system: {
					isTagsPopoverVisible: true,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<TagsPopover context={context} tags={tagsString} />
			</Provider>
		);

		// then
		expect(screen.getByText('Tag')).not.toBeNull();
		expect(screen.getByText('Search')).not.toBeNull();
		expect(await screen.findByText(tags[0].tag)).not.toBeNull();
		expect(await screen.findByText(tags[1].tag)).not.toBeNull();
		expect(await screen.findByText(tags[2].tag)).not.toBeNull();
	});
	it('Dispatches fetchTags on load', async () => {
		// given
		const tagsString = ['tag1', 'tag2', 'tag3'];
		const store = mockStore(
			mState({
				system: {
					isTagsPopoverVisible: true,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<TagsPopover context={context} tags={tagsString} />
			</Provider>
		);

		// then
		expect(fetchTagsSpy).toBeCalledWith(tagsString);
		expect(await screen.findByText(tags[0].tag)).not.toBeNull();
		expect(await screen.findByText(tags[1].tag)).not.toBeNull();
		expect(await screen.findByText(tags[2].tag)).not.toBeNull();
	});
	it('Dispatches searchTagOnline()', async () => {
		// given
		const tagsString = ['tag1', 'tag2', 'tag3'];
		const store = mockStore(
			mState({
				system: {
					isTagsPopoverVisible: true,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<TagsPopover context={context} tags={tagsString} />
			</Provider>
		);
		fireEvent.click((await screen.findAllByRole('button', { name: 'Online' }))[1]);

		// then
		expect(store.getActions()).toContainMatchingAction({
			type: thunks.tags.searchTagOnline.pending.type,
			meta: { arg: tags[1] },
		});
	});
	it('Dispatches searchTagOffline()', async () => {
		// given
		const tagsString = ['tag1', 'tag2', 'tag3'];
		const store = mockStore(
			mState({
				system: {
					isTagsPopoverVisible: true,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<TagsPopover context={context} tags={tagsString} />
			</Provider>
		);
		fireEvent.click((await screen.findAllByRole('button', { name: 'Offline' }))[1]);

		// then
		expect(store.getActions()).toContainMatchingAction({
			type: thunks.tags.searchTagOffline.pending.type,
			meta: { arg: tags[1] },
		});
	});
	it('Dispatches addTag() to onlineSearchForm', async () => {
		// given
		const tagsString = ['tag1', 'tag2', 'tag3'];
		const store = mockStore(
			mState({
				system: {
					isTagsPopoverVisible: true,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<TagsPopover context={context} tags={tagsString} />
			</Provider>
		);
		fireEvent.click((await screen.findAllByRole('button', { name: 'Add' }))[1]);

		// then
		expect(store.getActions()).toContainMatchingAction({
			type: actions.onlineSearchForm.addTag.type,
			payload: { context, data: tags[1] },
		});
	});
	it('Does not dispatch fetchTags() when isTagsPopoverVisible is false', () => {
		// given
		const tagsString = ['tag1', 'tag2', 'tag3'];
		const store = mockStore(
			mState({
				system: {
					isTagsPopoverVisible: false,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<TagsPopover context={context} tags={tagsString} />
			</Provider>
		);

		// then
		expect(fetchTagsSpy).toBeCalledTimes(0);
	});
});
