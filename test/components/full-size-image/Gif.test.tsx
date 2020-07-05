import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { RootState, AppDispatch } from '../../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mState } from '../../helpers/store.helper';

jest.mock('../../../src/components/full-size-image/TagsPopover', () => (): JSX.Element => <div>tags popover</div>);
import Gif from '../../../src/components/full-size-image/Gif';
import '@testing-library/jest-dom';
import { mPost } from '../../helpers/test.helper';
import { Post } from '../../../src/types/gelbooruTypes';
import { loadImageMock } from '../../helpers/imageBus.mock';
import { createObjectURL, revokeObjectURL } from '../../helpers/window.mock';
import { SuccessfulLoadPostResponse } from '../../../src/types/processDto';
import { getPostUrl } from 'service/webService';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('Gif', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});
	it('Renders correctly when image is found on disk', () => {
		// given
		const post = mPost({ id: 123, tags: ['tag1', 'tag2', 'tag3'] });
		const store = mockStore(mState());
		const data = new Blob(['asdfasdf'], { type: 'image/gif' });
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
				<Gif post={post} />
			</Provider>
		);

		// then
		waitFor(() => expect(screen.getByTestId('full-image-gif')).toHaveAttribute('src', objectUrl));
		unmount();
		expect(revokeObjectURL).toBeCalledWith(objectUrl);
	});
	it('Renders correctly when image is NOT found on disk', async () => {
		// given
		const post = mPost({ id: 123, tags: ['tag1', 'tag2', 'tag3'], fileUrl: 'test_file_url.gif' });
		const store = mockStore(mState());
		loadImageMock.mockImplementationOnce(
			(post: Post, _: (response: SuccessfulLoadPostResponse) => void, onRejected: (post: Post) => void) => {
				onRejected(post);
			}
		);

		// when
		render(
			<Provider store={store}>
				<Gif post={post} />
			</Provider>
		);

		// then
		expect(await screen.findByTestId('full-image-gif')).toHaveAttribute('src', post.fileUrl);
	});
	it('Creates action with open-in-browser IPC message', () => {
		// given
		const post = mPost({ id: 123, tags: ['tag1', 'tag2', 'tag3'], fileUrl: 'test_file_url.gif' });
		const store = mockStore(mState());
		const ipcSendSpy = jest.fn();
		(global as any).api = {
			send: ipcSendSpy,
		};

		// when
		render(
			<Provider store={store}>
				<Gif post={post} />
			</Provider>
		);
		fireEvent.click(screen.getByRole('button', { name: 'Open in browser' }));

		// then
		expect(ipcSendSpy).toBeCalledWith('open-in-browser', getPostUrl(post.id));
	});
	it('Creates action that shows TagsPopover', () => {
		// given
		const post = mPost({ id: 123, tags: ['tag1', 'tag2', 'tag3'], fileUrl: 'test_file_url.gif' });
		const store = mockStore(mState());

		// when
		render(
			<Provider store={store}>
				<Gif post={post} />
			</Provider>
		);
		fireEvent.click(screen.getByRole('button', { name: 'Show tags' }));

		// then
		expect(screen.getByText('tags popover')).not.toBeNull();
	});
});
