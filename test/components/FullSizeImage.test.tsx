import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { thunks } from '../../src/store';
import { RootState, AppDispatch } from '../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../helpers/store.helper';

import FullSizeImage from '../../src/components/FullSizeImage';
import '@testing-library/jest-dom';
import { mPost } from '../helpers/test.helper';
import { imageLoaderMock } from '../helpers/imageBus.mock';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('FullSizeImage', () => {
	const posts = [
		mPost({ id: 1, directory: 'dir1', hash: 'hash1', image: 'name.gif' }),
		mPost({ id: 2, directory: 'dir2', hash: 'hash2', image: 'name.webm' }),
		mPost({ id: 3, directory: 'dir3', hash: 'hash3', image: 'name.jpg', selected: true }),
		mPost({ id: 4, directory: 'dir4', hash: 'hash4', image: 'name.png', downloaded: 1 }),
		mPost({ id: 5, directory: 'dir5', hash: 'hash5', image: 'name.bmp', downloaded: 1 }),
	];
	const testUrl = '123testurl.jpg';
	beforeEach(() => {
		jest.clearAllMocks();
		imageLoaderMock.mockResolvedValueOnce(testUrl);
	});
	it('Renders image correctly', () => {
		// given
		const store = mockStore(
			mState({
				posts: {
					posts: { posts, favorites: [] },
					selectedIndices: {
						posts: 2,
					},
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<FullSizeImage context='posts' />
			</Provider>
		);

		// then
		expect(screen.getByLabelText('canvas')).not.toBeNull();
	});
	it('Renders gif correctly', () => {
		// given
		const store = mockStore(
			mState({
				posts: {
					posts: { posts, favorites: [] },
					selectedIndices: { posts: 0 },
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<FullSizeImage context='posts' />
			</Provider>
		);

		// then
		expect(screen.getByTestId('full-image-gif')).not.toBeNull();
	});
	it('Renders webm correctly', () => {
		// given
		const store = mockStore(
			mState({
				posts: {
					posts: { posts, favorites: [] },
					selectedIndices: { posts: 1 },
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<FullSizeImage context='posts' />
			</Provider>
		);

		// then
		expect(screen.getByLabelText('video')).not.toBeNull();
	});
	it('Increments view count on image load', () => {
		// given
		const activePostIndex = 1;
		const store = mockStore(
			mState({
				posts: {
					posts: { posts, favorites: [] },
					selectedIndices: { posts: activePostIndex },
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<FullSizeImage context='posts' />
			</Provider>
		);

		// then
		expect(store.getActions()).toContainMatchingAction({
			type: thunks.posts.incrementViewCount.pending.type,
			meta: { arg: posts[activePostIndex] },
		});
	});
});
