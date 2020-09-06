import path from 'path';

import { Post } from '@appTypes/gelbooruTypes';

interface PathProvider {
	getImagePath(post: Post): string;
	getThumbnailPath(post: Post): string;
	getImageDirsPaths(post: Post): string[];
	getThumbnailDirsPaths(post: Post): string[];
	getImageDirPath(post: Post): string;
	getThumbnailDirPath(post: Post): string;
}

export const getPathProvider = (baseDataPath: string): PathProvider => {
	const imagesPath = path.join(baseDataPath, 'images');
	const thumbnailsPath = path.join(baseDataPath, 'thumbnails');

	const getImagePath = (post: Post): string => path.join(imagesPath, post.directory, post.image);

	const getThumbnailPath = (post: Post): string => `${path.join(thumbnailsPath, post.directory, post.hash)}.jpg`;

	const getImageDirsPaths = (post: Post): [string, string] => {
		const dirs = post.directory.split('/');
		return [path.join(imagesPath, dirs[0], dirs[1]), path.join(imagesPath, dirs[0])];
	};

	const getThumbnailDirsPaths = (post: Post): [string, string] => {
		const dirs = post.directory.split('/');
		return [path.join(thumbnailsPath, dirs[0], dirs[1]), path.join(thumbnailsPath, dirs[0])];
	};

	const getImageDirPath = (post: Post): string => path.join(imagesPath, post.directory);

	const getThumbnailDirPath = (post: Post): string => path.join(thumbnailsPath, post.directory);

	return { getImagePath, getThumbnailPath, getImageDirsPaths, getThumbnailDirsPaths, getImageDirPath, getThumbnailDirPath };
};
