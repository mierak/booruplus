import { doDatabaseMock } from '../helpers/database.mock';
doDatabaseMock();

import { RootState, AppDispatch } from '../../src/store/types';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mPost } from '../helpers/test.helper';
import { mState } from '../helpers/store.helper';
import { exportPostsToDirectory } from '../../src/store/commonActions';
import { IpcChannels } from '../../src/types/processDto';

const mockStore = configureStore<RootState, AppDispatch>([thunk]);

describe('store/commonActions', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});
	describe('exportPostsToDirectory()', () => {
		const ipcInvokeSpy = jest.fn();
		const ipcSendSpy = jest.fn();
		(global as any).api = {
			send: ipcSendSpy,
			invoke: ipcInvokeSpy,
		};
		beforeEach(() => {
			jest.clearAllMocks();
		});
		it('It invokes correct IPC for all posts', async () => {
			// given
			const posts = [mPost({ id: 123 }), mPost({ id: 456 }), mPost({ id: 789 })];
			const path = 'testpath';
			const store = mockStore(
				mState({
					posts: {
						posts: { posts, favorites: [] },
					},
				})
			);
			ipcInvokeSpy.mockResolvedValue(path);

			// when
			await store.dispatch(exportPostsToDirectory({ type: 'all', context: 'posts' }));

			// then
			expect(ipcInvokeSpy).toBeCalledTimes(1);
			expect(ipcSendSpy).toBeCalledWith(IpcChannels.EXPORT_POSTS, { path, posts });
		});
		it('It invokes correct IPC for selected posts', async () => {
			// given
			const posts = [mPost({ id: 123, selected: true }), mPost({ id: 456, selected: true }), mPost({ id: 789 })];
			const path = 'testpath';
			const store = mockStore(
				mState({
					posts: {
						posts: { posts, favorites: [] },
					},
				})
			);
			ipcInvokeSpy.mockResolvedValue(path);

			// when
			await store.dispatch(exportPostsToDirectory({ type: 'selected', context: 'posts' }));

			// then
			expect(ipcInvokeSpy).toBeCalledTimes(1);
			expect(ipcSendSpy).toBeCalledWith(IpcChannels.EXPORT_POSTS, { path: path, posts: [posts[0], posts[1]] });
		});
		it('It invokes correct IPC for supplied posts', async () => {
			// given
			const posts = [mPost({ id: 123 }), mPost({ id: 456 }), mPost({ id: 789 })];
			const path = 'testpath';
			const store = mockStore(mState());
			ipcInvokeSpy.mockResolvedValue(path);

			// when
			await store.dispatch(exportPostsToDirectory(posts));

			// then
			expect(ipcInvokeSpy).toBeCalledTimes(1);
			expect(ipcSendSpy).toBeCalledWith(IpcChannels.EXPORT_POSTS, { path: path, posts });
		});
	});
});
