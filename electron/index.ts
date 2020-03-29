import { app, dialog, BrowserWindow, ipcMain, IpcMainInvokeEvent, IpcMainEvent, MessageBoxOptions } from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer';
import fs from 'fs';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

import { Settings } from '../store/types';
import { SavePostDto } from '../types/processDto';
import { Post } from '../types/gelbooruTypes';
import { prefixDataWithContentType, getImageExtensionFromFilename } from '../util/utils';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.

if (require('electron-squirrel-startup')) {
	// eslint-disable-line global-require

	app.quit();
}

let window: BrowserWindow;

const createWindow = (): void => {
	installExtension(REACT_DEVELOPER_TOOLS)
		.then((name) => console.log(`Added Extension:  ${name}`))
		.catch((err) => console.log('An error occurred: ', err));

	installExtension(REDUX_DEVTOOLS)
		.then((name) => console.log(`Added Extension:  ${name}`))
		.catch((err) => console.log('An error occurred: ', err));
	// Create the browser window.

	const mainWindow = new BrowserWindow({
		width: 1600,
		height: 900,
		webPreferences: {
			webSecurity: false,
			contextIsolation: true,
			preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
		}
	});

	// and load the index.html of the app.

	// mainWindow.removeMenu();
	mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

	// Open the DevTools.

	mainWindow.webContents.openDevTools();
	window = mainWindow;
};

// This method will be called when Electron has finished

// initialization and is ready to create browser windows.

// Some APIs can only be used after this event occurs.

app.on('ready', createWindow);

// Quit when all windows are closed.

app.on('window-all-closed', () => {
	// On OS X it is common for applications and their menu bar

	// to stay active until the user quits explicitly with Cmd + Q

	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	// On OS X it's common to re-create a window in the app when the

	// dock icon is clicked and there are no other windows open.

	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

// In this file you can include the rest of your app's specific main process

// code. You can also put them in separate files and import them here.
ipcMain.on('createWindow', (event, args) => {
	const win = new BrowserWindow({
		height: 600,

		width: 800,
		webPreferences: {
			webSecurity: false,
			contextIsolation: true,
			preload: __dirname + '/preload.js'
		}
	});
});

let settings: Settings;

ipcMain.on('settings-loaded', (event: IpcMainEvent, value: Settings) => {
	settings = value;
});

ipcMain.on('theme-changed', async () => {
	const options: MessageBoxOptions = {
		message: 'Changing theme requires application restart. Would you like to restart now?',
		buttons: ['Ok', 'Cancel'],
		title: 'Restart required'
	};
	const result = await dialog.showMessageBox(window, options);
	if (result.response === 0) {
		app.relaunch();
		app.quit();
	}
});

ipcMain.handle('save-image', async (event: IpcMainInvokeEvent, dto: SavePostDto) => {
	if (dto.data) {
		const data = dto.data.split(';base64,').pop();
		await fs.promises.mkdir(`${settings.imagesFolderPath}/${dto.post.directory}`, { recursive: true }).catch((err) => {
			console.error(err);
			//TODO handle gracefully
			throw err;
		});
		await fs.promises
			.writeFile(`${settings.imagesFolderPath}/${dto.post.directory}/${dto.post.image}`, data, { encoding: 'base64' })
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

ipcMain.handle('load-image', async (event: IpcMainInvokeEvent, post: Post) => {
	try {
		const data = fs.readFileSync(`${settings.imagesFolderPath}/${post.directory}/${post.image}`, { encoding: 'base64' });
		const extension = getImageExtensionFromFilename(post.image);
		const dataUri = prefixDataWithContentType(data, extension);
		console.log(`ipcMain: image-loaded | id: ${post.id}`);
		return { data: dataUri, post };
	} catch (err) {
		return { data: undefined, post };
	}
});

ipcMain.handle('delete-image', async (event: IpcMainInvokeEvent, post: Post) => {
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

ipcMain.handle('open-select-directory-dialog', async () => {
	const result = await dialog.showOpenDialog(window, { properties: ['openDirectory', 'createDirectory'] });
	if (!result.canceled) {
		settings.imagesFolderPath = result.filePaths[0];
	}
	return result;
});
