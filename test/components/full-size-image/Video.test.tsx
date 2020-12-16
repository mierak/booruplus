import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../helpers/store.helper';

jest.mock('../../../src/components/full-size-image/TagsPopover', () => (): JSX.Element => <div>tags popover</div>);
import Video from '../../../src/components/full-size-image/Video';
import '@testing-library/jest-dom';
import { mPost } from '../../helpers/test.helper';
import { getPostUrl } from '../../../src/service/webService';
import { imageLoaderMock } from '../../helpers/imageBus.mock';
import { IpcChannels } from '../../../src/types/processDto';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('Video', () => {
	let play: () => Promise<void>;
	let pause: () => void;
	const url = 'objUrl123';
	beforeEach(() => {
		jest.clearAllMocks();
		play = jest.fn();
		pause = jest.fn();
		window.HTMLMediaElement.prototype.play = play;
		window.HTMLMediaElement.prototype.pause = pause;
		imageLoaderMock.mockResolvedValue(url);
	});
	it('Calls imageLoader, uses returned value and calls cleanup on unmount', async () => {
		// given
		const post = mPost({ id: 123, tags: ['tag1', 'tag2', 'tag3'], image: 'filename.webm', fileUrl: 'filename.webm' });
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
				<Video post={post} />
			</Provider>
		);

		// then
		expect(imageLoaderMock).toHaveBeenCalledWith(post, false);
		expect(await screen.findByTestId('video-source')).toHaveAttribute('src', url);
		expect(play).toHaveBeenCalledTimes(1);
		unmount();
	});
	it('Creates action with open-in-browser IPC message', () => {
		// given
		const post = mPost({ id: 123, tags: ['tag1', 'tag2', 'tag3'], fileUrl: 'test_file_url.webm' });
		const store = mockStore(mState());
		const ipcSendSpy = jest.fn();
		(global as any).api = {
			send: ipcSendSpy,
		};

		// when
		render(
			<Provider store={store}>
				<Video post={post} />
			</Provider>
		);
		fireEvent.click(screen.getByRole('button', { name: 'Open in browser' }));

		// then
		expect(ipcSendSpy).toBeCalledWith(IpcChannels.OPEN_IN_BROWSER, getPostUrl(post.id));
	});
	it('Creates action that shows TagsPopover', () => {
		// given
		const post = mPost({ id: 123, tags: ['tag1', 'tag2', 'tag3'], fileUrl: 'test_file_url.webm' });
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<Video post={post} />
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
				<Video post={post} />
			</Provider>
		);
		fireEvent.click(screen.getByRole('button', { name: 'Copy to clipboard' }));

		// then
		expect(spy).toHaveBeenCalledWith(link);
	});
});
