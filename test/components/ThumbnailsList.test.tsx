import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { actions } from '../../src/store';
import { RootState, AppDispatch } from '../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import userEvent from '@testing-library/user-event';
import { mState } from '../helpers/store.helper';

import ThumbnailsList from '../../src/components/thumbnails/ThumbnailsList';
import '@testing-library/jest-dom';
import { mPost } from '../helpers/test.helper';
import { thumbnailLoaderMock } from '../helpers/imageBus.mock';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('ThumbnailsList', () => {
	const context = 'ctx';
	const posts = [
		mPost({ id: 1, directory: 'dir1', hash: 'hash1' }),
		mPost({ id: 2, directory: 'dir2', hash: 'hash2' }),
		mPost({ id: 3, directory: 'dir3', hash: 'hash3', selected: true }),
		mPost({ id: 4, directory: 'dir4', hash: 'hash4', downloaded: 1 }),
		mPost({ id: 5, directory: 'dir5', hash: 'hash5', downloaded: 1 }),
	];
	const testUrl = '123testurl.jpg';
	beforeEach(() => {
		jest.clearAllMocks();
		thumbnailLoaderMock.mockResolvedValue(testUrl);
	});
	it('Renders correctly', async () => {
		//given
		const store = mockStore(
			mState({
				posts: {
					posts: { [context]: posts },
				},
				searchContexts: {
					[context]: {},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<ThumbnailsList shouldShowLoadMoreButton context={context} />
			</Provider>
		);

		// then
		expect(screen.getByRole('button', { name: 'Load More' }));
		await waitFor(() => expect(screen.getAllByTestId('thumbnail-image')[3]).toHaveAttribute('src', testUrl));
	});
	it('Adds correct event listener to window and unregisters it on unmount', () => {
		//given
		const arrowRightKeyCode = 39;
		const arrowLeftKeyCode = 37;
		const store = mockStore(
			mState({
				posts: {
					posts: { posts, favorites: [] },
				},
				searchContexts: {
					posts: {},
				},
			})
		);
		const addMap: { [key: string]: (event: Partial<KeyboardEvent>) => void } = {};
		const removeMap: { [key: string]: (event: Partial<KeyboardEvent>) => void } = {};
		const addEventListener = jest.fn((event: string, cb: any): void => {
			addMap[event] = cb;
		});
		const removeEventListener = jest.fn((event: string, cb: any): void => {
			removeMap[event] = cb;
		});
		(global as any).addEventListener = addEventListener;
		(global as any).removeEventListener = removeEventListener;

		// when
		const { unmount } = render(
			<Provider store={store}>
				<ThumbnailsList context='posts' />
			</Provider>
		);
		addMap.keydown({ keyCode: arrowRightKeyCode });
		addMap.keydown({ keyCode: arrowLeftKeyCode });

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: actions.posts.nextPost.type });
		expect(dispatchedActions).toContainMatchingAction({ type: actions.posts.previousPost.type });
		expect(removeEventListener).not.toHaveBeenCalledWith('keydown', removeMap['keydown'], true);
		unmount();
		expect(removeEventListener).toHaveBeenCalledWith('keydown', removeMap['keydown'], true);
	});
	it('Renders no data when there are no posts to show', () => {
		//given
		const store = mockStore(
			mState({
				posts: {
					posts: { posts: [], favorites: [] },
				},
				searchContexts: {
					posts: {},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<ThumbnailsList context='posts' />
			</Provider>
		);

		// then
		expect(screen.getByText('Open Search Form')).not.toBeNull();
		expect(screen.getByText('No Posts To Show')).not.toBeNull();
	});
	it('Does not render Load More button when there are no posts', () => {
		//given
		const store = mockStore(
			mState({
				posts: {
					posts: { posts: [], favorites: [] },
				},
				searchContexts: {
					posts: {},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<ThumbnailsList context='posts' />
			</Provider>
		);

		// then
		expect(screen.queryByText('Load More')).toBeNull();
	});
	it('Does not render Load More button when mode is other', () => {
		//given
		const store = mockStore(
			mState({
				posts: {
					posts: { posts },
				},
				searchContexts: {
					posts: {
						mode: 'other',
					},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<ThumbnailsList context='posts' />
			</Provider>
		);

		// then
		expect(screen.queryByText('Load More')).toBeNull();
	});
	it('Hovering and waiting over thumbnail and leaving hover dispatches setHoveredPost', async () => {
		//given
		const store = mockStore(
			mState({
				posts: {
					posts: { posts, favorites: [] },
				},
				searchContexts: {
					posts: {},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<ThumbnailsList context='posts' />
			</Provider>
		);
		userEvent.hover(screen.getAllByTestId('thumbnail-image')[0]);
		await waitFor(() =>
			expect(store.getActions()).toContainMatchingAction({
				type: actions.posts.setHoveredPost.type,
				payload: { post: posts[0], visible: true },
			})
		);
		userEvent.unhover(screen.getAllByTestId('thumbnail-image')[0]);

		// then
		const dispatchedActions = store.getActions();
		await waitFor(() =>
			expect(dispatchedActions).toContainMatchingAction({
				type: actions.posts.setHoveredPost.type,
				payload: { post: undefined, visible: false },
			})
		);
	});
});
