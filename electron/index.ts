import { app, BrowserWindow } from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer';
import log from 'electron-log';

import path from 'path';
import { initIpcHandlers } from './ipcHandlers';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
const isProd = app.isPackaged;

log.transports.console.useStyles = true;
log.transports.console.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{processType}] [{level}] - {text}';
log.transports.file.maxSize = 5_242_880;
log.catchErrors({ showDialog: true });

log.debug(`Starting app. Production mode is: ${isProd}`);

if (require('electron-squirrel-startup')) {
	app.quit();
}

let window: BrowserWindow;

const lock = app.requestSingleInstanceLock();

if (!lock) {
	log.warn('Could not obtain single instance lock, trying to focus already running instance');
	app.quit();
} else {
	app.on('second-instance', () => {
		if (window && window.isMinimized()) {
			window.restore();
			window.focus();
		}
	});
}

app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');

const createWindow = (): BrowserWindow => {
	log.debug('Creating main window');
	const mainWindow = new BrowserWindow({
		width: 1600,
		height: 900,
		webPreferences: {
			webSecurity: false,
			contextIsolation: true,
			preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
		},
		title: `Lolinizer v${GLOBALS.VERSION}`,
		show: false,
	});

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
		initIpcHandlers(win);
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
