/* eslint-disable @typescript-eslint/no-var-requires */
import { IpcChannels, SavePostDto } from '../src/types/processDto';
import { contextBridge, ipcRenderer } from 'electron';
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
});
contextBridge.exposeInMainWorld('log', log.functions);
