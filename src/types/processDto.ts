import { Settings } from '@store/types';
import { IpcMainEvent, IpcMainInvokeEvent } from 'electron';
import { Post } from './gelbooruTypes';

export enum IpcInvokeChannels {
	OPEN_IMPORT_DATA_DIALOG = 'OPEN_IMPORT_DATA_DIALOG',
	OPEN_SELECT_IMAGES_FOLDER_DIALOG = 'OPEN_SELECT_IMAGES_FOLDER_DIALOG',
	OPEN_SELECT_FOLDER_DIALOG = 'OPEN_SELECT_FOLDER_DIALOG',
	OPEN_SELECT_EXPORT_FILE_LOCATION_DIALOG = 'OPEN_SELECT_EXPORT_FILE_LOCATION_DIALOG',
	GET_PICTURES_PATH = 'GET_PICTURES_PATH',
	SAVE_EXPORTED_DATA = 'SAVE_EXPORTED_DATA',
	EXPORT_IMAGES = 'EXPORT_IMAGES',
	IMPORT_IMAGES = 'IMPORT_IMAGES',
	DELETE_IMAGE = 'DELETE_IMAGE',
	SAVE_IMAGE = 'SAVE_IMAGE',
	SAVE_THUMBNAIL = 'SAVE_THUMBNAIL',
	LOAD_IMAGE = 'LOAD_IMAGE',
	LOAD_THUMBNAIL = 'LOAD_THUMBNAIL',
}

export enum IpcSendChannels {
	SETTINGS_CHANGED = 'SETTINGS_CHANGED',
	THEME_CHANGED = 'THEME_CHANGED',
	OPEN_IN_BROWSER = 'OPEN_IN_BROWSER',
	OPEN_PATH = 'OPEN_PATH',
	EXPORT_POSTS = 'EXPORT_POSTS',
}

export enum IpcListeners {
	EXPORT_PROGRESS = 'EXPORT_PROGRESS',
	IMPORT_PROGRESS = 'IMPORT_PROGRESS',
}

interface IpcInvokeParam {
	[IpcInvokeChannels.SAVE_IMAGE]: SavePostDto;
	[IpcInvokeChannels.SAVE_THUMBNAIL]: SaveThumbnailDto;
	[IpcInvokeChannels.LOAD_IMAGE]: Post;
	[IpcInvokeChannels.LOAD_THUMBNAIL]: Post;
	[IpcInvokeChannels.DELETE_IMAGE]: Post;
	[IpcInvokeChannels.EXPORT_IMAGES]: string;
	[IpcInvokeChannels.OPEN_SELECT_EXPORT_FILE_LOCATION_DIALOG]: 'data' | 'images';
	[IpcInvokeChannels.OPEN_SELECT_FOLDER_DIALOG]: undefined;
	[IpcInvokeChannels.SAVE_EXPORTED_DATA]: { data: string; filePath: string };
	[IpcInvokeChannels.GET_PICTURES_PATH]: void;
	[IpcInvokeChannels.OPEN_IMPORT_DATA_DIALOG]: void;
	[IpcInvokeChannels.OPEN_SELECT_IMAGES_FOLDER_DIALOG]: void;
	[IpcInvokeChannels.IMPORT_IMAGES]: void;
}

interface IpcInvokeReturn {
	[IpcInvokeChannels.LOAD_IMAGE]: Promise<LoadPostResponse>;
	[IpcInvokeChannels.LOAD_THUMBNAIL]: Promise<LoadPostResponse>;
	[IpcInvokeChannels.OPEN_SELECT_IMAGES_FOLDER_DIALOG]: Promise<Electron.OpenDialogReturnValue>;
	[IpcInvokeChannels.GET_PICTURES_PATH]: Promise<string>;
	[IpcInvokeChannels.OPEN_IMPORT_DATA_DIALOG]: Promise<string>;
	[IpcInvokeChannels.OPEN_SELECT_FOLDER_DIALOG]: Promise<string>;
	[IpcInvokeChannels.OPEN_SELECT_EXPORT_FILE_LOCATION_DIALOG]: Promise<string>;
	[IpcInvokeChannels.EXPORT_IMAGES]: Promise<boolean>;
	[IpcInvokeChannels.SAVE_EXPORTED_DATA]: Promise<void>;
	[IpcInvokeChannels.IMPORT_IMAGES]: Promise<boolean | undefined>;
	[IpcInvokeChannels.DELETE_IMAGE]: Promise<void>;
	[IpcInvokeChannels.SAVE_IMAGE]: Promise<void>;
	[IpcInvokeChannels.SAVE_THUMBNAIL]: Promise<void>;
}

interface IpcSendParam {
	[IpcSendChannels.SETTINGS_CHANGED]: Settings;
	[IpcSendChannels.THEME_CHANGED]: undefined;
	[IpcSendChannels.OPEN_IN_BROWSER]: string;
	[IpcSendChannels.OPEN_PATH]: string;
	[IpcSendChannels.EXPORT_POSTS]: { path: string; posts: Post[] };
}

interface IpcListenersParam {
	[IpcListeners.EXPORT_PROGRESS]: { done: number; total: number };
	[IpcListeners.IMPORT_PROGRESS]: { done: number; total: number };
}

type IpcSendReturn = {
	[K in IpcSendChannels]: void;
};

export type IpcInvokeType = <K extends IpcInvokeChannels>(
	channel: K,
	...data: IpcInvokeParam[K] extends void ? [] : [IpcInvokeParam[K]]
) => IpcInvokeReturn[K];

export type IpcSendType = <K extends IpcSendChannels>(
	channel: K,
	...data: IpcSendParam[K] extends void ? [] : [IpcSendParam[K]]
) => IpcSendReturn[K];

export type IpcListenerType = <K extends IpcListeners>(
	channel: K,
	listener: (event: Electron.IpcRendererEvent, ...args: [IpcListenersParam[K]]) => void
) => void;

export type IpcSendHandlers = {
	[K in IpcSendChannels]: (event: IpcMainEvent, args: IpcSendParam[K]) => IpcSendReturn[K];
};

export type IpcInvokeHandlers = {
	[K in IpcInvokeChannels]: (event: IpcMainInvokeEvent, args: IpcInvokeParam[K]) => IpcInvokeReturn[K];
}

export interface IpcListenerResponse<K extends IpcListeners> {
	channel: K;
	params: IpcListenersParam[K];
}

export interface SavePostDto {
	data: ArrayBuffer;
	thumbnailData: ArrayBuffer;
	post: Post;
}

export interface SaveThumbnailDto {
	data: ArrayBuffer;
	post: Post;
}

export interface LoadPostResponse {
	data: Buffer | undefined;
	post: Post;
}

export interface SuccessfulLoadPostResponse {
	data: Blob;
	post: Post;
}
export interface ExportDataDto {
	data: string;
	filePath: string;
}
