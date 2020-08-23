import { app, dialog, BrowserWindow, ipcMain, IpcMainInvokeEvent, IpcMainEvent, MessageBoxOptions, shell } from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer';
import fs from 'fs';
import zlib from 'zlib';
import moment from 'moment';
import log from 'electron-log';
import fetch from 'node-fetch';

import { Settings } from '../src/store/types';
import { SavePostDto, IpcChannels, ExportDataDto, SaveThumbnailDto } from '../src/types/processDto';
import { getFileService, FileService } from './fileService';
import { Post } from '../src/types/gelbooruTypes';

import path from 'path';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
const isProd = app.isPackaged;

log.transports.console.useStyles = true;
log.transports.console.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{processType}] [{level}] - {text}';
log.catchErrors({ showDialog: true });

log.debug(`Starting app. Production mode is: ${isProd}`);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.

if (require('electron-squirrel-startup')) {
	app.quit();
}
let window: BrowserWindow;

app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');

const createWindow = (): BrowserWindow => {
	// Create the browser window.
	log.debug('Creating main window');
	const mainWindow = new BrowserWindow({
		width: 1600,
		height: 900,
		webPreferences: {
			webSecurity: false,
			contextIsolation: true,
			preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
		},
		show: false,
	});
	// and load the index.html of the app.

	mainWindow.setMenuBarVisibility(false);
	log.debug('Loading page...');
	mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
	window = mainWindow;
	return window;
};

const createSplashScreen = (): BrowserWindow => {
	const splashScreen = new BrowserWindow({
		width: 640,
		height: 360,
		darkTheme: true,
		frame: false,
		resizable: false,
		autoHideMenuBar: true,
	});

	splashScreen.loadURL(path.resolve(__dirname, './splash_screen.html'));
	return splashScreen;
};

app.on('ready', () => {
	const splashScreen = createSplashScreen();
	splashScreen.webContents.once('did-finish-load', () => {
		const win = createWindow();
		win.once('ready-to-show', () => {
			splashScreen.destroy();
			window.show();
			log.debug('Showing main window');
		});
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.whenReady().then(() => {
	if (!isProd) {
		log.debug('Installing dev extensions');
		installExtension([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS])
			.then((name) => log.debug(`Added Extension:  ${name}`))
			.catch((err) => log.error('An error occurred: ', err));
	}
});

let settings: Settings;
let fileService: FileService;

ipcMain.on(IpcChannels.SETTINGS_LOADED, (_: IpcMainEvent, value: Settings) => {
	settings = value;
	fileService = getFileService(value);
});

ipcMain.on(IpcChannels.THEME_CHANGED, async () => {
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
});

ipcMain.on(IpcChannels.OPEN_IN_BROWSER, (_: IpcMainEvent, value: string) => {
	shell.openExternal(value);
});

ipcMain.on(IpcChannels.OPEN_PATH, (_: IpcMainEvent, value: string) => {
	shell.openPath(value);
});

ipcMain.handle(IpcChannels.SAVE_IMAGE, async (_: IpcMainInvokeEvent, dto: SavePostDto) => {
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
});

ipcMain.handle(IpcChannels.SAVE_THUMBNAIL, async (_: IpcMainInvokeEvent, dto: SaveThumbnailDto) => {
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
});

ipcMain.handle(IpcChannels.LOAD_IMAGE, async (_: IpcMainInvokeEvent, post: Post) => {
	return fileService.loadImage(post);
});

ipcMain.handle(IpcChannels.LOAD_THUMBNAIL, async (_: IpcMainInvokeEvent, post: Post) => {
	return fileService.loadThumbnail(post);
});

ipcMain.handle(IpcChannels.DELETE_IMAGE, async (_: IpcMainInvokeEvent, post: Post) => {
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
});

ipcMain.handle(IpcChannels.OPEN_SELECT_IMAGES_FOLDER_DIALOG, async () => {
	const result = await dialog.showOpenDialog(window, { properties: ['openDirectory', 'createDirectory'] });
	if (!result.canceled) {
		settings.imagesFolderPath = result.filePaths[0];
	}
	return result;
});

ipcMain.handle(IpcChannels.OPEN_SELECT_FOLDER_DIALOG, async () => {
	const result = await dialog.showOpenDialog(window, { properties: ['openDirectory', 'createDirectory'] });
	if (!result.canceled) {
		return result.filePaths[0];
	}
	return '';
});

ipcMain.handle(IpcChannels.OPEN_SELECT_EXPORTED_DATA_FILE_DIALOG, async () => {
	log.debug('Opening select exported data file dialog.');
	const dialogResult = await dialog.showSaveDialog(window, {
		properties: ['createDirectory', 'showOverwriteConfirmation', 'dontAddToRecent'],
		filters: [{ name: 'Lolinizer backup', extensions: ['lbak'] }],
		defaultPath: `lolinizer_export_${moment().format('YYYYMMDDHHmmss')}`,
	});
	const filePath = dialogResult.filePath;
	if (!dialogResult.canceled && filePath) {
		log.debug(`Selected file: ${filePath}`);
		return filePath;
	} else {
		log.debug('Select exported data file dialog canceled.');
		return '';
	}
});

ipcMain.on(IpcChannels.SAVE_EXPORTED_DATA, async (_, data: ExportDataDto) => {
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
});

ipcMain.handle(IpcChannels.OPEN_IMPORT_DATA_DIALOG, async () => {
	log.debug('Opening import data dialog.');
	const dialogResult = await dialog.showOpenDialog(window, {
		filters: [{ name: 'Lolinizer backup', extensions: ['lbak'] }],
		properties: ['dontAddToRecent', 'openFile'],
	});

	if (!dialogResult.canceled && dialogResult.filePaths.length > 0) {
		log.debug(`Reading file: ${dialogResult.filePaths[0]}`);
		const compressed = await fs.promises.readFile(dialogResult.filePaths[0]);
		return new Promise((resolve, reject) => {
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
});

ipcMain.on(IpcChannels.EXPORT_POSTS, async (_, params: { posts: Post[]; path: string }) => {
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
});

ipcMain.handle(IpcChannels.GET_PICTURES_PATH, async () => {
	return path.join(app.getPath('pictures'), 'lolinizer');
});
