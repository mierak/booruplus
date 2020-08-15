import fs from 'fs';
import log from 'electron-log';

import { Settings } from '../src/store/types';
import { Post } from '../src/types/gelbooruTypes';

export interface FileService {
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
	const thumbnailsPath = `${settings.imagesFolderPath}/thumbnails`;
	const imagesPath = settings.imagesFolderPath;

	const deleteDirectoryIfEmpty = async (post: Post, isThumbnail: boolean): Promise<boolean> => {
		const dirs = post.directory.split('/');
		const firstDir = (isThumbnail ? thumbnailsPath : imagesPath).concat(`/${dirs[0]}/${dirs[1]}`);
		const secondDir = (isThumbnail ? thumbnailsPath : imagesPath).concat(`/${dirs[0]}`);

		const firstEmpty = fs.readdirSync(firstDir).length === 0;
		try {
			log.debug(`Directory ${firstDir} is ${firstEmpty ? 'empty' : 'not empty'}.`);

			if (firstEmpty) {
				log.debug('Deleting inner directory.');
				await fs.promises.rmdir(firstDir);
				const secondEmpty = fs.readdirSync(secondDir).length === 0;

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
		const dir = (isThumbnail ? thumbnailsPath : imagesPath).concat(`/${post.directory}`);

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
			const data = fs.readFileSync(`${imagesPath}/${post.directory}/${post.image}`);
			log.debug(`ipcMain: image-loaded | id: ${post.id}`);
			return { data: data, post };
		} catch (err) {
			return { data: undefined, post };
		}
	};

	const loadThumbnail = async (post: Post): Promise<{ data: Buffer | undefined; post: Post }> => {
		try {
			const data = fs.readFileSync(`${thumbnailsPath}/${post.directory}/${post.hash}.jpg`);
			return { data: data, post };
		} catch (err) {
			return { data: undefined, post };
		}
	};

	const saveImage = async (post: Post, data: ArrayBuffer): Promise<boolean> => {
		const postPath = `${imagesPath}/${post.directory}/${post.image}`;

		try {
			await fs.promises.writeFile(postPath, Buffer.from(Buffer.from(data)), 'binary');
			return true;
		} catch (err) {
			log.error('Error while saving image. Post id ', post.id, '. Rolling back changes.', err);
			return false;
		}
	};

	const saveThumbnail = async (post: Post, data: ArrayBuffer): Promise<boolean> => {
		const thumbnailPath = `${thumbnailsPath}/${post.directory}/${post.hash}.jpg`;

		try {
			await fs.promises.writeFile(thumbnailPath, Buffer.from(data), 'binary');
			return true;
		} catch (err) {
			log.error('Error while saving thumbnail. Post id ', post.id, '. Rolling back changes.', err);
			return false;
		}
	};

	const deleteImage = async (post: Post): Promise<void> => {
		const postPath = `${imagesPath}/${post.directory}/${post.image}`;
		log.debug(`Deleting image. Post id: ${post.id}. ${postPath}`);

		await fs.promises.unlink(postPath);
	};

	const deleteThumbnail = async (post: Post): Promise<void> => {
		const thumbnailPath = `${thumbnailsPath}/${post.directory}/${post.hash}.jpg`;
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
