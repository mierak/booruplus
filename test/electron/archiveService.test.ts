jest.mock('electron-log', () => {
	return {
		debug: jest.fn(),
		error: jest.fn(),
	};
});
const actualFs = jest.requireActual('fs');
jest.mock('fs');
import { Readable } from 'stream';
jest.mock('stream');
jest.mock('tar');
import { mocked } from 'ts-jest/utils';
import path from 'path';
import stream from 'stream';
import fs, { Dirent } from 'fs';
import { mSettings } from '../helpers/test.helper';
import tar from 'tar';
import { getArchiveService } from '../../electron/archiveService';

const mockedFs = mocked(fs, true);
const mockedTar = mocked(tar, true);
const mockedStream = mocked(stream, true);

const mDirent = (isDir: boolean, name: string): Dirent => {
	return {
		name,
		isDirectory: (): boolean => isDir,
		isBlockDevice: (): boolean => true,
		isCharacterDevice: (): boolean => true,
		isFIFO: (): boolean => true,
		isFile: (): boolean => !isDir,
		isSocket: (): boolean => true,
		isSymbolicLink: (): boolean => true,
	};
};

describe('electron/archiveService', () => {
	const imagesPath = path.join('tmp', 'somerandom', 'path');
	const settings = mSettings({
		imagesFolderPath: imagesPath,
	});
	const service = getArchiveService(settings);

	describe('archiveImages', () => {
		it('Returns true on success and creates correct streams', async () => {
			// given
			const targetPath = '/some/random/path.tar';
			const dirent: Dirent = mDirent(false, 'somerandomname');
			const tarReadable = new Readable();
			const writableStream = new actualFs.createWriteStream('somepath', {});
			mockedFs.readdirSync.mockReturnValueOnce([dirent]);
			mockedFs.statSync.mockReturnValue(({ size: 123 } as unknown) as fs.Stats);
			mockedTar.c.mockReturnValueOnce((tarReadable as unknown) as void);
			mockedFs.createWriteStream.mockReturnValueOnce(writableStream);
			(mockedStream.pipeline as unknown) = jest.fn().mockImplementation((_, __, cb) => {
				cb();
			});

			// when
			const result = await service.archiveImages(targetPath);

			// then
			expect(await result).toBe(true);
			expect(mockedFs.createWriteStream).toHaveBeenCalledWith(targetPath, {});
			expect(mockedTar.c).toHaveBeenCalledWith({ portable: true, gzip: false, cwd: imagesPath }, ['']);
		});
		it('Rejects with error from pipeline', async () => {
			// given
			const error = { message: 'Random error obj', name: 'someerr' };
			const targetPath = '/some/random/path.tar';
			const dirent: Dirent = mDirent(false, 'somerandomname');
			const tarReadable = new Readable();
			const writableStream = new actualFs.createWriteStream('somepath', {});
			mockedFs.readdirSync.mockReturnValueOnce([dirent]);
			mockedFs.statSync.mockReturnValue(({ size: 123 } as unknown) as fs.Stats);
			mockedTar.c.mockReturnValueOnce((tarReadable as unknown) as void);
			mockedFs.createWriteStream.mockReturnValueOnce(writableStream);
			(mockedStream.pipeline as unknown) = jest.fn().mockImplementation((_, __, cb) => {
				cb(error);
			});

			// when

			// then
			await expect(service.archiveImages(targetPath)).rejects.toMatchObject(error);
		});
	});
	describe('extractImages', () => {
		it('Returns true on success and creates correct streams', async () => {
			//given
			const sourcePath = '/tmp/source/path.tar';
			const size = 1000;
			mockedFs.statSync.mockReturnValueOnce(({ size } as unknown) as fs.Stats);
			mockedTar.x.mockResolvedValueOnce((Promise.resolve() as unknown) as never);

			// when
			const result = await service.extractImages(sourcePath);

			// then
			expect(result).toBe(true);
			expect(mockedTar.x.mock.calls).toContainEqual([{ keep: false, file: sourcePath, C: imagesPath, onentry: expect.anything() }]);
			expect(mockedFs.statSync).toHaveBeenCalledWith(sourcePath);
		});
		it('Rejects with error from pipeline', async () => {
			//given
			const error = { name: 'some error msg', message: 'some error message' };
			const sourcePath = '/tmp/source/path.tar';
			const size = 1000;
			mockedFs.statSync.mockReturnValueOnce(({ size } as unknown) as fs.Stats);
			mockedTar.x.mockRejectedValue((error as unknown) as never);

			// when

			// then
			await expect(service.extractImages(sourcePath)).rejects.toMatchObject(error);
		});
	});
});
