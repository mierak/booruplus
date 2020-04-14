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
