import { clipboard, contextBridge, ipcRenderer } from 'electron';
import log from 'electron-log';

const api: typeof window.api = {
	send: (channel, ...data) => {
		ipcRenderer.send(channel, ...data);
	},
	invoke: (channel, ...data) => {
		return ipcRenderer.invoke(channel, ...data);
	},
	on: (channel, listener): void => {
		log.debug('Added listener for channel', channel);
		ipcRenderer.on(channel, listener);
	},
	removeListener: (channel, listener) => {
		log.debug('Removed listener for channel', channel);
		ipcRenderer.removeListener(channel, listener);
	},
};

contextBridge.exposeInMainWorld('api', api);
contextBridge.exposeInMainWorld('log', log.functions);
contextBridge.exposeInMainWorld('clipboard', clipboard);
