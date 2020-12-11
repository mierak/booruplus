import { PostsContext } from '@store/types';
import { Post } from './gelbooruTypes';

export enum ActiveModal {
	NONE,
	ADD_POSTS_TO_FAVORITES,
	ADD_FAVORITES_DIRECTORY,
	RENAME_FAVORITES_DIRECTORY,
	DELETE_FAVORITES_DIRECTORY,
	MOVE_POSTS_TO_DIRECTORY_CONFIRMATION,
	MOVE_POSTS_TO_DIRECTORY_SELECTION,
	SETTINGS,
}

export interface PerModalState {
	[ActiveModal.ADD_POSTS_TO_FAVORITES]: AddToFavoritesModalProps | AddToFavoritesModalContextProps;
	[ActiveModal.ADD_FAVORITES_DIRECTORY]: AddDirectoryModalProps;
	[ActiveModal.RENAME_FAVORITES_DIRECTORY]: RenameDirectoryModalProps;
	[ActiveModal.DELETE_FAVORITES_DIRECTORY]: DeleteDirectoryModalProps;
	[ActiveModal.MOVE_POSTS_TO_DIRECTORY_CONFIRMATION]: MovePostsToDirectoryConfirmationModalProps;
	[ActiveModal.MOVE_POSTS_TO_DIRECTORY_SELECTION]: MovePostsToFavoritesDirectoryModalProps;
	[ActiveModal.SETTINGS]: {};
	[ActiveModal.NONE]: {};
}

export interface AddDirectoryModalProps {
	selectedNodeKey: number;
}
export interface AddToFavoritesModalProps {
	postsToFavorite: Post[];
}
export interface AddToFavoritesModalContextProps {
	context: PostsContext;
	type: 'all' | 'selected';
}
export interface DeleteDirectoryModalProps {
	selectedNodeKey: number;
}
export interface MovePostsToFavoritesDirectoryModalProps {
	postsToMove: Post[];
}
export interface MovePostsToDirectoryConfirmationModalProps {
	targetDirectoryKey: number;
	postsToMove: Post[];
}
export interface RenameDirectoryModalProps {
	targetDirectoryKey: number;
}
