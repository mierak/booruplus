import log from 'electron-log';
import fs from 'fs';
import path from 'path';
import tar from 'tar';
import { pipeline } from 'stream';

import { Settings } from '@store/types';

type onProgress = (done: number, total: number) => void;

export type ArchiveService = {
	archiveImages: (targetPath: string, onProgress?: onProgress) => Promise<boolean>;
	extractImages: (sourcePath: string, onProgress?: onProgress) => Promise<boolean>;
};

export const getArchiveService = (settings: Settings): ArchiveService => {
	const imagesPath = settings.imagesFolderPath;

	const getFolderSize = (dirPath: string): number => {
		let size = 0;
		const dir = fs.readdirSync(dirPath, { withFileTypes: true });
		dir.forEach((file) => {
			if (file.isDirectory()) {
				size += getFolderSize(path.join(dirPath, file.name));
			} else {
				size += fs.statSync(path.join(dirPath, file.name)).size;
			}
		});
		return size;
	};

	const archiveImages = (targetPath: string, onProgress?: onProgress): Promise<boolean> => {
		log.debug('Preparing to archive images');
		const totalSize = getFolderSize(imagesPath);
		log.debug('Total folder size is:', totalSize, 'Bytes');
		let bytesProcessed = 0;
		let lastPercent = 0;

		log.debug('cwd', imagesPath);
		const compressStream = tar.c(
			{
				portable: true,
				gzip: false,
				cwd: imagesPath,
			},
			['']
		);

		const outputStream = fs.createWriteStream(targetPath, {});

		compressStream.addListener('data', (chunk) => {
			bytesProcessed += chunk.length;
			const percent = Math.floor((bytesProcessed / totalSize) * 100);
			if (percent > lastPercent) {
				log.debug(`Done ${percent}%`);
				onProgress && onProgress(bytesProcessed, totalSize);
			}
			lastPercent = percent;
		});

		log.debug('Starting compression');
		return new Promise((resolve, reject) => {
			pipeline(compressStream, outputStream, (err) => {
				if (err) {
					log.error(err);
					reject(err);
				} else {
					resolve(true);
				}
			});
		});
	};

	const extractImages = (sourcePath: string, onProgress?: onProgress): Promise<boolean> => {
		log.debug('Preparing to extract images');
		const fileSize = fs.statSync(sourcePath).size;
		log.debug('Tarball size is:', fileSize, 'Bytes');
		let bytesProcessed = 0;
		let lastPercent = 0;

		log.debug('Starting extraction.');
		return new Promise((resolve, reject) => {
			tar
				.x({
					keep: false,
					file: sourcePath,
					C: imagesPath,
					onentry: (e) => {
						e.size && (bytesProcessed += e.size);
						const percent = Math.floor((bytesProcessed / fileSize) * 100);
						if (percent > lastPercent) {
							log.debug(`Done ${percent}%`);
							onProgress && onProgress(bytesProcessed, fileSize);
						}
						lastPercent = percent;
					},
				})
				.then(() => {
					resolve(true);
				})
				.catch((err) => {
					reject(err);
				});
		});
	};

	return { archiveImages, extractImages };
};
