import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
import { thumbnailLoaderMock } from '../../helpers/imageBus.mock';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('pages/ImageView', () => {
	const testUrl = '123testurl.jpg';
	beforeEach(() => {
		(global as any).document.getElementById = jest.fn();
		thumbnailLoaderMock.mockResolvedValue(testUrl);
	});
	it('Renders thumbnails sidebar and FullSizeImage correctly', () => {
		// given
		const context = 'ctx';
		const posts = [
			mPost({ id: 1, directory: 'dir1', hash: 'hash1', downloaded: 1 }),
			mPost({ id: 2, directory: 'dir2', hash: 'hash2', downloaded: 1 }),
			mPost({ id: 3, directory: 'dir3', hash: 'hash3', downloaded: 1 }),
		];
		const store = mockStore(
			mState({
				system: { activeSearchTab: context },
				searchContexts: { [context]: { posts } },
			})
		);

		// when
		const { unmount } = render(
			<Provider store={store}>
				<ImageView />
			</Provider>
		);

		// then
		const thumbnails = screen.getAllByTestId('thumbnail-image');
		expect(thumbnailLoaderMock.mock.calls).toEqual([
			[posts[0], true],
			[posts[1], true],
			[posts[2], true],
		]);
		posts.forEach(async (_, index) => {
			await waitFor(() => expect(thumbnails[index]).toHaveAttribute('src', testUrl));
		});
		expect(screen.getByText('mocked image')).not.toBeNull();
		unmount();
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
