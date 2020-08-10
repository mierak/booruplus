import { Post } from './gelbooruTypes';

export interface SavePostDto {
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
	SAVE_IMAGE = 'save-image',
	LOAD_IMAGE = 'load-image',
	DELETE_IMAGE = 'delete-image',
	SETTINGS_LOADED = 'settings-loaded',
	THEME_CHANGED = 'theme-changed',
	OPEN_IN_BROWSER = 'open-in-browser',
	OPEN_PATH = 'open-path',
	OPEN_SELECT_IMAGES_FOLDER_DIALOG = 'open-select-images-directory-dialog',
	OPEN_SELECT_FOLDER_DIALOG = 'open-select-folder-dialog',
	OPEN_SELECT_EXPORTED_DATA_FILE_DIALOG = 'open-select-exported-data-file-dialog',
	SAVE_EXPORTED_DATA = 'save-exported-data',
	OPEN_IMPORT_DATA_DIALOG = 'open-import-data-dialog',
	EXPORT_POSTS = 'export-posts',
}

export interface ExportDataDto {
	data: string;
	filePath: string;
}
