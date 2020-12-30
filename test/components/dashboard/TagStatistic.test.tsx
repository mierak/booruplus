import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { thunks } from '../../../src/store';
import { RootState, AppDispatch, DownloadedSearchFormState } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../helpers/store.helper';
import { mTag } from '../../helpers/test.helper';
import { initPostsContext } from '../../../src/store/commonActions';
import TagStatistic from '../../../src/components/dashboard/TagStatistic';
import { generateTabContext } from '@util/utils';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('TagStatistic', () => {
	it('Renders correctly for most-favorited', () => {
		// given
		const store = mockStore(
			mState({
				dashboard: {
					mostFavoritedTags: [
						{ tag: mTag({ id: 1, tag: 'tag1' }), count: 1 },
						{ tag: mTag({ id: 2, tag: 'tag2' }), count: 2 },
						{ tag: mTag({ id: 3, tag: 'tag3' }), count: 3 },
						{ tag: mTag({ id: 4, tag: 'tag4' }), count: 4 },
						{ tag: mTag({ id: 5, tag: 'tag5' }), count: 5 },
					],
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<TagStatistic title='Most Favorited' type='most-favorited' />
			</Provider>
		);

		// then
		expect(screen.getByText('Most Favorited')).not.toBeNull();
		expect(screen.getByText('tag1')).not.toBeNull();
		expect(screen.getByText('tag2')).not.toBeNull();
		expect(screen.getByText('tag3')).not.toBeNull();
		expect(screen.getByText('tag4')).not.toBeNull();
		expect(screen.getByText('tag5')).not.toBeNull();
	});
	it('Renders correctly for most-searched', () => {
		// given
		const store = mockStore(
			mState({
				dashboard: {
					mostSearchedTags: [
						{ tag: mTag({ id: 1, tag: 'tag1' }), count: 1, date: '' },
						{ tag: mTag({ id: 2, tag: 'tag2' }), count: 2, date: '' },
						{ tag: mTag({ id: 3, tag: 'tag3' }), count: 3, date: '' },
						{ tag: mTag({ id: 4, tag: 'tag4' }), count: 4, date: '' },
						{ tag: mTag({ id: 5, tag: 'tag5' }), count: 5, date: '' },
					],
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<TagStatistic title='Most Searched' type='most-searched' />
			</Provider>
		);

		// then
		expect(screen.getByText('Most Searched')).not.toBeNull();
		expect(screen.getByText('tag1')).not.toBeNull();
		expect(screen.getByText('tag2')).not.toBeNull();
		expect(screen.getByText('tag3')).not.toBeNull();
		expect(screen.getByText('tag4')).not.toBeNull();
		expect(screen.getByText('tag5')).not.toBeNull();
	});
	it('Calls reload most searched tags function when reload button is pressed', () => {
		// given
		const mStore = mockStore(mState());

		// when
		render(
			<Provider store={mStore}>
				<TagStatistic title='Most Searched' type='most-searched' />
			</Provider>
		);
		fireEvent.click(
			screen.getByRole('img', {
				name: 'reload',
			})
		);

		// then
		const dispatchedActions = mStore.getActions();
		expect(dispatchedActions[0]).toMatchObject({ type: thunks.dashboard.fetchMostSearchedTags.pending.type });
	});
	it('Calls reload most favorited tags function when reload button is pressed', () => {
		// given
		const mStore = mockStore(mState());

		// when
		render(
			<Provider store={mStore}>
				<TagStatistic title='Most Favorited' type='most-favorited' />
			</Provider>
		);
		fireEvent.click(
			screen.getByRole('img', {
				name: 'reload',
			})
		);

		// then
		const dispatchedActions = mStore.getActions();
		expect(dispatchedActions[0]).toMatchObject({ type: thunks.dashboard.fetchMostFavoritedTags.pending.type });
	});
	it('Loads most favorited on mount when should load is true', () => {
		// given
		const mStore = mockStore(
			mState({
				settings: {
					dashboard: {
						loadMostFavoritedTags: true,
					},
				},
			})
		);

		// when
		render(
			<Provider store={mStore}>
				<TagStatistic title='Most Favorited' type='most-favorited' />
			</Provider>
		);

		// then
		const dispatchedActions = mStore.getActions();
		expect(dispatchedActions[0]).toMatchObject({ type: thunks.dashboard.fetchMostFavoritedTags.pending.type });
	});
	it('Loads most searched on mount when should load is true', () => {
		// given
		const mStore = mockStore(
			mState({
				settings: {
					dashboard: {
						loadMostSearchedTags: true,
					},
				},
			})
		);

		// when
		render(
			<Provider store={mStore}>
				<TagStatistic title='Most Searched' type='most-searched' />
			</Provider>
		);

		// then
		const dispatchedActions = mStore.getActions();
		expect(dispatchedActions[0]).toMatchObject({ type: thunks.dashboard.fetchMostSearchedTags.pending.type });
	});
	it('Renders actions and calls correct functions when clicked', () => {
		// given
		const tag = { tag: mTag({ tag: 'tag1' }), count: 1, date: '' };
		const mStore = mockStore(
			mState({
				dashboard: {
					mostSearchedTags: [tag],
				},
			})
		);

		// when
		render(
			<Provider store={mStore}>
				<TagStatistic title='Most Searched' type='most-searched' />
			</Provider>
		);
		fireEvent.click(screen.getByText('Online'));
		fireEvent.click(screen.getByText('Offline'));
		const context = generateTabContext(Object.keys(mStore.getState().onlineSearchForm));
		const dataOnline: Partial<DownloadedSearchFormState> = {
			mode: 'online',
			selectedTags: [tag.tag],
		};
		const dataOffline: Partial<DownloadedSearchFormState> = {
			mode: 'offline',
			selectedTags: [tag.tag],
		};

		// then
		const dispatchedActions = mStore.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: initPostsContext.type,
			payload: { context, data: dataOnline },
		});
		expect(dispatchedActions).toContainMatchingAction({
			type: initPostsContext.type,
			payload: { context, data: dataOffline },
		});
		expect(dispatchedActions).toContainMatchingAction({
			type: thunks.onlineSearchForm.fetchPosts.pending.type,
			meta: { arg: { context } },
		});
		expect(dispatchedActions).toContainMatchingAction({
			type: thunks.downloadedSearchForm.fetchPosts.pending.type,
			meta: { arg: { context } },
		});
	});
	it('Puts ellipsis at the end of tags longer than 25 characters', () => {
		// given
		const tag = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
		const mStore = mockStore(
			mState({
				dashboard: {
					mostSearchedTags: [{ tag: mTag({ tag }), count: 1, date: '' }],
				},
			})
		);

		// when
		render(
			<Provider store={mStore}>
				<TagStatistic title='Most Searched' type='most-searched' />
			</Provider>
		);

		// then
		expect(screen.getByText(tag.substr(0, 25) + '...')).not.toBeNull();
	});
	it('Renders loading state correctly', () => {
		// given
		const mStore = mockStore(
			mState({
				loadingStates: {
					isMostSearchedTagsLoading: true,
				},
			})
		);

		// when
		render(
			<Provider store={mStore}>
				<TagStatistic title='Most Searched' type='most-searched' />
			</Provider>
		);

		// then
		expect(screen.getByText('No Data')).not.toBeNull();
	});
});
