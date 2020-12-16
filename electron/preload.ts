import { clipboard, contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import log from 'electron-log';

import { IpcChannels, SavePostDto } from '@appTypes/processDto';
import { Post } from '@appTypes/gelbooruTypes';

contextBridge.exposeInMainWorld('api', {
	send: <T>(channel: IpcChannels, data: T) => {
		ipcRenderer.send(channel, data);
	},
	invoke: (channel: IpcChannels, data: Post | SavePostDto) => {
		try {
			return ipcRenderer.invoke(channel, data);
		} catch (err) {
			log.error('invoke error', err);
		}
	},
	on: (channel: IpcChannels, listener: (event: IpcRendererEvent, ...args: unknown[]) => void): void => {
		log.debug('Added listener for channel', channel);
		ipcRenderer.on(channel, listener);
	},
	removeListener: (channel: IpcChannels, listener: (event: IpcRendererEvent, ...args: unknown[]) => void) => {
		log.debug('Removed listener for channel', channel);
		ipcRenderer.removeListener(channel, listener);
	},
});
contextBridge.exposeInMainWorld('log', log.functions);
contextBridge.exposeInMainWorld('clipboard', clipboard);