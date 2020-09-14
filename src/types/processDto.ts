import { Post } from './gelbooruTypes';

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
	data?: Blob;
	post: Post;
}

export interface SuccessfulLoadPostResponse {
	data: Blob;
	post: Post;
}

export enum IpcChannels {
	SAVE_IMAGE = 'SAVE_IMAGE',
	LOAD_IMAGE = 'LOAD_IMAGE',
	DELETE_IMAGE = 'DELETE_IMAGE',
	SETTINGS_CHANGED = 'SETTINGS_CHANGED',
	THEME_CHANGED = 'THEME_CHANGED',
	OPEN_IN_BROWSER = 'OPEN_IN_BROWSER',
	OPEN_PATH = 'OPEN_PATH',
	OPEN_SELECT_IMAGES_FOLDER_DIALOG = 'OPEN_SELECT_IMAGES_FOLDER_DIALOG',
	OPEN_SELECT_FOLDER_DIALOG = 'OPEN_SELECT_FOLDER_DIALOG',
	OPEN_SELECT_EXPORT_FILE_LOCATION_DIALOG = 'OPEN_SELECT_EXPORT_FILE_LOCATION_DIALOG',
	SAVE_EXPORTED_DATA = 'SAVE_EXPORTED_DATA',
	OPEN_IMPORT_DATA_DIALOG = 'OPEN_IMPORT_DATA_DIALOG',
	EXPORT_POSTS = 'EXPORT_POSTS',
	LOAD_THUMBNAIL = 'LOAD_THUMBNAIL',
	SAVE_THUMBNAIL = 'SAVE_THUMBNAIL',
	GET_PICTURES_PATH = 'GET_PICTURES_PATH',
	EXPORT_PROGRESS = 'EXPORT_PROGRESS',
	EXPORT_IMAGES = 'EXPORT_IMAGES',
	IMPORT_IMAGES = 'IMPORT_IMAGES',
	IMPORT_PROGRESS = 'IMPORT_PROGRESS',
}

export interface ExportDataDto {
	data: string;
	filePath: string;
}
