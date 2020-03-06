const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
	send: (channel, data) => {
		// whitelist channels
		const validChannels = ['toMain', 'createWindow', 'save-image', 'load-image'];
		if (validChannels.includes(channel)) {
			ipcRenderer.send(channel, data);
		}
	},
	on: (channel, func) => {
		const validChannels = ['fromMain', 'image-loaded', 'image-saved', 'error'];
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
	}
});
