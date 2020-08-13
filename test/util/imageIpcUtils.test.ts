import { mPost } from '../helpers/test.helper';
import { loadImage } from '../../src/util/imageIpcUtils';
import { IpcChannels } from '../../src/types/processDto';

describe('imageIpcUtils', () => {
	const invokeMock = jest.fn();
	(global as any).api = {};
	(global as any).api.invoke = invokeMock;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('loadImage()', () => {
		it('Invokes IPC and resolves with correct value', async () => {
			// given
			const post = mPost({ id: 123456 });
			const data = 'testdata123';
			invokeMock.mockResolvedValueOnce({ data, post });

			// when
			const result = await loadImage(post);

			// then
			expect(invokeMock).toBeCalledWith(IpcChannels.LOAD_IMAGE, post);
			expect(result).toMatchObject({ data, post });
		});
		it('Invokes IPC and rejects with correct value', async () => {
			// given
			const post = mPost({ id: 123456 });
			invokeMock.mockResolvedValueOnce({ data: undefined, post });
			let err;

			// when
			await loadImage(post).catch((e) => {
				err = e;
			});

			// then
			expect(err).toMatchObject(post);
		});
	});
});
