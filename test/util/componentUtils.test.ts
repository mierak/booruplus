const loadImageMock = jest.fn();
const saveImageMock = jest.fn();
const saveThumbnailMock = jest.fn();
const loadThumbnailMock = jest.fn();
jest.mock('../../src/util/imageIpcUtils', () => ({
	saveImage: saveImageMock,
	saveThumbnail: saveThumbnailMock,
	loadImage: loadImageMock,
	loadThumbnail: loadThumbnailMock,
}));
const getImageIfPresent = jest.fn();
const getThumbnailIfPresent = jest.fn();
jest.mock('../../src/util/objectUrlCache', () => ({
	imageCache: {
		getIfPresent: getImageIfPresent,
		add: jest.fn(),
	},
	thumbnailCache: {
		getIfPresent: getThumbnailIfPresent,
		add: jest.fn(),
	},
	mostViewedCache: {
		getIfPresent: getThumbnailIfPresent,
		add: jest.fn(),
	},
}));
import { createObjectURL, revokeObjectURL } from '../helpers/window.mock';
import {
	getThumbnailBorder,
	imageLoader,
	thumbnailLoader,
	mostViewedLoader,
	getPreviewImageSize,
	previewLoader,
} from '../../src/util/componentUtils';
import { mPost } from '../helpers/test.helper';
import { getThumbnailUrl, getPreviewUrl } from '../../src/service/webService';

