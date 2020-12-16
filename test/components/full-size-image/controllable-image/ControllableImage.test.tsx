const loadImageMock = jest.fn();
jest.mock('../../../../src/util/componentUtils.tsx', () => {
	const originalModule = jest.requireActual('../../../../src/util/componentUtils.tsx');
	return {
		...originalModule,
		imageLoader: loadImageMock,
	};
});
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { RootState, AppDispatch } from '../../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../../helpers/store.helper';

jest.mock('../../../../src/components/full-size-image/TagsPopover', () => (): JSX.Element => <div>tags popover</div>);
import { renderImage, setViewportSettings, zoomIn, zoomOut, drawViewport } from '../../../helpers/renderer.mock';
import ControllableImage from '../../../../src/components/full-size-image/controllable-image/ControllableImage';
import '@testing-library/jest-dom';
import { mPost } from '../../../helpers/test.helper';
import { defineClientSize, defineClientBoundingRect } from '../../../helpers/utilities.helper';
import { getPostUrl } from '../../../../src/service/webService';
import { IpcChannels } from '../../../../src/types/processDto';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('full-size-image/controllabe-imabe/ControllableImage', () => {
	const url = 'objUrl123';
	beforeEach(() => {
		jest.clearAllMocks();
		loadImageMock.mockResolvedValueOnce(Promise.resolve(url));
	});
	afterEach(async () => {
		await waitFor(() => expect(renderImage).toHaveBeenCalled());
	});
	it('Renders correctly', async () => {
		// given
		const post = mPost({ fileUrl: 'url.jpg' });
		const store = mockStore(
			mState({
				settings: {
					downloadMissingImages: false,
				},
			})
		);

		// when
		const { unmount } = render(
			<Provider store={store}>
				<ControllableImage post={post} />
			</Provider>
		);
		const container = screen.getByTestId('controllable-image-container');
		const viewport = screen.getByLabelText('canvas');
		defineClientSize(container, {
			clientWidth: 123,
			clientHeight: 456,
		});
		defineClientBoundingRect(viewport, {
			top: 111,
			right: 12,
			bottom: 13,
			left: 14,
		});

		// then
		expect(loadImageMock).toHaveBeenCalledWith(post, false);
		expect(screen.getByLabelText('canvas')).not.toBeNull();
		await waitFor(() =>
			expect(setViewportSettings).toBeCalledWith({
				width: 123,
				height: 456,
				offsetX: 14,
				offsetY: 111,
			})
		);
		unmount();
	});
	it('Renders controls when shotControls prop is true', () => {
		// given
		const post = mPost({ fileUrl: 'url.jpg' });
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<ControllableImage post={post} showControls />
			</Provider>
		);

		// then
		expect(screen.getByRole('button', { name: 'Zoom in' })).not.toBeNull();
		expect(screen.getByRole('button', { name: 'Zoom out' })).not.toBeNull();
		expect(screen.getByRole('button', { name: 'Center Image' })).not.toBeNull();
		expect(screen.getByRole('button', { name: 'Show tags' })).not.toBeNull();
		expect(screen.getByRole('button', { name: 'Open in browser' })).not.toBeNull();
	});
	it('Calls renderer.zoomIn() when Zoom in action is clicked', () => {
		// given
		const post = mPost({ fileUrl: 'url.jpg' });
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<ControllableImage post={post} showControls />
			</Provider>
		);
		fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));

		// then
		expect(zoomIn).toBeCalledTimes(1);
	});
	it('Calls renderer.zoomOut() when Zoom in action is clicked', () => {
		// given
		const post = mPost({ fileUrl: 'url.jpg' });
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<ControllableImage post={post} showControls />
			</Provider>
		);
		fireEvent.click(screen.getByRole('button', { name: 'Zoom out' }));

		// then
		expect(zoomOut).toBeCalledTimes(1);
	});
	it('Calls renderer.setViewportSettings() with correct values and renderer.drawViewport() when Center Image action is clicked', async () => {
		// given
		const post = mPost({ fileUrl: 'url.jpg' });
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<ControllableImage post={post} showControls />
			</Provider>
		);
		const container = screen.getByTestId('controllable-image-container');
		const viewport = screen.getByLabelText('canvas');
		defineClientSize(container, {
			clientWidth: 123,
			clientHeight: 456,
		});
		defineClientBoundingRect(viewport, {
			top: 111,
			right: 12,
			bottom: 13,
			left: 14,
		});
		fireEvent.click(screen.getByRole('button', { name: 'Center Image' }));

		// then
		await waitFor(() =>
			expect(setViewportSettings).toBeCalledWith({
				width: 123,
				height: 456,
				offsetX: 14,
				offsetY: 111,
			})
		);
		await waitFor(() => expect(drawViewport).toBeCalledTimes(1));
	});
	it('Creates action with open-in-browser IPC message', () => {
		// given
		const post = mPost({ id: 123, tags: ['tag1', 'tag2', 'tag3'], fileUrl: 'test_file_url.jpg' });
		const store = mockStore(mState());
		const ipcSendSpy = jest.fn();
		(global as any).api = {
			send: ipcSendSpy,
		};

		// when
		render(
			<Provider store={store}>
				<ControllableImage post={post} showControls />
			</Provider>
		);
		fireEvent.click(screen.getByRole('button', { name: 'Open in browser' }));

		// then
		expect(ipcSendSpy).toBeCalledWith(IpcChannels.OPEN_IN_BROWSER, getPostUrl(post.id));
	});
	it('Creates action that shows TagsPopover', () => {
		// given
		const post = mPost({ id: 123, tags: ['tag1', 'tag2', 'tag3'], fileUrl: 'test_file_url.jpg' });
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<ControllableImage post={post} showControls />
			</Provider>
		);
		fireEvent.click(screen.getByRole('button', { name: 'Show tags' }));

		// then
		expect(screen.getByText('tags popover')).not.toBeNull();
	});
	it('Creates action that copies link to clipboard', () => {
		// given
		const spy = jest.fn();
		(window.clipboard as any) = {
			writeText: spy,
		};
		const link = 'somelink123.jpg';
		const post = mPost({ fileUrl: link });
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<ControllableImage showControls post={post} />
			</Provider>
		);
		fireEvent.click(screen.getByRole('button', { name: 'Copy to clipboard' }));

		// then
		expect(spy).toHaveBeenCalledWith(link);
	});
});
