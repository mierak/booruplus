import { clipboard, contextBridge, ipcRenderer } from 'electron';
import log from 'electron-log';

import { IpcSendChannels, IpcInvokeChannels, IpcListeners } from '@appTypes/processDto';

const configureLogger = async () => {
	log.transports.console.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{processType}] [{level}] - {text}';
	log.transports.file.maxSize = 5242880;
	log.transports.file.inspectOptions.maxArrayLength = 5;
	log.transports.file.inspectOptions.breakLength = Infinity;
	log.transports.console.level = (await ipcRenderer.invoke('is-prod')) ? 'error' : 'silly';
};

const ipcSendChannels = Object.keys(IpcSendChannels);
const ipcInvokeChannels = Object.keys(IpcInvokeChannels);
const ipcListeners = Object.keys(IpcListeners);

const api: typeof window.api = {
	send: (channel, ...data) => {
		if (ipcSendChannels.includes(channel)) {
			ipcRenderer.send(channel, ...data);
		}
	},
	invoke: (channel, ...data) => {
		if (ipcInvokeChannels.includes(channel)) {
			return ipcRenderer.invoke(channel, ...data);
		}
		return Promise.resolve();
	},
	on: (channel, listener): void => {
		if (ipcListeners.includes(channel)) {
			log.debug('Added listener for channel', channel);
			ipcRenderer.on(channel, listener);
		}
	},
	removeListener: (channel, listener) => {
		if (ipcListeners.includes(channel)) {
			log.debug('Removed listener for channel', channel);
			ipcRenderer.removeListener(channel, listener);
		}
	},
};

contextBridge.exposeInMainWorld('api', api);
contextBridge.exposeInMainWorld('log', log.functions);
contextBridge.exposeInMainWorld('clipboard', clipboard);

configureLogger();
