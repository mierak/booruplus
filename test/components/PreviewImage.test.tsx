import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { RootState, AppDispatch } from '../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../helpers/store.helper';

import PreviewImage from '../../src/components/thumbnails/PreviewImage';
import '@testing-library/jest-dom';
import { mPost } from '../helpers/test.helper';
import { previewLoaderMock } from '../helpers/imageBus.mock';
import { imageCache } from '../../src/util/objectUrlCache';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('thumbnails/PreviewImage', () => {
	const setImagePositionMock = jest.fn();
	beforeEach(() => {
		jest.clearAllMocks();
		imageCache.revokeAll();
	});
	it('Renders correctly with preview image', async () => {
		// given
		const objectUrl = 'someobjecturl';
		const post = mPost();
		const store = mockStore(
			mState({
				posts: {
					hoveredPost: {
						post,
						visible: true,
					},
				},
			})
		);
		const ref = ({ current: {} } as unknown) as React.RefObject<HTMLDivElement>;
		previewLoaderMock.mockResolvedValue(objectUrl);

		// when
		render(
			<Provider store={store}>
				<PreviewImage setImagePosition={setImagePositionMock} ref={ref} />
			</Provider>
		);

		// then
		expect(await screen.findByTestId('preview-image')).toHaveAttribute('src', objectUrl);
	});
	it('Renders image from imageCache', async () => {
		// given
		const objectUrl = 'someobjecturl';
		const post = mPost();
		const store = mockStore(
			mState({
				posts: {
					hoveredPost: {
						post,
						visible: true,
					},
				},
			})
		);
		imageCache.add(objectUrl, post.id);
		const ref = ({ current: {} } as unknown) as React.RefObject<HTMLDivElement>;

		// when
		render(
			<Provider store={store}>
				<PreviewImage setImagePosition={setImagePositionMock} ref={ref} />
			</Provider>
		);

		// then
		expect(await screen.findByTestId('preview-image')).toHaveAttribute('src', objectUrl);
	});
	it('Renders empty state if preview not available', async () => {
		// given
		const post = mPost();
		const store = mockStore(
			mState({
				posts: {
					hoveredPost: {
						post,
						visible: true,
					},
				},
			})
		);
		previewLoaderMock.mockResolvedValue(undefined);
		const ref = ({ current: {} } as unknown) as React.RefObject<HTMLDivElement>;

		// when
		render(
			<Provider store={store}>
				<PreviewImage setImagePosition={setImagePositionMock} ref={ref} />
			</Provider>
		);

		// then
		expect(await screen.findByText('Preview not available')).not.toBeNull();
	});
	it('Renders loading state', async () => {
		// given
		const post = mPost();
		const store = mockStore(
			mState({
				posts: {
					hoveredPost: {
						post,
						visible: true,
					},
				},
			})
		);
		previewLoaderMock.mockImplementationOnce(async () => {
			return new Promise((resolve) => {
				setTimeout(() => {
					resolve(undefined);
				}, 300);
			});
		});
		const ref = ({ current: {} } as unknown) as React.RefObject<HTMLDivElement>;

		// when
		render(
			<Provider store={store}>
				<PreviewImage setImagePosition={setImagePositionMock} ref={ref} />
			</Provider>
		);

		// then
		expect(await screen.findByRole('img', { name: 'loading' })).not.toBeNull();
		expect(await screen.findByText('Preview not available')).not.toBeNull();
	});
});
