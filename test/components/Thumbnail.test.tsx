import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { actions } from '../../src/store';
import { RootState, AppDispatch } from '../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../helpers/store.helper';
import userEvent from '@testing-library/user-event';

import Thumbnail from '../../src/components/thumbnails/thumbnail/Thumbnail';
import '@testing-library/jest-dom';
import { mPost } from '../helpers/test.helper';
import * as utils from '../../src/types/components';
import { thumbnailLoaderMock } from '../helpers/imageBus.mock';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('Thumbnail', () => {
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
		// given
		const index = 2;
		const store = mockStore(
			mState({
				posts: {
					posts: { posts, favorites: [] },
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<Thumbnail context='posts' index={index} />
			</Provider>
		);

		// then
		await waitFor(() => expect(screen.getByTestId('thumbnail-image')).toHaveAttribute('src', testUrl));
	});
	it('Dispatches setActivePostIndex() and setActiveView() when thumbnail is clicked', () => {
		// given
		const index = 2;
		const store = mockStore(
			mState({
				posts: {
					posts: { posts, favorites: [] },
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<Thumbnail context='posts' index={index} />
			</Provider>
		);
		fireEvent.click(screen.getByTestId('thumbnail-image'));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.posts.setActivePostIndex.type,
			payload: { data: index, context: 'posts' },
		});
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.system.setActiveView.type,
			payload: { view: 'image', context: 'posts' },
		});
	});
	it('Dispatches setPostSelected() when thumbnail is ctrl clicked', () => {
		// given
		const index = 2;
		const store = mockStore(
			mState({
				posts: {
					posts: { posts, favorites: [] },
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<Thumbnail context='posts' index={index} />
			</Provider>
		);
		userEvent.click(screen.getByTestId('thumbnail-image'), { ctrlKey: true });

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.posts.setPostSelected.type,
			payload: { data: { post: posts[index], selected: !posts[index].selected }, context: 'posts' },
		});
	});
	it('Dispatches selectMultiplePosts() when thumbnail is shift clicked', () => {
		// given
		const index = 2;
		const store = mockStore(
			mState({
				posts: {
					posts: { posts, favorites: [] },
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<Thumbnail context='posts' index={index} />
			</Provider>
		);
		userEvent.click(screen.getByTestId('thumbnail-image'), { shiftKey: true });

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.posts.selectMultiplePosts.type,
			payload: { data: index, context: 'posts' },
		});
	});
	it('Renders action without popconfirm', async () => {
		// given
		const index = 2;
		const store = mockStore(
			mState({
				posts: {
					posts: { posts, favorites: [] },
				},
			})
		);
		const onClick = jest.fn();
		const cardActions: utils.CardAction[] = [
			{
				onClick,
				icon: 'plus-outlined',
				key: 'plus-action',
				tooltip: 'tooltip',
			},
		];

		// when
		render(
			<Provider store={store}>
				<Thumbnail context='posts' index={index} actions={cardActions} />
			</Provider>
		);
		fireEvent.click(screen.getByRole('img', { name: 'plus' }));

		// then
		expect(onClick).toHaveBeenCalledTimes(1);
		await screen.findByRole('img', { name: 'plus' });
	});
	it('Show spinner when async action is processing', async () => {
		// given
		const index = 2;
		const store = mockStore(
			mState({
				posts: {
					posts: { posts, favorites: [] },
				},
			})
		);
		const onClick = jest.fn().mockResolvedValue(new Promise(resolve => {
			setTimeout(resolve(null), 500);
		}));
		const cardActions: utils.CardAction[] = [
			{
				onClick,
				icon: 'plus-outlined',
				key: 'plus-action',
				tooltip: 'tooltip',
			},
		];

		// when
		render(
			<Provider store={store}>
				<Thumbnail context='posts' index={index} actions={cardActions} />
			</Provider>
		);
		fireEvent.click(screen.getByRole('img', { name: 'plus' }));

		// then
		expect(screen.getByRole('img', { name: 'loading' })).not.toBeNull();
		expect(onClick).toHaveBeenCalledTimes(1);
		await screen.findByRole('img', { name: 'plus' });
	});
	it('Renders action with popconfirm', async () => {
		// given
		const index = 2;
		const store = mockStore(
			mState({
				posts: {
					posts: { posts, favorites: [] },
				},
			})
		);
		const onClick = jest.fn();
		const title = 'popconfirm title';
		const cardActions: utils.CardAction[] = [
			{
				onClick,
				icon: 'plus-outlined',
				key: 'plus-action',
				tooltip: 'tooltip',
				popConfirm: {
					okText: 'OK',
					cancelText: 'CANCEL',
					title,
				},
				condition: (post): boolean => post.downloaded === 0,
			},
		];

		// when
		render(
			<Provider store={store}>
				<Thumbnail context='posts' index={index} actions={cardActions} />
			</Provider>
		);
		fireEvent.click(screen.getByRole('img', { name: 'plus' }));
		await waitFor(() => screen.getByText(title));
		fireEvent.click(screen.getByRole('button', { name: cardActions[0].popConfirm?.okText }));

		// then
		expect(onClick).toHaveBeenCalledTimes(1);
	});
	it('Does not render action when condition is not met', async () => {
		// given
		const index = 3;
		const store = mockStore(
			mState({
				posts: {
					posts: { posts, favorites: [] },
				},
			})
		);
		const onClick = jest.fn();
		const title = 'popconfirm title';
		const cardActions: utils.CardAction[] = [
			{
				onClick,
				icon: 'plus-outlined',
				key: 'plus-action',
				tooltip: 'tooltip',
				popConfirm: {
					okText: 'OK',
					cancelText: 'CANCEL',
					title,
				},
				condition: (post): boolean => post.downloaded === 0,
			},
		];

		// when
		render(
			<Provider store={store}>
				<Thumbnail context='posts' index={index} actions={cardActions} />
			</Provider>
		);

		// then
		expect(screen.queryByRole('img', { name: 'plus' })).toBeNull();
	});
	it('Renders No Data when post is undefined', async () => {
		// given
		const index = 123;
		const store = mockStore(
			mState({
				posts: {
					posts: { posts, favorites: [] },
				},
			})
		);
		const onClick = jest.fn();
		const cardActions: utils.CardAction[] = [
			{
				onClick,
				icon: 'plus-outlined',
				key: 'plus-action',
				tooltip: 'tooltip',
			},
		];
		// const notificationSpy = jest.spyOn(utils, 'openNotificationWithIcon').mockImplementation();

		// when
		render(
			<Provider store={store}>
				<Thumbnail context='posts' index={index} actions={cardActions} />
			</Provider>
		);

		// then
		expect(screen.queryByRole('img', { name: 'plus' })).toBeNull();
		expect(await screen.findByText('No Data')).not.toBeNull();
	});
	describe('calls mouse listeners', () => {
		it('onMouseEnter()', () => {
			//given
			const onMouseEnter = jest.fn();
			const store = mockStore(
				mState({
					posts: {
						posts: { posts, favorites: [] },
					},
				})
			);

			// when
			render(
				<Provider store={store}>
					<Thumbnail context='posts' index={0} onMouseEnter={onMouseEnter} />
				</Provider>
			);
			userEvent.hover(screen.getAllByTestId('thumbnail-image')[0]);

			// then
			expect(onMouseEnter).toHaveBeenCalledWith(expect.anything(), posts[0]);
		});
		it('onMouseLeave()', () => {
			//given
			const onMouseLeave = jest.fn();
			const store = mockStore(
				mState({
					posts: {
						posts: { posts, favorites: [] },
					},
				})
			);

			// when
			render(
				<Provider store={store}>
					<Thumbnail context='posts' index={0} onMouseLeave={onMouseLeave} />
				</Provider>
			);
			userEvent.hover(screen.getAllByTestId('thumbnail-image')[0]);
			userEvent.unhover(screen.getAllByTestId('thumbnail-image')[0]);

			// then
			expect(onMouseLeave).toHaveBeenCalledWith(expect.anything(), posts[0]);
		});
		it('onMouseMove()', () => {
			//given
			const onMouseMove = jest.fn();
			const store = mockStore(
				mState({
					posts: {
						posts: { posts, favorites: [] },
					},
				})
			);

			// when
			render(
				<Provider store={store}>
					<Thumbnail context='posts' index={0} onMouseMove={onMouseMove} />
				</Provider>
			);
			userEvent.hover(screen.getAllByTestId('thumbnail-image')[0]);

			// then
			expect(onMouseMove).toHaveBeenCalledWith(expect.anything(), posts[0]);
		});
	});
});
