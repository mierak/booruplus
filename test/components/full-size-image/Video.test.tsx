const loadImageMock = jest.fn();
jest.mock('../../../src/util/componentUtils.tsx', () => {
	const originalModule = jest.requireActual('../../../src/util/componentUtils.tsx');
	return {
		...originalModule,
		imageLoader: loadImageMock,
	};
});
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

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('Video', () => {
	let load: () => void;
	let play: () => Promise<void>;
	let pause: () => void;
	beforeEach(() => {
		jest.clearAllMocks();
		load = jest.fn();
		play = jest.fn();
		pause = jest.fn();
		window.HTMLMediaElement.prototype.load = load;
		window.HTMLMediaElement.prototype.play = play;
		window.HTMLMediaElement.prototype.pause = pause;
	});
	it('Calls imageLoader, uses returned value and calls cleanup on unmount', async () => {
		// given
		const url = 'objUrl123';
		const post = mPost({ id: 123, tags: ['tag1', 'tag2', 'tag3'], image: 'filename.webm', fileUrl: 'filename.webm' });
		const store = mockStore(
			mState({
				settings: {
					downloadMissingImages: false,
				},
			})
		);
		const cleanup = jest.fn();
		loadImageMock.mockReturnValue({
			url: Promise.resolve(url),
			cleanup,
		});

		// when
		const { unmount } = render(
			<Provider store={store}>
				<Video post={post} />
			</Provider>
		);

		// then
		expect(loadImageMock).toHaveBeenCalledWith(post, false);
		expect(await screen.findByTestId('video-source')).toHaveAttribute('src', url);
		expect(play).toHaveBeenCalledTimes(1);
		unmount();
		expect(cleanup).toHaveBeenCalledTimes(1);
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
		expect(ipcSendSpy).toBeCalledWith('open-in-browser', getPostUrl(post.id));
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
});
