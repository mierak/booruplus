import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { thunks } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../helpers/store.helper';

import Tags from '../../../src/pages/Tags';
import '@testing-library/jest-dom';
import { mTag } from '../../helpers/test.helper';
import { mockedDb } from '../../helpers/database.mock';
import { TagType } from '../../../src/types/gelbooruTypes';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('pages/Tags', () => {
	beforeEach(() => {
		mockedDb.tags.getAllWithLimitAndOffset.mockResolvedValue([]);
	});
	it('Renders correctly', async () => {
		// given
		const tags = [
			mTag({ id: 1, tag: 'tag1', type: 'artist', count: 1, blacklistedCount: 1, favoriteCount: 1, downloadedCount: 1 }),
			mTag({ id: 2, tag: 'tag2', type: 'character', count: 2, blacklistedCount: 2, favoriteCount: 2, downloadedCount: 2 }),
			mTag({ id: 3, tag: 'tag3', type: 'copyright', count: 3, blacklistedCount: 3, favoriteCount: 3, downloadedCount: 3 }),
			mTag({ id: 4, tag: 'tag4', type: 'metadata', count: 4, blacklistedCount: 4, favoriteCount: 4, downloadedCount: 4 }),
		];
		const store = mockStore(
			mState({
				tags: {
					tags,
				},
			})
		);
		mockedDb.tags.getCount.mockResolvedValue(160);

		// when
		render(
			<Provider store={store}>
				<Tags />
			</Provider>
		);

		// then
		expect(screen.getByRole('columnheader', { name: 'Id' })).not.toBeNull();
		expect(screen.getByRole('columnheader', { name: 'Tag' })).not.toBeNull();
		expect(screen.getByRole('columnheader', { name: 'Type filter' })).not.toBeNull();
		expect(screen.getByRole('columnheader', { name: 'Count' })).not.toBeNull();
		expect(screen.getByRole('columnheader', { name: 'Favorites Count' })).not.toBeNull();
		expect(screen.getByRole('columnheader', { name: 'Blacklisted Count' })).not.toBeNull();
		expect(screen.getByRole('columnheader', { name: 'Downloaded Count' })).not.toBeNull();
		expect(screen.getByRole('columnheader', { name: 'Actions' })).not.toBeNull();
		expect(screen.getByRole('row', { name: '1 tag1 Artist 1 1 1 1 Online Search Offline Search' }));
		expect(screen.getByRole('row', { name: '2 tag2 Character 2 2 2 2 Online Search Offline Search' }));
		expect(screen.getByRole('row', { name: '3 tag3 Copyright 3 3 3 3 Online Search Offline Search' }));
		expect(screen.getByRole('row', { name: '4 tag4 Metadata 4 4 4 4 Online Search Offline Search' }));
		await waitFor(() => expect(screen.getByRole('listitem', { name: '1' })));
		await waitFor(() => expect(screen.getByRole('listitem', { name: '2' })));
		await waitFor(() => expect(screen.getByRole('listitem', { name: '11' })));
		await waitFor(() => expect(screen.getByText('tag3')).not.toBeNull());
	});
	it('Dispatches Online and Offline Search correctly', async () => {
		// given
		const tags = [
			mTag({ id: 1, tag: 'tag1', type: 'artist', count: 1, blacklistedCount: 1, favoriteCount: 1, downloadedCount: 1 }),
			mTag({ id: 2, tag: 'tag2', type: 'character', count: 2, blacklistedCount: 2, favoriteCount: 2, downloadedCount: 2 }),
			mTag({ id: 3, tag: 'tag3', type: 'copyright', count: 3, blacklistedCount: 3, favoriteCount: 3, downloadedCount: 3 }),
			mTag({ id: 4, tag: 'tag4', type: 'metadata', count: 4, blacklistedCount: 4, favoriteCount: 4, downloadedCount: 4 }),
		];
		const store = mockStore(
			mState({
				tags: {
					tags,
				},
			})
		);
		mockedDb.tags.getCount.mockResolvedValue(160);

		// when
		render(
			<Provider store={store}>
				<Tags />
			</Provider>
		);
		fireEvent.click(screen.getAllByRole('button', { name: 'Online Search' })[1]);
		fireEvent.click(screen.getAllByRole('button', { name: 'Offline Search' })[1]);

		// then
		const dispatchedActions = store.getActions();
		await waitFor(() => expect(screen.getByText('tag3')).not.toBeNull());
		expect(dispatchedActions).toContainMatchingAction({ type: thunks.tags.searchTagOnline.pending.type, meta: { arg: tags[1] } });
		expect(dispatchedActions).toContainMatchingAction({ type: thunks.tags.searchTagOffline.pending.type, meta: { arg: tags[1] } });
	});
	it('Inputs text into filter, unselects tag types and calls loadAllWithLimitAndOffset() with correct values', async () => {
		// given
		jest.setTimeout(10000);
		const types: TagType[] = ['copyright', 'metadata', 'tag'];
		const tags = [
			mTag({ id: 1, tag: 'tag1', type: 'artist', count: 1, blacklistedCount: 1, favoriteCount: 1, downloadedCount: 1 }),
			mTag({ id: 2, tag: 'tag2', type: 'character', count: 2, blacklistedCount: 2, favoriteCount: 2, downloadedCount: 2 }),
			mTag({ id: 3, tag: 'tag3', type: 'copyright', count: 3, blacklistedCount: 3, favoriteCount: 3, downloadedCount: 3 }),
			mTag({ id: 4, tag: 'tag4', type: 'metadata', count: 4, blacklistedCount: 4, favoriteCount: 4, downloadedCount: 4 }),
		];
		const store = mockStore(
			mState({
				tags: {
					tags,
				},
			})
		);
		mockedDb.tags.getCount.mockResolvedValue(160);
		const tagsPerPage = 20;
		const pattern = 'asdftestasdf';

		// when
		render(
			<Provider store={store}>
				<Tags tagsPerPage={tagsPerPage} />
			</Provider>
		);
		await waitFor(() => screen.getByRole('listitem', { name: '2' }));
		fireEvent.click(screen.getByRole('img', { name: 'search' }));
		await waitFor(() => screen.getByRole('textbox'));
		fireEvent.change(screen.getByRole('textbox'), { target: { value: pattern } });
		fireEvent.click(screen.getByRole('button', { name: 'search Search' }));

		fireEvent.click(screen.getByRole('img', { name: 'filter' }));
		await waitFor(() => screen.getByRole('checkbox', { name: 'Artist' }));
		fireEvent.click(screen.getByRole('checkbox', { name: 'Artist' }));
		fireEvent.click(screen.getByRole('checkbox', { name: 'Character' }));
		fireEvent.click(screen.getByRole('button', { name: 'search OK' }));

		fireEvent.click(screen.getByRole('listitem', { name: '3' }));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: thunks.tags.loadAllWithLimitAndOffset.pending.type,
			meta: { arg: { limit: tagsPerPage, offset: 2 * tagsPerPage, pattern, types } },
		});
		await waitFor(() => expect(screen.getByText('tag3')).not.toBeNull());
	});
});
