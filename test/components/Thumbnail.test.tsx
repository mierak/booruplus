import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { actions } from '../../src/store';
import { RootState, AppDispatch } from '../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../helpers/store.helper';
import userEvent from '@testing-library/user-event';

import Thumbnail from '../../src/components/Thumbnail';
import '@testing-library/jest-dom';
import { mPost } from '../helpers/test.helper';
import * as utils from '../../src/types/components';
import { getThumbnailUrl } from 'service/webService';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('Thumbnail', () => {
	const posts = [
		mPost({ id: 1, directory: 'dir1', hash: 'hash1' }),
		mPost({ id: 2, directory: 'dir2', hash: 'hash2' }),
		mPost({ id: 3, directory: 'dir3', hash: 'hash3', selected: true }),
		mPost({ id: 4, directory: 'dir4', hash: 'hash4', downloaded: 1 }),
		mPost({ id: 5, directory: 'dir5', hash: 'hash5', downloaded: 1 }),
	];
	it('Renders correctly', () => {
		// given
		const index = 2;
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
				<Thumbnail index={index} />
			</Provider>
		);

		// then
		expect(screen.getByTestId('thumbnail-image')).toHaveAttribute('src', getThumbnailUrl(posts[index].directory, posts[index].hash));
	});
	it('Dispatches setActivePostIndex() and setActiveView() when thumbnail is clicked', () => {
		// given
		const index = 2;
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
				<Thumbnail index={index} />
			</Provider>
		);
		fireEvent.click(screen.getByTestId('thumbnail-image'));

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({ type: actions.posts.setActivePostIndex.type, payload: index });
		expect(dispatchedActions).toContainMatchingAction({ type: actions.system.setActiveView.type, payload: 'image' });
	});
	it('Dispatches setPostSelected() when thumbnail is ctrl clicked', () => {
		// given
		const index = 2;
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
				<Thumbnail index={index} />
			</Provider>
		);
		userEvent.click(screen.getByTestId('thumbnail-image'), { ctrlKey: true });

		// then
		const dispatchedActions = store.getActions();
		expect(dispatchedActions).toContainMatchingAction({
			type: actions.posts.setPostSelected.type,
			payload: { post: posts[index], selected: !posts[index].selected },
		});
	});
	it('Renders action without popconfirm', () => {
		// given
		const index = 2;
		const store = mockStore(
			mState({
				posts: {
					posts,
				},
			})
		);
		const onClick = jest.fn();
		const actions: utils.CardAction[] = [
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
				<Thumbnail index={index} actions={actions} />
			</Provider>
		);
		fireEvent.click(screen.getByRole('img', { name: 'plus' }));

		// then
		expect(onClick).toHaveBeenCalledTimes(1);
	});
	it('Renders action with popconfirm', async () => {
		// given
		const index = 2;
		const store = mockStore(
			mState({
				posts: {
					posts,
				},
			})
		);
		const onClick = jest.fn();
		const title = 'popconfirm title';
		const actions: utils.CardAction[] = [
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
				<Thumbnail index={index} actions={actions} />
			</Provider>
		);
		fireEvent.click(screen.getByRole('img', { name: 'plus' }));
		await waitFor(() => screen.getByText(title));
		fireEvent.click(screen.getByRole('button', { name: actions[0].popConfirm?.okText }));

		// then
		expect(onClick).toHaveBeenCalledTimes(1);
	});
	it('Does not render action when condition is not met', async () => {
		// given
		const index = 3;
		const store = mockStore(
			mState({
				posts: {
					posts,
				},
			})
		);
		const onClick = jest.fn();
		const title = 'popconfirm title';
		const actions: utils.CardAction[] = [
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
				<Thumbnail index={index} actions={actions} />
			</Provider>
		);

		// then
		expect(screen.queryByRole('img', { name: 'plus' })).toBeNull();
	});
	it('Does not render action and shows error notification when post is null', () => {
		// given
		const index = 123;
		const store = mockStore(
			mState({
				posts: {
					posts,
				},
			})
		);
		const onClick = jest.fn();
		const actions: utils.CardAction[] = [
			{
				onClick,
				icon: 'plus-outlined',
				key: 'plus-action',
				tooltip: 'tooltip',
			},
		];
		const notificationSpy = jest.spyOn(utils, 'openNotificationWithIcon').mockImplementation();

		// when
		render(
			<Provider store={store}>
				<Thumbnail index={index} actions={actions} />
			</Provider>
		);

		// then
		expect(screen.queryByRole('img', { name: 'plus' })).toBeNull();
		expect(notificationSpy).toBeCalledWith('error', 'Cannot find post', 'Cannot render post actions because post is undefined', 5);
	});
});
