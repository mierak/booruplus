import { Post } from './gelbooruTypes';

export class ImageForPostNotFoundError extends Error {
	post: Post;

	constructor(message: string, post: Post) {
		super(message);
		Object.setPrototypeOf(this, ImageForPostNotFoundError.prototype);
		this.post = post;
	}
}
