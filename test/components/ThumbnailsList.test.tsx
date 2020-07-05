import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { actions } from '../../src/store';
import { RootState, AppDispatch } from '../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../helpers/store.helper';

import ThumbnailsList from '../../src/components/ThumbnailsList';
import '@testing-library/jest-dom';
import { mPost } from '../helpers/test.helper';
import { getThumbnailUrl } from 'service/webService';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

const mockList = (list: {
	scrollTo: jest.Mock;
	scrollTop: number;
	clientHeight: number;
	scrollHeight: number;
	clientWidth?: number;
}): void => {
	(global as any).window.HTMLDivElement.prototype._jsdomMockScrollHeight = list.scrollHeight;
	(global as any).window.HTMLDivElement.prototype._jsdomMockClientHeight = list.clientHeight;
	(global as any).window.HTMLDivElement.prototype._jsdomMockScrollTop = list.scrollTop;
	(global as any).window.HTMLDivElement.prototype.scrollTo = list.scrollTo;
	(global as any).window.HTMLDivElement.prototype._jsdomMockClientWidth = list.clientWidth ?? 0;
};

describe('ThumbnailsList', () => {
	const posts = [
		mPost({ id: 1, directory: 'dir1', hash: 'hash1' }),
		mPost({ id: 2, directory: 'dir2', hash: 'hash2' }),
		mPost({ id: 3, directory: 'dir3', hash: 'hash3', selected: true }),
		mPost({ id: 4, directory: 'dir4', hash: 'hash4', downloaded: 1 }),
		mPost({ id: 5, directory: 'dir5', hash: 'hash5', downloaded: 1 }),
	];
	it('Renders correctly', () => {
		//given
		const store = mockStore(
			mState({
				posts: {
					posts,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<ThumbnailsList />
			</Provider>
		);

		// then
		expect(screen.getByRole('button', { name: 'Load More' }));
		expect(screen.getAllByTestId('thumbnail-image')[2]).toHaveAttribute('src', getThumbnailUrl(posts[2].directory, posts[2].hash));
	});
	it('Adds correct event listener to window and unregisters it on unmount', () => {
		//given
		const arrowRightKeyCode = 39;
		const arrowLeftKeyCode = 37;
		const store = mockStore(
			mState({
				posts: {
					posts,
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
				<ThumbnailsList />
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
					posts: [],
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<ThumbnailsList />
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
					posts: [],
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<ThumbnailsList />
			</Provider>
		);

		// then
		expect(screen.queryByText('Load More')).toBeNull();
	});
	it('Does not render Load More button when search mode is favorites', () => {
		//given
		const store = mockStore(
			mState({
				posts: {
					posts,
				},
				system: {
					searchMode: 'favorites',
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<ThumbnailsList />
			</Provider>
		);

		// then
		expect(screen.queryByText('Load More')).toBeNull();
	});
	it('Does not render Load More button when search mode is open-download', () => {
		//given
		const store = mockStore(
			mState({
				posts: {
					posts,
				},
				system: {
					searchMode: 'open-download',
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<ThumbnailsList />
			</Provider>
		);

		// then
		expect(screen.queryByText('Load More')).toBeNull();
	});
	describe('Prop sidebar = true', () => {
		it('Scrolls to active post when thumbnails have no actions', () => {
			//given
			const activePostIndex = 40;
			const store = mockStore(
				mState({
					posts: {
						posts: [...Array(100)].map((_, index) => mPost({ id: index })),
						activePostIndex,
					},
				})
			);
			const list = {
				scrollHeight: 8000,
				clientHeight: 930,
				scrollTop: 500,
				scrollTo: jest.fn(),
			};
			mockList(list);
			const thumbnailHeight = 190;
			const target = list.scrollHeight * (activePostIndex / 100) - (list.clientHeight / 2 - thumbnailHeight / 2);

			// when
			render(
				<Provider store={store}>
					<ThumbnailsList sidebar />
				</Provider>
			);

			// then
			expect(list.scrollTo).toHaveBeenCalledTimes(1);
			expect(list.scrollTo).toHaveBeenCalledWith({ top: target, behavior: 'auto' });
		});
		it('Scrolls to active post when thumbnails have actions', () => {
			//given
			const activePostIndex = 30;
			const store = mockStore(
				mState({
					posts: {
						posts: [...Array(100)].map((_, index) => mPost({ id: index })),
						activePostIndex,
					},
				})
			);
			const list = {
				scrollHeight: 8000,
				clientHeight: 930,
				scrollTop: 500,
				scrollTo: jest.fn(),
			};
			mockList(list);
			const thumbnailHeight = 230;
			const target = list.scrollHeight * (activePostIndex / 100) - (list.clientHeight / 2 - thumbnailHeight / 2);

			// when
			render(
				<Provider store={store}>
					<ThumbnailsList sidebar actions={[]} />
				</Provider>
			);

			// then
			expect(list.scrollTo).toHaveBeenCalledTimes(1);
			expect(list.scrollTo).toHaveBeenCalledWith({ top: target, behavior: 'auto' });
		});
		it('Uses smooth scroll when scroll distance is less than 300', () => {
			//given
			const activePostIndex = 60;
			const store = mockStore(
				mState({
					posts: {
						posts: [...Array(100)].map((_, index) => mPost({ id: index })),
						activePostIndex,
					},
				})
			);
			const list = {
				scrollHeight: 8000,
				clientHeight: 930,
				scrollTop: 4300,
				scrollTo: jest.fn(),
			};
			mockList(list);
			const thumbnailHeight = 230;
			const target = list.scrollHeight * (activePostIndex / 100) - (list.clientHeight / 2 - thumbnailHeight / 2);

			// when
			render(
				<Provider store={store}>
					<ThumbnailsList sidebar actions={[]} />
				</Provider>
			);

			// then
			expect(list.scrollTo).toHaveBeenCalledTimes(1);
			expect(list.scrollTo).toHaveBeenCalledWith({ top: target, behavior: 'smooth' });
		});
	});
	describe('Prop sidebar = false', () => {
		it('Scrolls to active post when thumbnails have no actions', () => {
			//given
			const activePostIndex = 40;
			const posts = [...Array(100)].map((_, index) => mPost({ id: index }));
			const store = mockStore(
				mState({
					posts: {
						posts,
						activePostIndex,
					},
				})
			);
			const list = {
				scrollHeight: 8000,
				clientHeight: 930,
				scrollTop: 500,
				clientWidth: 1900,
				scrollTo: jest.fn(),
			};
			mockList(list);
			const columns = Math.floor(list.clientWidth / 190);
			const target = list.scrollHeight * (Math.floor(activePostIndex / columns) / (posts.length / columns)) - list.clientHeight / 2;

			// when
			render(
				<Provider store={store}>
					<ThumbnailsList sidebar={false} />
				</Provider>
			);

			// then
			expect(list.scrollTo).toHaveBeenCalledTimes(1);
			expect(list.scrollTo).toHaveBeenCalledWith({ top: target, behavior: 'auto' });
		});
		it('Uses smooth scroll when scroll distance is less than 300', () => {
			//given
			const activePostIndex = 60;
			const posts = [...Array(100)].map((_, index) => mPost({ id: index }));
			const store = mockStore(
				mState({
					posts: {
						posts,
						activePostIndex,
					},
				})
			);
			const list = {
				scrollHeight: 3000,
				clientHeight: 1000,
				scrollTop: 1400,
				clientWidth: 1900,
				scrollTo: jest.fn(),
			};
			mockList(list);
			const columns = Math.floor(list.clientWidth / 190);
			const target = list.scrollHeight * (Math.floor(activePostIndex / columns) / (posts.length / columns)) - list.clientHeight / 2;

			// when
			render(
				<Provider store={store}>
					<ThumbnailsList sidebar={false} actions={[]} />
				</Provider>
			);

			// then
			expect(list.scrollTo).toHaveBeenCalledTimes(1);
			expect(list.scrollTo).toHaveBeenCalledWith({ top: target, behavior: 'smooth' });
		});
	});
});
