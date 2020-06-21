/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line no-undef
const { contextBridge, ipcRenderer } = require('electron');

//TODO extract valid channels to enum
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
	send: (channel, data) => {
		// whitelist channels
		const validChannels = [
			'toMain',
			'createWindow',
			'save-image',
			'load-image',
			'settings-loaded',
			'theme-changed',
			'open-in-browser',
			'open-path',
		];
		if (validChannels.includes(channel)) {
			ipcRenderer.send(channel, data);
		}
	},
	on: (channel, func) => {
		const validChannels = ['fromMain', 'image-loaded', 'image-load-fail', 'image-saved', 'error', 'open-in-browser', 'open-path'];
		if (validChannels.includes(channel)) {
			// Deliberately strip event as it includes `sender`
			ipcRenderer.on(channel, (event, ...args) => func(...args));
		}
	},
	removeListener: (channel, listener) => {
		ipcRenderer.removeListener(channel, listener);
	},
	removeAllListeners: (channel) => {
		ipcRenderer.removeAllListeners(channel);
	},
	invoke: (channel, data) => {
		const validChannels = ['toMain', 'createWindow', 'save-image', 'load-image', 'delete-image', 'open-select-directory-dialog'];
		if (validChannels.includes(channel)) {
			try {
				return ipcRenderer.invoke(channel, data);
			} catch (err) {
				console.error('invoke error');
			}
		}
	},
});
