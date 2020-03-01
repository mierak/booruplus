import { app, BrowserWindow, ipcMain } from 'electron';
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.

if (require('electron-squirrel-startup')) {
	// eslint-disable-line global-require

	app.quit();
}

const createWindow = (): void => {
	// Create the browser window.

	const mainWindow = new BrowserWindow({
		width: 1600,
		height: 900,
		webPreferences: {
			webSecurity: false,
			contextIsolation: true,
			preload: __dirname + '/preload.js'
		}
	});

	// and load the index.html of the app.

	mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

	// Open the DevTools.

	mainWindow.webContents.openDevTools();
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
ipcMain.on('toMain', (event, args) => {
	console.log(args);
	ipcMain.emit('fromMain', 'from Main data');
});
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
	win.loadURL('https://google.com');
});
