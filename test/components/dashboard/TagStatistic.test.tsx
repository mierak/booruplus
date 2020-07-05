import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { thunks, actions } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../helpers/store.helper';
import TagStatistic from '../../../src/components/dashboard/TagStatistic';
import { mTag } from '../../helpers/test.helper';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('TagStatistic', () => {
	it('Renders correctly for most-favorited', () => {
		// given
		const store = mockStore(
			mState({
				dashboard: {
					mostFavoritedTags: [
						{ tag: mTag({ tag: 'tag1' }), count: 1 },
						{ tag: mTag({ tag: 'tag2' }), count: 2 },
						{ tag: mTag({ tag: 'tag3' }), count: 3 },
						{ tag: mTag({ tag: 'tag4' }), count: 4 },
						{ tag: mTag({ tag: 'tag5' }), count: 5 },
					],
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<TagStatistic title="Most Favorited" type="most-favorited" />
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
						{ tag: mTag({ tag: 'tag1' }), count: 1, date: '' },
						{ tag: mTag({ tag: 'tag2' }), count: 2, date: '' },
						{ tag: mTag({ tag: 'tag3' }), count: 3, date: '' },
						{ tag: mTag({ tag: 'tag4' }), count: 4, date: '' },
						{ tag: mTag({ tag: 'tag5' }), count: 5, date: '' },
					],
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<TagStatistic title="Most Searched" type="most-searched" />
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
				<TagStatistic title="Most Searched" type="most-searched" />
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
				<TagStatistic title="Most Favorited" type="most-favorited" />
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
				<TagStatistic title="Most Favorited" type="most-favorited" />
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
				<TagStatistic title="Most Searched" type="most-searched" />
			</Provider>
		);

		// then
		const dispatchedActions = mStore.getActions();
		expect(dispatchedActions[0]).toMatchObject({ type: thunks.dashboard.fetchMostSearchedTags.pending.type });
	});
	it('Renders actions and calls correct functions when clicked', () => {
		// given
		const mStore = mockStore(
			mState({
				dashboard: {
					mostSearchedTags: [{ tag: mTag({ tag: 'tag1' }), count: 1, date: '' }],
				},
			})
		);

		// when
		render(
			<Provider store={mStore}>
				<TagStatistic title="Most Searched" type="most-searched" />
			</Provider>
		);
		fireEvent.click(screen.getByText('Online'));
		fireEvent.click(screen.getByText('Offline'));

		// then
		const dispatchedActions = mStore.getActions();
		expect(dispatchedActions[0]).toMatchObject({ type: actions.onlineSearchForm.setSelectedTags.type });
		expect(dispatchedActions[1]).toMatchObject({ type: thunks.onlineSearchForm.fetchPosts.pending.type });
		expect(dispatchedActions[2]).toMatchObject({ type: actions.system.setActiveView.type, payload: 'thumbnails' });
		expect(dispatchedActions[3]).toMatchObject({ type: actions.downloadedSearchForm.setSelectedTags.type });
		expect(dispatchedActions[4]).toMatchObject({ type: thunks.downloadedSearchForm.fetchPosts.pending.type });
		expect(dispatchedActions[5]).toMatchObject({ type: actions.system.setActiveView.type, payload: 'thumbnails' });
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
				<TagStatistic title="Most Searched" type="most-searched" />
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
				<TagStatistic title="Most Searched" type="most-searched" />
			</Provider>
		);

		// then
		expect(screen.getByText('No Data')).not.toBeNull();
	});
});