import type { PostsContext } from '@store/types';
import type { Post } from './gelbooruTypes';

export enum ActiveModal {
	NONE = 'NONE',
	ADD_POSTS_TO_FAVORITES = 'ADD_POSTS_TO_FAVORITES',
	ADD_FAVORITES_DIRECTORY = 'ADD_FAVORITES_DIRECTORY',
	RENAME_FAVORITES_DIRECTORY = 'RENAME_FAVORITES_DIRECTORY',
	DELETE_FAVORITES_DIRECTORY = 'DELETE_FAVORITES_DIRECTORY',
	MOVE_POSTS_TO_DIRECTORY_CONFIRMATION = 'MOVE_POSTS_TO_DIRECTORY_CONFIRMATION',
	MOVE_POSTS_TO_DIRECTORY_SELECTION = 'MOVE_POSTS_TO_DIRECTORY_SELECTION',
	SEARCH_FORM = 'SEARCH_FORM',
	RENAME_TAB = 'RENAME_TAB',
	SETTINGS = 'SETTINGS',
}

export type PerModalState = {
	[ActiveModal.ADD_POSTS_TO_FAVORITES]: AddToFavoritesModalProps | AddToFavoritesModalContextProps;
	[ActiveModal.ADD_FAVORITES_DIRECTORY]: AddDirectoryModalProps;
	[ActiveModal.RENAME_FAVORITES_DIRECTORY]: RenameDirectoryModalProps;
	[ActiveModal.DELETE_FAVORITES_DIRECTORY]: DeleteDirectoryModalProps;
	[ActiveModal.MOVE_POSTS_TO_DIRECTORY_CONFIRMATION]: MovePostsToDirectoryConfirmationModalProps;
	[ActiveModal.MOVE_POSTS_TO_DIRECTORY_SELECTION]: MovePostsToFavoritesDirectoryModalProps;
	[ActiveModal.SEARCH_FORM]: SearchFormModalProps;
	[ActiveModal.RENAME_TAB]: RenameTabProps;
	[ActiveModal.SETTINGS]?: void;
	[ActiveModal.NONE]?: void;
};

export type AddDirectoryModalProps = {
	selectedNodeKey: number;
};
export type AddToFavoritesModalProps = {
	postsToFavorite: Post[];
};
export type AddToFavoritesModalContextProps = {
	context: PostsContext | string;
	type: 'all' | 'selected';
};
export type DeleteDirectoryModalProps = {
	selectedNodeKey: number;
};
export type MovePostsToFavoritesDirectoryModalProps = {
	postsToMove: Post[];
};
export type MovePostsToDirectoryConfirmationModalProps = {
	targetDirectoryKey: number;
	postsToMove: Post[];
};
export type RenameDirectoryModalProps = {
	targetDirectoryKey: number;
};

export type SearchFormModalProps = {
	context: PostsContext | string;
	deleteOnClose?: boolean;
};

export type RenameTabProps = {
	context: string;
};
