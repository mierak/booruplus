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
		const validChannels = ['fromMain', 'image-loaded', 'image-load-fail', 'image-saved', 'error'];
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
		const validChannels = ['toMain', 'createWindow', 'save-image', 'load-image'];
		if (validChannels.includes(channel)) {
			try {
				return ipcRenderer.invoke(channel, data);
			} catch (err) {
				console.log('invoker error');
			}
		}
	}
});
