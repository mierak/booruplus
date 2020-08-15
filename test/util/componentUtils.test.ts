const loadImageMock = jest.fn();
const saveImageMock = jest.fn();
jest.mock('../../src/util/imageIpcUtils', () => ({
	saveImage: saveImageMock,
	loadImage: loadImageMock,
}));
import { createObjectURL, revokeObjectURL } from '../helpers/window.mock';
import { getThumbnailBorder, imageLoader } from '../../src/util/componentUtils';
import { mPost } from '../helpers/test.helper';

describe('componentUtils', () => {
	Object.defineProperty(window, 'URL', {
		value: {
			createObjectURL: createObjectURL,
			revokeObjectURL: revokeObjectURL,
		},
	});
	describe('getThumbnailBorder', () => {
		it('Returns correct CSS border value', () => {
			// given

			// when
			const result1 = getThumbnailBorder('true', 'dark', false);
			const result2 = getThumbnailBorder('false', 'dark', false);
			const result3 = getThumbnailBorder('true', 'light', false);
			const result4 = getThumbnailBorder('false', 'light', false);
			const result5 = getThumbnailBorder('false', 'light', true);
			const result6 = getThumbnailBorder('true', 'light', true);

			// then
			expect(result1).toBe('dashed 1px white');
			expect(result2).toBe(undefined);
			expect(result3).toBe('dashed 1px black');
			expect(result4).toBe(undefined);
			expect(result5).toBe('solid 1px #177ddc');
			expect(result6).toBe('dashed 1px #177ddc');
		});
	});
	describe('imageLoader()', () => {
		describe('Post is downloaded', () => {
			it('Returns post fileUrl when image is not found on disk', async () => {
				// given
				const fileUrl = 'testfileurl.png';
				const post = mPost({ downloaded: 1, fileUrl });
				loadImageMock.mockRejectedValueOnce(post);

				// when
				const result = await imageLoader(post);

				// then
				expect(result).toEqual(fileUrl);
			});
			it('Calls createObjectURL when image is found on disk and returns it', async () => {
				// given
				const fileUrl = 'testfileurl.png';
				const post = mPost({ downloaded: 1, fileUrl });
				const data = 'testbinarydata';
				const objectUrl = 'testObjectUrl';
				loadImageMock.mockResolvedValueOnce({ data, post });
				createObjectURL.mockReturnValue(objectUrl);

				// when
				const result = await imageLoader(post);

				// then
				expect(result).toEqual(objectUrl);
			});
			it('Calls saveImage when missing post is not found on disk', async () => {
				// given
				const fileUrl = 'testfileurl.png';
				const post = mPost({ downloaded: 1, fileUrl });
				loadImageMock.mockRejectedValueOnce(post);

				// when
				const result = await imageLoader(post, true);

				// then
				expect(saveImageMock).toBeCalledWith(post);
				expect(result).toEqual(fileUrl);
			});
			it('Does not call saveImage when missing post is not found on disk and downloadMissingImages is false', async () => {
				// given
				const fileUrl = 'testfileurl.png';
				const post = mPost({ downloaded: 1, fileUrl });
				loadImageMock.mockRejectedValueOnce(post);

				// when
				const result = await imageLoader(post, false);

				// then
				expect(saveImageMock).toBeCalledWith(post);
				expect(result).toEqual(fileUrl);
			});
		});
		describe('Post is not downloaded', () => {
			it('Returns post fileUrl when post is not downloaded', async () => {
				// given
				const fileUrl = 'testfileurl.png';
				const post = mPost({ downloaded: 0, fileUrl });

				// when
				const result = await imageLoader(post);

				// then
				expect(result).toEqual(fileUrl);
			});
		});
	});
});
