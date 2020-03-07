import { Post } from './gelbooruTypes';

export interface SavePostDto {
	data: string;
	post: Post;
}

export interface LoadPostResponse {
	data?: string;
	post: Post;
}

export interface SuccessfulLoadPostResponse {
	data: string;
	post: Post;
}
