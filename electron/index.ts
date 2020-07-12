import { app, dialog, BrowserWindow, ipcMain, IpcMainInvokeEvent, IpcMainEvent, MessageBoxOptions, shell } from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer';
import fs from 'fs';
import zlib from 'zlib';
import moment from 'moment';
import log from 'electron-log';

import { Settings } from '../src/store/types';
import { SavePostDto, IpcChannels, ExportDataDto } from '../src/types/processDto';
import { Post } from '../src/types/gelbooruTypes';

import path from 'path';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
const isProd = app.isPackaged;

log.transports.console.useStyles = true;
log.transports.console.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{processType}] [{level}] {text}';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.

if (require('electron-squirrel-startup')) {
	// eslint-disable-line global-require

	app.quit();
}
let window: BrowserWindow;

if (!isProd) {
	installExtension(REACT_DEVELOPER_TOOLS)
		.then((name) => console.log(`Added Extension:  ${name}`))
		.catch((err) => console.log('An error occurred: ', err));

	installExtension(REDUX_DEVTOOLS)
		.then((name) => console.log(`Added Extension:  ${name}`))
		.catch((err) => console.log('An error occurred: ', err));
}

const createWindow = (): BrowserWindow => {
	// Create the browser window.

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

	if (!isProd) {
		mainWindow.webContents.openDevTools();
	} else {
		// mainWindow.removeMenu();
	}
	mainWindow.webContents.openDevTools();
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
		});
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
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
	shell.openItem(value);
});

ipcMain.handle(IpcChannels.SAVE_IMAGE, async (event: IpcMainInvokeEvent, dto: SavePostDto) => {
	if (dto.data) {
		await fs.promises.mkdir(`${settings.imagesFolderPath}/${dto.post.directory}`, { recursive: true }).catch((err) => {
			console.error(err);
			//TODO handle gracefully
			throw err;
		});
		await fs.promises
			.writeFile(`${settings.imagesFolderPath}/${dto.post.directory}/${dto.post.image}`, Buffer.from(dto.data), 'binary')
			.catch((err) => {
				console.error(err);
				//TODO handle gracefuly
				throw err;
			});
		console.log(`ipcMain: image-saved | id: ${dto.post.id}`);
		return dto.post;
	} else {
		throw 'No data to save supplied';
	}
});

ipcMain.handle(IpcChannels.LOAD_IMAGE, async (event: IpcMainInvokeEvent, post: Post) => {
	try {
		const data = fs.readFileSync(`${settings.imagesFolderPath}/${post.directory}/${post.image}`);
		console.log(`ipcMain: image-loaded | id: ${post.id}`);
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
		console.error('could not delete post image or directories', post.id);
		return false;
	}
});

ipcMain.handle(IpcChannels.OPEN_SELECT_FOLDER_DIALOG, async () => {
	const result = await dialog.showOpenDialog(window, { properties: ['openDirectory', 'createDirectory'] });
	if (!result.canceled) {
		settings.imagesFolderPath = result.filePaths[0];
	}
	return result;
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
