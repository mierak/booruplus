import { app, BrowserWindow, dialog, ipcMain, MessageBoxOptions, SaveDialogSyncOptions, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import zlib from 'zlib';
import log from 'electron-log';
import moment from 'moment';
import fetch from 'node-fetch';

import { ArchiveService, getArchiveService } from './archiveService';
import { FileService, getFileService } from './fileService';

import {
	ExportDataDto,
	IpcInvokeHandlers,
	IpcListenerResponse,
	IpcListeners,
	IpcSendHandlers,
} from '../src/types/processDto';
import { Settings } from '../src/store/types';

export const initIpcHandlers = (window: BrowserWindow): void => {
	const notifyIpcListener = <C extends IpcListeners>(response: IpcListenerResponse<C>): void => {
		window.webContents.send(response.channel, response.params);
	};

	let settings: Settings;
	let fileService: FileService;
	let archiveService: ArchiveService;

	const sendHandlers: IpcSendHandlers = {
		SETTINGS_CHANGED: (_, value) => {
			log.debug('Settings changed. Recreating services.');
			log.debug(value);
			settings = value;
			fileService = getFileService(value);
			archiveService = getArchiveService(value);
		},
		EXPORT_POSTS: (_, params) => {
			log.debug(`Peparing to export ${params.posts.length} posts`);
			let foundPosts = 0;
			let notFoundPosts = 0;
			try {
				params.posts.forEach((post) => {
					const imagePath = `${settings.imagesFolderPath}/${post.directory}/${post.image}`;
					fs.exists(imagePath, async (exists) => {
						if (exists) {
							foundPosts++;
							fs.copyFile(imagePath, `${params.path}\\${post.image}`, (err) => {
								err && log.error(`Could not copy file from ${imagePath} to ${params.path}`, err);
							});
						} else {
							notFoundPosts++;
							const response = await fetch(post.fileUrl);
							if (response.ok) {
								const arrayBuffer = await response.arrayBuffer();
								fs.promises.writeFile(`${params.path}\\${post.image}`, Buffer.from(arrayBuffer), 'binary');
							} else {
								log.error(`Could not download post with url ${post.fileUrl}`, response.statusText);
							}
						}
					});
				});
				log.debug(`Copied ${foundPosts} already downloaded posts and downloaded additional ${notFoundPosts} posts`);
			} catch (err) {
				log.error('Unexpected error occured while exporting images to disk', err);
				dialog.showErrorBox('Unexpected error occured while exporting images to disk', err.message);
			}
		},
		OPEN_IN_BROWSER: (_, value) => {
			shell.openExternal(value);
		},
		OPEN_PATH: (_, value) => {
			shell.openPath(value);
		},
		THEME_CHANGED: async () => {
			const options: MessageBoxOptions = {
				message: 'Changing theme requires application restart. Would you like to restart now?',
				buttons: ['Ok', 'Cancel'],
				title: 'Restart required',
			};
			const result = await dialog.showMessageBox(window, options);
			if (result.response === 0) {
				app.relaunch();
				app.quit();
			}
		},
	};

	const invokeHandlers: IpcInvokeHandlers = {
		SAVE_IMAGE: async (_, dto) => {
			if (!dto.data) {
				const msg = 'No image data supplied.';
				log.error(msg);
				return Promise.reject(msg);
			}
			if (!dto.thumbnailData) {
				const msg = 'No thumbnail data supplied.';
				log.error(msg);
				return Promise.reject(msg);
			}

			await fileService.createImageDirIfNotExists(dto.post);
			const postSaved = await fileService.saveImage(dto.post, dto.data);

			await fileService.createThumbnailDirIfNotExists(dto.post);
			const thumbnailSaved = await fileService.saveThumbnail(dto.post, dto.thumbnailData);

			if (!thumbnailSaved || !postSaved) {
				return Promise.reject(`Could not save image or its thumbnail. Post id ${dto.post.id}`);
			}

			log.debug(`ipcMain: image-saved | id: ${dto.post.id} to <images-path>/${dto.post.directory}`);
			return Promise.resolve();
		},
		SAVE_THUMBNAIL: async (_, dto) => {
			if (!dto.data) {
				const msg = 'No thumbnail data supplied.';
				log.error(msg);
				return Promise.reject(msg);
			}

			await fileService.createThumbnailDirIfNotExists(dto.post);
			const thumbnailSaved = await fileService.saveThumbnail(dto.post, dto.data);

			if (!thumbnailSaved) {
				return Promise.reject(`Could not save image or its thumbnail. Post id ${dto.post.id}`);
			}

			log.debug(`ipcMain: thumbnail-saved | id: ${dto.post.id} to <thumbnails-path>/${dto.post.directory}`);
			return Promise.resolve();
		},
		LOAD_IMAGE: async (_, post) => {
			return fileService.loadImage(post);
		},
		LOAD_THUMBNAIL: async (_, post) => {
			return fileService.loadThumbnail(post);
		},
		DELETE_IMAGE: async (_, post) => {
			await fileService.deleteImage(post);
			await fileService.deleteThumbnail(post);

			const imageDeleted = await fileService.deletePostDirectoryIfEmpty(post);
			const thumbnailDeleted = await fileService.deleteThumbnailDirectoryIfEmpty(post);

			if (!imageDeleted || !thumbnailDeleted) {
				return Promise.reject(
					`Either image or thumbnail of Post id ${post.id} could not be deleted. Image deleted: ${imageDeleted}. Thumbnail deleted: ${thumbnailDeleted}.`
				);
			}

			return Promise.resolve();
		},
		OPEN_SELECT_IMAGES_FOLDER_DIALOG: async () => {
			const result = await dialog.showOpenDialog(window, { properties: ['openDirectory', 'createDirectory'] });
			if (!result.canceled) {
				settings.imagesFolderPath = result.filePaths[0];
			}
			return result;
		},
		OPEN_SELECT_FOLDER_DIALOG: async () => {
			const result = await dialog.showOpenDialog(window, { properties: ['openDirectory', 'createDirectory'] });
			if (!result.canceled) {
				return result.filePaths[0];
			}
			return '';
		},
		OPEN_SELECT_EXPORT_FILE_LOCATION_DIALOG: async (_, type) => {
			log.debug(`Opening select export file location dialog for [${type}]`);

			let options: SaveDialogSyncOptions;
			if (type === 'data') {
				options = {
					properties: ['createDirectory', 'showOverwriteConfirmation', 'dontAddToRecent'],
					filters: [{ name: 'Lolinizer backup', extensions: ['lbak'] }],
					defaultPath: `lolinizer_export_${moment().format('YYYYMMDDHHmmss')}`,
				};
			} else {
				options = {
					properties: ['createDirectory', 'showOverwriteConfirmation', 'dontAddToRecent'],
					filters: [{ name: 'Lolinizer backup images', extensions: ['tar'] }],
					defaultPath: `lolinizer_images_export_${moment().format('YYYYMMDDHHmmss')}`,
				};
			}

			const dialogResult = await dialog.showSaveDialog(window, options);
			const filePath = dialogResult.filePath;
			if (!dialogResult.canceled && filePath) {
				log.debug(`Selected file: ${filePath}`);
				return filePath;
			} else {
				log.debug('Select exported data file dialog canceled.');
				return '';
			}
		},
		SAVE_EXPORTED_DATA: async (_, data: ExportDataDto) => {
			log.debug('Compressing exported data.');
			zlib.brotliCompress(
				data.data,
				{
					params: {
						[zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
						[zlib.constants.BROTLI_PARAM_QUALITY]: 4,
					},
				},
				(err, result) => {
					if (err) {
						log.error('Could not compress exported data.', err.name, err.message, err.stack);
						dialog.showErrorBox('Could not compress exported data.', err.message);
					} else {
						log.debug(`Data compressed. Writing file ${data.filePath}`);
						fs.writeFile(data.filePath, result, (err) => {
							if (err) {
								log.error('Could not write file.', err.name, err.message, err.stack);
								dialog.showErrorBox('Could not save exported data.', err.message);
							} else {
								log.info(`Exported data succesfully saved to ${data.filePath}.`);
							}
						});
					}
				}
			);
			return Promise.resolve();
		},
		EXPORT_IMAGES: async (_, path: string) => {
			return archiveService.archiveImages(path, (done: number, total: number): void => {
				notifyIpcListener({ channel: IpcListeners.EXPORT_PROGRESS, params: { done, total } });
			});
		},
		IMPORT_IMAGES: async () => {
			log.debug('Opening import data dialog.');
			const dialogResult = await dialog.showOpenDialog(window, {
				filters: [{ name: 'Lolinizer images backup', extensions: ['tar'] }],
				properties: ['dontAddToRecent', 'openFile'],
			});

			if (!dialogResult.canceled && dialogResult.filePaths.length > 0) {
				log.debug(`Decompressing file: ${dialogResult.filePaths[0]}`);
				return archiveService.extractImages(dialogResult.filePaths[0], (done: number, total: number): void => {
					notifyIpcListener({ channel: IpcListeners.IMPORT_PROGRESS, params: { done, total } });
				});
			}
		},
		OPEN_IMPORT_DATA_DIALOG: async () => {
			log.debug('Opening import data dialog.');
			const dialogResult = await dialog.showOpenDialog(window, {
				filters: [{ name: 'Lolinizer backup', extensions: ['lbak'] }],
				properties: ['dontAddToRecent', 'openFile'],
			});

			if (!dialogResult.canceled && dialogResult.filePaths.length > 0) {
				log.debug(`Reading file: ${dialogResult.filePaths[0]}`);
				const compressed = await fs.promises.readFile(dialogResult.filePaths[0]);
				return new Promise<string>((resolve, reject) => {
					log.debug('Decompressing data to be imported.');
					zlib.brotliDecompress(compressed, (err, result) => {
						if (err) {
							log.error('Could not decompress exported data.', err.name, err.message, err.stack);
							dialog.showErrorBox('Could not decompress exported data', err.message);
							reject(err.message);
						} else {
							log.info('Data sucessfuly decompressed');
							resolve(result.toString());
						}
					});
				});
			} else {
				log.debug('Import data dialog canceled.');
				return '';
			}
		},
		GET_PICTURES_PATH: async () => {
			return path.join(app.getPath('pictures'), 'lolinizer');
		},
	};

	for (const [channel, handler] of Object.entries(sendHandlers)) {
		ipcMain.on(channel, handler);
	}

	for (const [channel, handler] of Object.entries(invokeHandlers)) {
		ipcMain.handle(channel, handler);
	}
};
