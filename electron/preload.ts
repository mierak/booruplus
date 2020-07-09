/* eslint-disable @typescript-eslint/no-var-requires */
import { IpcChannels, SavePostDto } from '../src/types/processDto';
import { contextBridge, ipcRenderer } from 'electron';
import { Post } from '../src/types/gelbooruTypes';

// eslint-disable-next-line no-undef
// const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
	send: <T>(channel: IpcChannels, data: T) => {
		ipcRenderer.send(channel, data);
	},
	invoke: <T>(channel: IpcChannels, data: Post | SavePostDto) => {
		try {
			return ipcRenderer.invoke(channel, data);
		} catch (err) {
			console.error('invoke error');
		}
	},
});
