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
import { loadImageMock } from '../../helpers/imageBus.mock';
import { createObjectURL, revokeObjectURL } from '../../helpers/window.mock';
import { SuccessfulLoadPostResponse } from '../../../src/types/processDto';
import { Post } from '../../../src/types/gelbooruTypes';

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
	it('Renders correctly when video is found on disk', async () => {
		// given
		const post = mPost({ id: 123, tags: ['tag1', 'tag2', 'tag3'], image: 'filename.webm', fileUrl: 'filename.webm' });
		const store = mockStore(mState());
		const data = new Blob(['asdfasdf'], { type: 'image/webm' });
		loadImageMock.mockImplementationOnce(
			(post: Post, onFullfiled: (response: SuccessfulLoadPostResponse) => void, _: (post: Post) => void) => {
				onFullfiled({
					data,
					post,
				});
			}
		);
		const objectUrl = 'object_url';
		createObjectURL.mockReturnValueOnce(objectUrl);

		// when
		const { unmount } = render(
			<Provider store={store}>
				<Video post={post} />
			</Provider>
		);

		// then
		expect(await screen.findByTestId('video-source')).toHaveAttribute('src', objectUrl);
		expect(play).toHaveBeenCalledTimes(1);
		unmount();
		expect(revokeObjectURL).toBeCalledWith(objectUrl);
	});
	it('Renders correctly when video is NOT found on disk', async () => {
		// given
		const post = mPost({ id: 123, tags: ['tag1', 'tag2', 'tag3'], fileUrl: 'test_file_url.webm', image: 'filename.webm' });
		const store = mockStore(mState());
		loadImageMock.mockImplementationOnce(
			(post: Post, _: (response: SuccessfulLoadPostResponse) => void, onRejected: (post: Post) => void) => {
				onRejected(post);
			}
		);

		// when
		render(
			<Provider store={store}>
				<Video post={post} />
			</Provider>
		);

		// then
		expect(await screen.findByTestId('video-source')).toHaveAttribute('src', post.fileUrl);
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
		expect(ipcSendSpy).toBeCalledWith('open-in-browser', `https://gelbooru.com/index.php?page=post&s=view&id=${post.id}`);
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
