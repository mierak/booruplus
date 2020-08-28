/* eslint-disable @typescript-eslint/no-var-requires */
import { IpcChannels, SavePostDto } from '../src/types/processDto';
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { Post } from '../src/types/gelbooruTypes';
import log from 'electron-log';

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
