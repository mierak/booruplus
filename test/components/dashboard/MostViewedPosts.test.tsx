import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { actions, thunks } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import MostViewedPosts from '../../../src/components/dashboard/MostViewedPosts';
import { mPost } from '../../helpers/test.helper';
import { mState } from '../../helpers/store.helper';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('MostviewedPosts', () => {
	it('Renders correctly', () => {
		// given
		const posts = [
			mPost({ id: 0, viewCount: 0 }),
			mPost({ id: 1, viewCount: 1 }),
			mPost({ id: 2, viewCount: 2 }),
			mPost({ id: 3, viewCount: 3 }),
			mPost({ id: 4, viewCount: 4 }),
		];
		const store = mockStore(mState({ dashboard: { mostViewedPosts: posts } }));

		// when
		render(
			<Provider store={store}>
				<MostViewedPosts />
			</Provider>
		);

		// then
		expect(screen.queryByText('Most Viewed Posts')).not.toBeNull();
		expect(
			screen.getAllByRole('img', {
				name: 'most-viewed-thumbnail',
			})
		).toHaveLength(posts.length);
		expect(screen.getByText('Viewed 0 times')).not.toBeNull();
		expect(screen.getByText('Viewed 1 times')).not.toBeNull();
		expect(screen.getByText('Viewed 2 times')).not.toBeNull();
		expect(screen.getByText('Viewed 3 times')).not.toBeNull();
		expect(screen.getByText('Viewed 4 times')).not.toBeNull();
	});
	it('Opens full size image when clicked and updates store', () => {
		// given
		const posts = [mPost({ id: 0 }), mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 }), mPost({ id: 4 })];
		const store = mockStore(mState({ dashboard: { mostViewedPosts: posts } }));
		const postsIndexToClick = 2;

		// when
		render(
			<Provider store={store}>
				<MostViewedPosts />
			</Provider>
		);
		fireEvent.click(
			screen.getAllByRole('img', {
				name: 'most-viewed-thumbnail',
			})[postsIndexToClick]
		);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions[0]).toMatchObject({ type: actions.system.setSearchMode.type, payload: 'most-viewed' });
		expect(dispatchedActions[1]).toMatchObject({ type: actions.posts.setPosts.type, payload: posts });
		expect(dispatchedActions[2]).toMatchObject({ type: actions.posts.setActivePostIndex.type, payload: postsIndexToClick });
		expect(dispatchedActions[3]).toMatchObject({ type: actions.system.setActiveView.type, payload: 'image' });
	});
	it('Calls reload function when reload button is pressed', () => {
		// given
		const mStore = mockStore(mState());

		// when
		render(
			<Provider store={mStore}>
				<MostViewedPosts />
			</Provider>
		);
		fireEvent.click(
			screen.getByRole('img', {
				name: 'reload',
			})
		);

		// then
		const dispatchedActions = mStore.getActions();
		expect(dispatchedActions[0]).toMatchObject({
			type: thunks.dashboard.fetchMostViewedPosts.pending.type,
			meta: { arg: mStore.getState().settings.dashboard.mostViewedCount },
		});
	});
	it('Renders downloaded icon', () => {
		// given
		const posts = [mPost({ id: 0 }), mPost({ id: 1, downloaded: 1 }), mPost({ id: 2, downloaded: 1 }), mPost({ id: 3 }), mPost({ id: 4 })];
		const store = mockStore(mState({ dashboard: { mostViewedPosts: posts } }));

		// when
		render(
			<Provider store={store}>
				<MostViewedPosts />
			</Provider>
		);

		// then
		expect(
			screen.getAllByRole('img', {
				name: 'check-circle',
			})
		).toHaveLength(2);
	});
});