import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { actions } from '../../../src/store';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../helpers/store.helper';

jest.mock('../../../src/components/FullSizeImage', () => (): JSX.Element => <div>mocked image</div>);
import ImageView from '../../../src/pages/ImageView';
import '@testing-library/jest-dom';
import { mPost } from '../../helpers/test.helper';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('pages/ImageView', () => {
	beforeEach(() => {
		(global as any).document.getElementById = jest.fn();
	});
	it('Renders thumbnails sidebar correctly', () => {
		// given
		const posts = [
			mPost({ id: 1, directory: 'dir1', hash: 'hash1' }),
			mPost({ id: 2, directory: 'dir2', hash: 'hash2' }),
			mPost({ id: 3, directory: 'dir3', hash: 'hash3' }),
			mPost({ id: 4, directory: 'dir4', hash: 'hash4', downloaded: 1 }),
			mPost({ id: 5, directory: 'dir5', hash: 'hash5', downloaded: 1 }),
		];
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
				<ImageView />
			</Provider>
		);

		// then
		const thumbnails = screen.getAllByTestId('thumbnail-image');
		expect(thumbnails[0]).toHaveAttribute('src', `https://gelbooru.com/thumbnails/${posts[0].directory}/thumbnail_${posts[0].hash}.jpg`);
		expect(thumbnails[1]).toHaveAttribute('src', `https://gelbooru.com/thumbnails/${posts[1].directory}/thumbnail_${posts[1].hash}.jpg`);
		expect(thumbnails[2]).toHaveAttribute('src', `https://gelbooru.com/thumbnails/${posts[2].directory}/thumbnail_${posts[2].hash}.jpg`);
		expect(thumbnails[3]).toHaveAttribute('src', `https://gelbooru.com/thumbnails/${posts[3].directory}/thumbnail_${posts[3].hash}.jpg`);
		expect(thumbnails[4]).toHaveAttribute('src', `https://gelbooru.com/thumbnails/${posts[4].directory}/thumbnail_${posts[4].hash}.jpg`);
	});
	it('Renders FullSizeImage', () => {
		// given
		const posts = [
			mPost({ id: 1, directory: 'dir1', hash: 'hash1' }),
			mPost({ id: 2, directory: 'dir2', hash: 'hash2' }),
			mPost({ id: 3, directory: 'dir3', hash: 'hash3', fileUrl: 'file-url/name.gif', image: 'name.gif' }),
			mPost({ id: 4, directory: 'dir4', hash: 'hash4', downloaded: 1 }),
			mPost({ id: 5, directory: 'dir5', hash: 'hash5', downloaded: 1 }),
		];
		const activePostIndex = 2;
		const store = mockStore(
			mState({
				posts: {
					posts,
					activePostIndex,
				},
			})
		);

		// when
		render(
			<Provider store={store}>
				<ImageView />
			</Provider>
		);

		// then
		expect(screen.getByText('mocked image')).not.toBeNull();
	});
	it('Dispatches setImageViewThumbnailsCollapsed() when Siders collapse button is pressed', () => {
		// given
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<ImageView />
			</Provider>
		);
		fireEvent.click(screen.getByRole('img', { name: 'bars' }));

		// then
		expect(store.getActions()).toContainMatchingAction({ type: actions.system.setImageViewThumbnailsCollapsed.type });
	});
});
