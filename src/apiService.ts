import { Post } from '../types/gelbooruTypes';
const BASE_URL = 'https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1';

export const getPostsForTags = async (...tags: string[]): Promise<Post[]> => {
	const response = await fetch(`${BASE_URL}&tags=${tags.join(' ')}`);
	const posts: Post[] = await response.json();
	return posts;
};
