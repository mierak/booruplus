import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { actions, thunks } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import MostViewedPosts from '../../../src/components/dashboard/MostViewedPosts';
import { mPost } from '../../helpers/test.helper';
import { mState } from '../../helpers/store.helper';
import { thumbnailLoaderMock } from '../../helpers/imageBus.mock';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('MostviewedPosts', () => {
	const testUrl = '123testurl.jpg';
	const context = 'mostViewed';
	beforeEach(() => {
		thumbnailLoaderMock.mockResolvedValue(testUrl);
	});
	it('Renders correctly', async () => {
		// given
		const posts = [
			mPost({ id: 0, viewCount: 0 }),
			mPost({ id: 1, viewCount: 1 }),
			mPost({ id: 2, viewCount: 2 }),
			mPost({ id: 3, viewCount: 3 }),
			mPost({ id: 4, viewCount: 4 }),
		];
		const store = mockStore(mState({ searchContexts: { mostViewed: { posts } } }));

		// when
		render(
			<Provider store={store}>
				<MostViewedPosts />
			</Provider>
		);

		// then
		expect(screen.queryByText('Most Viewed Posts')).not.toBeNull();
		await waitFor(() =>
			expect(
				screen.getAllByRole('img', {
					name: 'most-viewed-thumbnail',
				})
			).toHaveLength(posts.length)
		);
		expect(screen.getByText('Viewed 0 times')).not.toBeNull();
		expect(screen.getByText('Viewed 1 times')).not.toBeNull();
		expect(screen.getByText('Viewed 2 times')).not.toBeNull();
		expect(screen.getByText('Viewed 3 times')).not.toBeNull();
		expect(screen.getByText('Viewed 4 times')).not.toBeNull();
	});
	it('Opens full size image when clicked and updates store', async () => {
		// given
		const posts = [mPost({ id: 0 }), mPost({ id: 1 }), mPost({ id: 2 }), mPost({ id: 3 }), mPost({ id: 4 })];
		const store = mockStore(mState({ searchContexts: { mostViewed: { posts } } }));
		const postsIndexToClick = 2;

		// when
		render(
			<Provider store={store}>
				<MostViewedPosts />
			</Provider>
		);
		fireEvent.click(
			(
				await screen.findAllByRole('img', {
					name: 'most-viewed-thumbnail',
				})
			)[postsIndexToClick]
		);

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.system.setActiveView.type,
			payload: { view: 'image', context },
		});
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.searchContexts.updateContext.type,
			payload: { data: { selectedIndex: postsIndexToClick }, context },
		});
		await waitFor(() =>
			expect(
				screen.getAllByRole('img', {
					name: 'most-viewed-thumbnail',
				})
			).toHaveLength(posts.length)
		);
	});
	it('Calls reload function when reload button is pressed', async () => {
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
		await waitFor(() =>
			expect(
				screen.queryAllByRole('img', {
					name: 'most-viewed-thumbnail',
				})
			).toHaveLength(0)
		);
	});
	it('Renders downloaded icon', async () => {
		// given
		const posts = [
			mPost({ id: 0 }),
			mPost({ id: 1, downloaded: 1 }),
			mPost({ id: 2, downloaded: 1 }),
			mPost({ id: 3 }),
			mPost({ id: 4 }),
		];
		const store = mockStore(mState({ searchContexts: { mostViewed: { posts } } }));

		// when
		render(
			<Provider store={store}>
				<MostViewedPosts />
			</Provider>
		);

		// then
		await waitFor(() =>
			expect(
				screen.getAllByRole('img', {
					name: 'check-circle',
				})
			).toHaveLength(2)
		);
	});
});