describe('componentUtils', () => {
	Object.defineProperty(window, 'URL', {
		value: {
			createObjectURL: createObjectURL,
			revokeObjectURL: revokeObjectURL,
		},
	});
	beforeEach(() => {
		jest.clearAllMocks();
		jest.resetAllMocks();
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
				const post = mPost({ id: 5314, downloaded: 1, fileUrl });
				loadImageMock.mockRejectedValueOnce(post);

				// when
				const result = await imageLoader(post);

				// then
				expect(result).toEqual(fileUrl);
			});
			it('Checks if post is already cached and returns it if found', async () => {
				// given
				const fileUrl = 'testfileurl.png';
				const post = mPost({ id: 879, downloaded: 1, fileUrl });
				const data = 'testbinarydata';
				const objectUrl = 'testObjectUrl';
				getImageIfPresent.mockReturnValueOnce(objectUrl);
				loadImageMock.mockResolvedValueOnce({ data, post });

				// when
				const result = await imageLoader(post);

				// then
				expect(result).toEqual(objectUrl);
			});
			it('Checks if post is already cached and creates new object url if not found', async () => {
				// given
				const post = mPost({ id: 879545887, downloaded: 1 });
				const data = 'testbinarydata';
				const objectUrl = 'testObjectUrl';
				createObjectURL.mockReturnValueOnce(objectUrl);
				getImageIfPresent.mockReturnValueOnce(undefined);
				loadImageMock.mockResolvedValueOnce({ data, post });

				// when
				const result = await imageLoader(post);

				// then
				expect(result).toEqual(objectUrl);
			});
			it('Calls saveImage when missing post is not found on disk', async () => {
				// given
				const fileUrl = 'testfileurl.png';
				const post = mPost({ id: 1235454, downloaded: 1, fileUrl });
				getImageIfPresent.mockReturnValueOnce(undefined);
				loadImageMock.mockRejectedValueOnce(post);

				// when
				const result = await imageLoader(post, true);

				// then
				expect(loadImageMock).toHaveBeenCalledWith(post);
				expect(saveImageMock).toBeCalledWith(post);
				expect(result).toEqual(fileUrl);
			});
			it('Does not call saveImage when missing post is not found on disk and downloadMissingImages is false', async () => {
				// given
				const fileUrl = 'testfileurl.png';
				const post = mPost({ id: 12345, downloaded: 1, fileUrl });
				loadImageMock.mockRejectedValueOnce(post);

				// when
				const result = await imageLoader(post, false);

				// then
				expect(saveImageMock).toHaveBeenCalledTimes(0);
				expect(result).toEqual(fileUrl);
			});
		});
		describe('Post is not downloaded', () => {
			it('Returns post fileUrl when post is not downloaded', async () => {
				// given
				const fileUrl = 'testfileurl.png';
				const post = mPost({ id: 12315687, downloaded: 0, fileUrl });

				// when
				const result = await imageLoader(post);

				// then
				expect(result).toEqual(fileUrl);
			});
		});
	});
	describe('thumbnailsLoader()', () => {
		describe('Post is downloaded', () => {
			it('Returns thumbnail url when thumbnail is not found on disk', async () => {
				// given
				const testDir = 'testdir123';
				const testHash = 'testHash1536';
				const post = mPost({ id: 123156, downloaded: 1, directory: testDir, hash: testHash });
				loadThumbnailMock.mockRejectedValueOnce(post);

				// when
				const result = await thumbnailLoader(post);

				// then
				expect(result).toEqual(getThumbnailUrl(testDir, testHash));
			});
			it('Checks if post is already cached and returns it if found', async () => {
				// given
				const fileUrl = 'testfileurl.png';
				const post = mPost({ id: 87534, downloaded: 1, fileUrl });
				const data = 'testbinarydata';
				const objectUrl = 'testObjectUrl';
				getThumbnailIfPresent.mockReturnValueOnce(objectUrl);
				loadThumbnailMock.mockResolvedValueOnce({ data, post });

				// when
				const result = await thumbnailLoader(post);

				// then
				expect(result).toEqual(objectUrl);
			});
			it('Checks if post is already cached and creates new object url if not found', async () => {
				// given
				const post = mPost({ id: 879545887, downloaded: 1 });
				const data = 'testbinarydata';
				const objectUrl = 'testObjectUrl';
				createObjectURL.mockReturnValueOnce(objectUrl);
				getThumbnailIfPresent.mockReturnValueOnce(undefined);
				loadThumbnailMock.mockResolvedValueOnce({ data, post });

				// when
				const result = await thumbnailLoader(post);

				// then
				expect(result).toEqual(objectUrl);
			});
			it('Calls saveThumbnail when missing post is not found on disk', async () => {
				// given
				const testDir = 'testdir123';
				const testHash = 'testHash1536';
				const post = mPost({ id: 23698, downloaded: 1, directory: testDir, hash: testHash });
				getImageIfPresent.mockReturnValueOnce(undefined);
				loadThumbnailMock.mockRejectedValueOnce(post);

				// when
				const result = await thumbnailLoader(post, true);

				// then
				expect(saveThumbnailMock).toBeCalledWith(post);
				expect(result).toEqual(getThumbnailUrl(testDir, testHash));
			});
			it('Does not call saveImage when missing post is not found on disk and downloadMissingImages is false', async () => {
				// given
				const testDir = 'testdir123';
				const testHash = 'testHash1536';
				const post = mPost({ id: 213857, downloaded: 1, directory: testDir, hash: testHash });
				loadThumbnailMock.mockRejectedValueOnce(post);

				// when
				const result = await thumbnailLoader(post, false);

				// then
				expect(saveThumbnailMock).toHaveBeenCalledTimes(0);
				expect(result).toEqual(getThumbnailUrl(testDir, testHash));
			});
		});
		describe('Post is not downloaded', () => {
			it('Returns post thumbnail url when post is not downloaded', async () => {
				// given
				const testDir = 'testdir123';
				const testHash = 'testHash1536';
				const post = mPost({ id: 987645, downloaded: 0, directory: testDir, hash: testHash });

				// when
				const result = await thumbnailLoader(post);

				// then
				expect(result).toEqual(getThumbnailUrl(testDir, testHash));
			});
		});
	});
	describe('previewLoader()', () => {
		describe('Post is downloaded', () => {
			it('Resolves undefined if post is a video', async () => {
				// given
				const post = mPost({ image: 'someimage.webm', downloaded: 1 });

				// when
				const result = await previewLoader(post);

				// then
				expect(result).toBeUndefined();
			});
			it('Resolves fileUrl if post fails to load from disk', async () => {
				// given
				const post = mPost({ image: 'someimage.jpg', downloaded: 1 });
				loadImageMock.mockRejectedValueOnce(undefined);

				// when
				const result = await previewLoader(post);

				// then
				expect(result).toBe(post.fileUrl);
			});
			it('Creates and resolves objectUrl if post is found on disk', async () => {
				// given
				const objectUrl = 'someobjecturl';
				const post = mPost({
					image: 'someimage.jpg',
					downloaded: 1,
				});
				loadImageMock.mockResolvedValueOnce(new Blob(['asdasdasd']));
				createObjectURL.mockReturnValueOnce(objectUrl);

				// when
				const result = await previewLoader(post);

				// then
				expect(result).toBe(objectUrl);
			});
		});
		describe('Post is not downloaded', () => {
			it('Resolves fileUrl if post has no sample', async () => {
				// given
				const post = mPost({ sample: false });

				// when
				const result = await previewLoader(post);

				// then
				expect(result).toBe(post.fileUrl);
			});
			it('Resolves previewUrl if post has sample', async () => {
				// given
				const post = mPost({ sample: true });

				// when
				const result = await previewLoader(post);

				// then
				expect(result).toBe(getPreviewUrl(post.directory, post.hash));
			});
			it('Resolves undefined if post is a video and has no sample', async () => {
				// given
				const post = mPost({ image: 'someimage.webm', downloaded: 0 });

				// when
				const result = await previewLoader(post);

				// then
				expect(result).toBeUndefined();
			});
		});
		describe('Post is cached', () => {
			it('Returns the cached post', async () => {
				// given
				const objectUrl = 'someobjecturl';
				const post = mPost({ id: 987645 });
				getImageIfPresent.mockReturnValue(objectUrl);

				// when
				const result = await previewLoader(post);

				// then
				expect(result).toEqual(objectUrl);
			});
		});
	});
	describe('mostViewedLoader()', () => {
		it('Ignores downloaded status of a post', async () => {
			// given
			const testDir = 'testdir123';
			const testHash = 'testHash1536';
			const post = mPost({ id: 987645873, downloaded: 0, directory: testDir, hash: testHash });
			getThumbnailIfPresent.mockReturnValueOnce(undefined);
			loadThumbnailMock.mockRejectedValueOnce(post);

			// when
			const result = await mostViewedLoader(post);

			// then
			expect(loadThumbnailMock).toHaveBeenCalledWith(post);
			expect(result).toEqual(getThumbnailUrl(testDir, testHash));
		});
	});
	describe('setImageSizeStyle()', () => {
		describe('width > height', () => {
			it('height > window.height', () => {
				// given
				const windowSize = { width: 800, height: 200 };
				const post = mPost({ width: 640, height: 320 });

				// when
				const result = getPreviewImageSize({ post, windowSize });

				// then
				expect(result.width).toBe(380);
				expect(result.height).toBe(190);
			});
			it('height < window.height', () => {
				// given
				const windowSize = { width: 800, height: 800 };
				const post = mPost({ width: 640, height: 639 });

				// when
				const result = getPreviewImageSize({ post, windowSize });

				// then
				expect(result.width).toBe(528);
				expect(result.height).toBe(527.175);
			});
		});
		describe('width < height', () => {
			it('width < window.width', () => {
				// given
				const windowSize = { width: 800, height: 800 };
				const post = mPost({ width: 320, height: 640 });

				// when
				const result = getPreviewImageSize({ post, windowSize });

				// then
				expect(result.width).toBe(380);
				expect(result.height).toBe(760);
			});
			it('width > window.width', () => {
				// given
				const windowSize = { width: 300, height: 800 };
				const post = mPost({ width: 639, height: 640 });

				// when
				const result = getPreviewImageSize({ post, windowSize });

				// then
				expect(result.width).toBe(198);
				expect(result.height).toBe(198.30985915492957);
			});
		});
	});
});
