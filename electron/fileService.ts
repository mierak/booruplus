import fs from 'fs';
import log from 'electron-log';

import { Settings } from '@store/types';
import { Post } from '@appTypes/gelbooruTypes';
import { getPathProvider } from '../src/service/pathProviderService';

export type FileService = {
	loadImage: (post: Post) => Promise<{ data: Buffer | undefined; post: Post }>;
	loadThumbnail: (post: Post) => Promise<{ data: Buffer | undefined; post: Post }>;
	saveImage: (post: Post, data: ArrayBuffer) => Promise<boolean>;
	saveThumbnail: (post: Post, data: ArrayBuffer) => Promise<boolean>;
	deleteImage: (post: Post) => Promise<void>;
	deleteThumbnail: (post: Post) => Promise<void>;
	createImageDirIfNotExists: (post: Post) => Promise<boolean>;
	createThumbnailDirIfNotExists: (post: Post) => Promise<boolean>;
	deletePostDirectoryIfEmpty: (post: Post) => Promise<boolean>;
	deleteThumbnailDirectoryIfEmpty: (post: Post) => Promise<boolean>;
}

export const getFileService = (settings: Settings): FileService => {
	const pathProvider = getPathProvider(settings.imagesFolderPath);

	const deleteDirectoryIfEmpty = async (post: Post, isThumbnail: boolean): Promise<boolean> => {
		const [firstDir, secondDir] = isThumbnail ? pathProvider.getThumbnailDirsPaths(post) : pathProvider.getImageDirsPaths(post);

		try {
			const firstEmpty = (await fs.promises.readdir(firstDir)).length === 0;
			log.debug(`Directory ${firstDir} is ${firstEmpty ? 'empty' : 'not empty'}.`);

			if (firstEmpty) {
				log.debug('Deleting inner directory.');
				await fs.promises.rmdir(firstDir);
				const secondEmpty = (await fs.promises.readdir(secondDir)).length === 0;

				log.debug(`Directory ${secondDir} is ${secondEmpty ? 'empty' : 'not empty'}.`);

				if (secondEmpty) {
					log.debug('Deleting outer directory.');
					await fs.promises.rmdir(secondDir);
				}
			}
			return true;
		} catch (err) {
			log.error(`Could not delete ${isThumbnail ? 'thumbnail' : 'image'} directory. Post id: ${post.id}`, err);
			return false;
		}
	};

	const createDirIfNotExists = async (post: Post, isThumbnail: boolean): Promise<boolean> => {
		const dir = isThumbnail ? pathProvider.getThumbnailDirPath(post) : pathProvider.getImageDirPath(post);

		try {
			let created = true;
			await fs.promises.mkdir(dir, { recursive: true }).catch((err) => {
				if (err.code !== 'EEXIST') {
					throw err; //Dont throw if dir already exists
				} else {
					created = false;
				}
			});
			created && log.debug('Created directory', dir);
			return created;
		} catch (err) {
			log.error(`Error while trying to create ${isThumbnail ? 'thumbnail' : 'image'} directory. <dir>/${post.directory}`, err);
			return false;
		}
	};

	const loadImage = async (post: Post): Promise<{ data: Buffer | undefined; post: Post }> => {
		try {
			const data = fs.readFileSync(pathProvider.getImagePath(post));
			log.debug(`ipcMain: image-loaded | id: ${post.id}`);
			return { data, post };
		} catch (err) {
			log.error('Could not load image.', pathProvider.getImagePath(post), err);
			return { data: undefined, post };
		}
	};

	const loadThumbnail = async (post: Post): Promise<{ data: Buffer | undefined; post: Post }> => {
		try {
			const data = fs.readFileSync(pathProvider.getThumbnailPath(post));
			return { data, post };
		} catch (err) {
			log.error('Could not load thumbnail. Post id', post.id, err);
			return { data: undefined, post };
		}
	};

	const saveImage = async (post: Post, data: ArrayBuffer): Promise<boolean> => {
		try {
			await fs.promises.writeFile(pathProvider.getImagePath(post), Buffer.from(data), 'binary');
			return true;
		} catch (err) {
			log.error('Error while saving image. Post id ', post.id, err);
			return false;
		}
	};

	const saveThumbnail = async (post: Post, data: ArrayBuffer): Promise<boolean> => {
		try {
			await fs.promises.writeFile(pathProvider.getThumbnailPath(post), Buffer.from(data), 'binary');
			return true;
		} catch (err) {
			log.error('Error while saving thumbnail. Post id ', post.id, err);
			return false;
		}
	};

	const deleteImage = async (post: Post): Promise<void> => {
		const postPath = pathProvider.getImagePath(post);
		log.debug(`Deleting image. Post id: ${post.id}. ${postPath}`);

		await fs.promises.unlink(postPath);
	};

	const deleteThumbnail = async (post: Post): Promise<void> => {
		const thumbnailPath = pathProvider.getThumbnailPath(post);
		log.debug(`Deleting thumbnail. Post id: ${post.id}. ${thumbnailPath}`);

		await fs.promises.unlink(thumbnailPath);
	};

	const createImageDirIfNotExists = async (post: Post): Promise<boolean> => {
		return createDirIfNotExists(post, false);
	};

	const createThumbnailDirIfNotExists = async (post: Post): Promise<boolean> => {
		return createDirIfNotExists(post, true);
	};

	const deletePostDirectoryIfEmpty = async (post: Post): Promise<boolean> => {
		return deleteDirectoryIfEmpty(post, false);
	};
	const deleteThumbnailDirectoryIfEmpty = async (post: Post): Promise<boolean> => {
		return deleteDirectoryIfEmpty(post, true);
	};

	return {
		loadImage,
		loadThumbnail,
		saveImage,
		saveThumbnail,
		deleteImage,
		deleteThumbnail,
		createImageDirIfNotExists,
		createThumbnailDirIfNotExists,
		deletePostDirectoryIfEmpty,
		deleteThumbnailDirectoryIfEmpty,
	};
};
