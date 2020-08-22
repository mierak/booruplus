jest.mock('electron-log', () => {
	return {
		debug: jest.fn(),
		error: jest.fn(),
	};
});
jest.mock('fs');
import { mocked } from 'ts-jest/utils';
import fs, { Dirent } from 'fs';
import { getFileService } from '../../electron/fileService';
import { mSettings, mPost } from '../helpers/test.helper';

const mockedFs = mocked(fs, true);

describe('electron/fileService', () => {
	(fs as any).promises = {};
	fs.promises.writeFile = jest.fn();
	fs.promises.unlink = jest.fn();
	fs.promises.mkdir = jest.fn();
	fs.promises.rmdir = jest.fn();
	fs.promises.readdir = jest.fn();
	const imagesPath = '/tmp/booruplus';
	const settings = mSettings({
		imagesFolderPath: imagesPath,
	});
	const service = getFileService(settings);

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('loadImage()', () => {
		it('Calls readFile() and returns correct result if successful', async () => {
			// given
			const post = mPost();
			const resultBuffer = Buffer.from('somedata123');
			mockedFs.readFileSync.mockReturnValueOnce(resultBuffer);

			// when
			const result = await service.loadImage(post);

			// then
			expect(result.post).toMatchObject(post);
			expect(result.data).toEqual(resultBuffer);
		});
		it('Calls readFile() and returns undefined data if unsuccesful', async () => {
			// given
			const post = mPost();
			mockedFs.readFileSync.mockImplementationOnce(() => {
				throw new Error('some error');
			});

			// when
			const result = await service.loadImage(post);

			// then
			expect(result.post).toMatchObject(post);
			expect(result.data).toEqual(undefined);
		});
	});
	describe('loadThumbnail()', () => {
		it('Calls readFile() and returns correct result if successful', async () => {
			// given
			const post = mPost();
			const resultBuffer = Buffer.from('somedata123');
			mockedFs.readFileSync.mockReturnValueOnce(resultBuffer);

			// when
			const result = await service.loadThumbnail(post);

			// then
			expect(result.post).toMatchObject(post);
			expect(result.data).toEqual(resultBuffer);
		});
		it('Calls readFile() and returns undefined data if unsuccesful', async () => {
			// given
			const post = mPost();
			mockedFs.readFileSync.mockImplementationOnce(() => {
				throw new Error('some error');
			});

			// when
			const result = await service.loadThumbnail(post);

			// then
			expect(result.post).toMatchObject(post);
			expect(result.data).toEqual(undefined);
		});
	});
	describe('saveImage()', () => {
		it('Calls writeFile() with correct arguments and returns true if succesful', async () => {
			// given
			const post = mPost();
			const imagePath = `${settings.imagesFolderPath}/${post.directory}/${post.image}`;
			const data = Buffer.from('sometestdata');

			// when
			const result = await service.saveImage(post, data);

			// then
			expect(mockedFs.promises.writeFile).toBeCalledWith(imagePath, data, 'binary');
			expect(result).toBe(true);
		});
		it('Returns false if write unsuccesful', async () => {
			// given
			const post = mPost();
			const imagePath = `${settings.imagesFolderPath}/${post.directory}/${post.image}`;
			const data = Buffer.from('sometestdata');
			mockedFs.promises.writeFile.mockImplementationOnce(() => {
				throw new Error('some error');
			});

			// when
			const result = await service.saveImage(post, data);

			// then
			expect(mockedFs.promises.writeFile).toBeCalledWith(imagePath, data, 'binary');
			expect(result).toBe(false);
		});
	});
	describe('saveThumbnail()', () => {
		it('Calls writeFile() with correct arguments and returns true if succesful', async () => {
			// given
			const post = mPost();
			const imagePath = `${settings.imagesFolderPath}/thumbnails/${post.directory}/${post.hash}.jpg`;
			const data = Buffer.from('sometestdata');

			// when
			const result = await service.saveThumbnail(post, data);

			// then
			expect(mockedFs.promises.writeFile).toBeCalledWith(imagePath, data, 'binary');
			expect(result).toBe(true);
		});
		it('Returns false if write unsuccesful', async () => {
			// given
			const post = mPost();
			const imagePath = `${settings.imagesFolderPath}/thumbnails/${post.directory}/${post.hash}.jpg`;
			const data = Buffer.from('sometestdata');
			mockedFs.promises.writeFile.mockImplementationOnce(() => {
				throw new Error('some error');
			});

			// when
			const result = await service.saveThumbnail(post, data);

			// then
			expect(mockedFs.promises.writeFile).toBeCalledWith(imagePath, data, 'binary');
			expect(result).toBe(false);
		});
	});
	describe('deleteImage()', () => {
		it('Calls unlink() with correct arguments', async () => {
			// given
			const post = mPost();
			const imagePath = `${settings.imagesFolderPath}/${post.directory}/${post.image}`;

			// when
			await service.deleteImage(post);

			// then
			expect(mockedFs.promises.unlink).toBeCalledWith(imagePath);
		});
	});
	describe('deleteThumbnail()', () => {
		it('Calls unlink() with correct arguments', async () => {
			// given
			const post = mPost();
			const imagePath = `${settings.imagesFolderPath}/thumbnails/${post.directory}/${post.hash}.jpg`;

			// when
			await service.deleteThumbnail(post);

			// then
			expect(mockedFs.promises.unlink).toBeCalledWith(imagePath);
		});
	});
	describe('createImageDirIfNotExists()', () => {
		it('Calls mkdir with correct params and retruns true if succesful', async () => {
			// given
			const post = mPost();
			const dir = settings.imagesFolderPath.concat(`/${post.directory}`);
			mockedFs.promises.mkdir.mockResolvedValueOnce(undefined);

			// when
			const result = await service.createImageDirIfNotExists(post);

			// then
			expect(result).toBe(true);
			expect(mockedFs.promises.mkdir).toHaveBeenCalledWith(dir, { recursive: true });
		});
		it('Calls mkdir with correct params and retruns false if dir already exists', async () => {
			// given
			const post = mPost();
			const dir = settings.imagesFolderPath.concat(`/${post.directory}`);
			const err = new Error();
			(err as any).code = 'EEXIST';
			mockedFs.promises.mkdir.mockRejectedValue(err);

			// when
			const result = await service.createImageDirIfNotExists(post);

			// then
			expect(result).toBe(false);
			expect(mockedFs.promises.mkdir).toHaveBeenCalledWith(dir, { recursive: true });
		});
		it('Calls mkdir with correct params and retruns false if unexpected error is thrown', async () => {
			// given
			const post = mPost();
			const dir = settings.imagesFolderPath.concat(`/${post.directory}`);
			const err = new Error();
			mockedFs.promises.mkdir.mockRejectedValue(err);

			// when
			const result = await service.createImageDirIfNotExists(post);

			// then
			expect(result).toBe(false);
			expect(mockedFs.promises.mkdir).toHaveBeenCalledWith(dir, { recursive: true });
		});
	});
	describe('createThumbnailDirIfNotExists()', () => {
		it('Calls mkdir with correct params and retruns true if succesful', async () => {
			// given
			const post = mPost();
			const dir = settings.imagesFolderPath.concat('/thumbnails').concat(`/${post.directory}`);
			mockedFs.promises.mkdir.mockResolvedValueOnce(undefined);

			// when
			const result = await service.createThumbnailDirIfNotExists(post);

			// then
			expect(result).toBe(true);
			expect(mockedFs.promises.mkdir).toHaveBeenCalledWith(dir, { recursive: true });
		});
		it('Calls mkdir with correct params and retruns false if dir already exists', async () => {
			// given
			const post = mPost();
			const dir = settings.imagesFolderPath.concat('/thumbnails').concat(`/${post.directory}`);
			const err = new Error();
			(err as any).code = 'EEXIST';
			mockedFs.promises.mkdir.mockRejectedValue(err);

			// when
			const result = await service.createThumbnailDirIfNotExists(post);

			// then
			expect(result).toBe(false);
			expect(mockedFs.promises.mkdir).toHaveBeenCalledWith(dir, { recursive: true });
		});
		it('Calls mkdir with correct params and retruns false if unexpected error is thrown', async () => {
			// given
			const post = mPost();
			const dir = settings.imagesFolderPath.concat('/thumbnails').concat(`/${post.directory}`);
			const err = new Error();
			mockedFs.promises.mkdir.mockRejectedValue(err);

			// when
			const result = await service.createThumbnailDirIfNotExists(post);

			// then
			expect(result).toBe(false);
			expect(mockedFs.promises.mkdir).toHaveBeenCalledWith(dir, { recursive: true });
		});
	});
	describe('deletePostDirectoryIfEmpty()', () => {
		it('Deletes inner and outer directory', async () => {
			// given
			const post = mPost();
			const dirs = post.directory.split('/');
			const firstDir = settings.imagesFolderPath.concat(`/${dirs[0]}/${dirs[1]}`);
			const secondDir = settings.imagesFolderPath.concat(`/${dirs[0]}`);
			mockedFs.promises.readdir.mockResolvedValue([]);

			// when
			const result = await service.deletePostDirectoryIfEmpty(post);

			// then
			expect(result).toBe(true);
			expect(mockedFs.promises.rmdir).toHaveBeenCalledTimes(2);
			expect(mockedFs.promises.rmdir).toHaveBeenCalledWith(firstDir);
			expect(mockedFs.promises.rmdir).toHaveBeenCalledWith(secondDir);
		});
		it('Deletes only inner directory when outer is not empty', async () => {
			// given
			const post = mPost();
			const dirs = post.directory.split('/');
			const firstDir = settings.imagesFolderPath.concat(`/${dirs[0]}/${dirs[1]}`);
			mockedFs.promises.readdir.mockImplementation(
				(param, _): Promise<Dirent[]> => {
					if (param === firstDir) {
						return Promise.resolve([]);
					} else {
						return Promise.resolve([new Dirent()]);
					}
				}
			);

			// when
			const result = await service.deletePostDirectoryIfEmpty(post);

			// then
			expect(result).toBe(true);
			expect(mockedFs.promises.rmdir).toHaveBeenCalledTimes(1);
			expect(mockedFs.promises.rmdir).toHaveBeenCalledWith(firstDir);
		});
		it('Does not delete anything when inner dir is not empty', async () => {
			// given
			const post = mPost();
			const dirs = post.directory.split('/');
			const secondDir = settings.imagesFolderPath.concat(`/${dirs[0]}`);
			mockedFs.promises.readdir.mockImplementation(
				(param, _): Promise<Dirent[]> => {
					if (param === secondDir) {
						return Promise.resolve([]);
					} else {
						return Promise.resolve([new Dirent()]);
					}
				}
			);

			// when
			const result = await service.deletePostDirectoryIfEmpty(post);

			// then
			expect(result).toBe(true);
			expect(mockedFs.promises.rmdir).toHaveBeenCalledTimes(0);
		});
		it('Returns false when an error is thrown', async () => {
			// given
			const post = mPost();
			mockedFs.promises.readdir.mockImplementation(() => {
				throw new Error('some err');
			});

			// when
			const result = await service.deletePostDirectoryIfEmpty(post);

			// then
			expect(result).toBe(false);
			expect(mockedFs.promises.rmdir).toHaveBeenCalledTimes(0);
		});
	});
	describe('deleteThumbnailDirectoryIfEmpty()', () => {
		it('Deletes inner and outer directory', async () => {
			// given
			const post = mPost();
			const dirs = post.directory.split('/');
			const firstDir = settings.imagesFolderPath.concat('/thumbnails').concat(`/${dirs[0]}/${dirs[1]}`);
			const secondDir = settings.imagesFolderPath.concat('/thumbnails').concat(`/${dirs[0]}`);
			mockedFs.promises.readdir.mockResolvedValue([]);

			// when
			const result = await service.deleteThumbnailDirectoryIfEmpty(post);

			// then
			expect(result).toBe(true);
			expect(mockedFs.promises.rmdir).toHaveBeenCalledTimes(2);
			expect(mockedFs.promises.rmdir).toHaveBeenCalledWith(firstDir);
			expect(mockedFs.promises.rmdir).toHaveBeenCalledWith(secondDir);
		});
		it('Deletes only inner directory when outer is not empty', async () => {
			// given
			const post = mPost();
			const dirs = post.directory.split('/');
			const firstDir = settings.imagesFolderPath.concat('/thumbnails').concat(`/${dirs[0]}/${dirs[1]}`);
			mockedFs.promises.readdir.mockImplementation(
				(param, _): Promise<Dirent[]> => {
					if (param === firstDir) {
						return Promise.resolve([]);
					} else {
						return Promise.resolve([new Dirent()]);
					}
				}
			);

			// when
			const result = await service.deleteThumbnailDirectoryIfEmpty(post);

			// then
			expect(result).toBe(true);
			expect(mockedFs.promises.rmdir).toHaveBeenCalledTimes(1);
			expect(mockedFs.promises.rmdir).toHaveBeenCalledWith(firstDir);
		});
		it('Does not delete anything when inner dir is not empty', async () => {
			// given
			const post = mPost();
			const dirs = post.directory.split('/');
			const secondDir = settings.imagesFolderPath.concat('thumbnails').concat(`/${dirs[0]}`);
			mockedFs.promises.readdir.mockImplementation(
				(param, _): Promise<Dirent[]> => {
					if (param === secondDir) {
						return Promise.resolve([]);
					} else {
						return Promise.resolve([new Dirent()]);
					}
				}
			);

			// when
			const result = await service.deleteThumbnailDirectoryIfEmpty(post);

			// then
			expect(result).toBe(true);
			expect(mockedFs.promises.rmdir).toHaveBeenCalledTimes(0);
		});
		it('Returns false when an error is thrown', async () => {
			// given
			const post = mPost();
			mockedFs.promises.readdir.mockImplementation(() => {
				throw new Error('some err');
			});

			// when
			const result = await service.deleteThumbnailDirectoryIfEmpty(post);

			// then
			expect(result).toBe(false);
			expect(mockedFs.promises.rmdir).toHaveBeenCalledTimes(0);
		});
	});
});
