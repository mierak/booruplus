import { app, dialog, BrowserWindow, ipcMain, IpcMainInvokeEvent, IpcMainEvent, MessageBoxOptions, shell } from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer';
import fs from 'fs';
import zlib from 'zlib';
import moment from 'moment';
import log from 'electron-log';
import fetch from 'node-fetch';

import { Settings } from '../src/store/types';
import { SavePostDto, IpcChannels, ExportDataDto } from '../src/types/processDto';
import { Post } from '../src/types/gelbooruTypes';

import path from 'path';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
const isProd = app.isPackaged;

log.transports.console.useStyles = true;
log.transports.console.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{processType}] [{level}] - {text}';

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

ipcMain.on(IpcChannels.SETTINGS_LOADED, (event: IpcMainEvent, value: Settings) => {
	settings = value;
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

ipcMain.on(IpcChannels.OPEN_IN_BROWSER, (event: IpcMainEvent, value: string) => {
	shell.openExternal(value);
});

ipcMain.on(IpcChannels.OPEN_PATH, (event: IpcMainEvent, value: string) => {
	shell.openPath(value);
});

ipcMain.handle(IpcChannels.SAVE_IMAGE, async (event: IpcMainInvokeEvent, dto: SavePostDto) => {
	if (dto.data) {
		await fs.promises.mkdir(`${settings.imagesFolderPath}/${dto.post.directory}`, { recursive: true }).catch((err) => {
			log.error(err);
			//TODO handle gracefully
			throw err;
		});
		await fs.promises
			.writeFile(`${settings.imagesFolderPath}/${dto.post.directory}/${dto.post.image}`, Buffer.from(dto.data), 'binary')
			.catch((err) => {
				log.error(err);
				//TODO handle gracefuly
				throw err;
			});
		log.debug(`ipcMain: image-saved | id: ${dto.post.id}`);
		return dto.post;
	} else {
		throw 'No data to save supplied';
	}
});

ipcMain.handle(IpcChannels.LOAD_IMAGE, async (event: IpcMainInvokeEvent, post: Post) => {
	try {
		const data = fs.readFileSync(`${settings.imagesFolderPath}/${post.directory}/${post.image}`);
		log.debug(`ipcMain: image-loaded | id: ${post.id}`);
		return { data: data, post };
	} catch (err) {
		return { data: undefined, post };
	}
});

ipcMain.handle(IpcChannels.DELETE_IMAGE, async (event: IpcMainInvokeEvent, post: Post) => {
	try {
		fs.unlinkSync(`${settings.imagesFolderPath}/${post.directory}/${post.image}`);
		const dirs = post.directory.split('/');
		fs.rmdirSync(`${settings.imagesFolderPath}/${dirs[0]}/${dirs[1]}`);
		fs.rmdirSync(`${settings.imagesFolderPath}/${dirs[0]}`);
		return true;
	} catch (err) {
		log.error('could not delete post image or directories', `post id: ${post.id}`, err);
		return false;
	}
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
