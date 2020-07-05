export const GELBOORU_URL = 'https://gelbooru.com';
export const OPTIONS_URL = `${GELBOORU_URL}/index.php?page=account&s=options`;

export const getPostUrl = (postId: number): string => {
	return `${GELBOORU_URL}/index.php?page=post&s=view&id=${postId}`;
};

export const getThumbnailUrl = (directory: string, hash: string): string => {
	return `${GELBOORU_URL}/thumbnails/${directory}/thumbnail_${hash}.jpg`;
};
