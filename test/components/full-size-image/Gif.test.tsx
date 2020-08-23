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
import Gif from '../../../src/components/full-size-image/Gif';
import '@testing-library/jest-dom';
import { mPost } from '../../helpers/test.helper';
import { getPostUrl } from '../../../src/service/webService';
import { IpcChannels } from '../../../src/types/processDto';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('Gif', () => {
	const url = 'objUrl123';
	beforeEach(() => {
		jest.clearAllMocks();
		loadImageMock.mockResolvedValueOnce(Promise.resolve(url));
	});
	it('Calls loadImage and renders returned url, calls cleanup', async () => {
		// given
		const post = mPost({ id: 123, tags: ['tag1', 'tag2', 'tag3'], downloaded: 1 });
		const store = mockStore(
			mState({
				settings: {
					downloadMissingImages: false,
				},
			})
		);
		loadImageMock.mockResolvedValueOnce(Promise.resolve(url));

		// when
		const { unmount } = render(
			<Provider store={store}>
				<Gif post={post} />
			</Provider>
		);

		// then
		expect(loadImageMock).toHaveBeenCalledWith(post, false);
		expect(await screen.findByTestId('full-image-gif')).toHaveAttribute('src', url);
		unmount();
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
		expect(ipcSendSpy).toBeCalledWith(IpcChannels.OPEN_IN_BROWSER, getPostUrl(post.id));
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
