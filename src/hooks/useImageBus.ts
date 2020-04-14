import { Post } from '../../types/gelbooruTypes';
import { LoadPostResponse, SuccessfulLoadPostResponse, SavePostDto } from '../../types/processDto';

const sendImage = async (post: Post, buffer: ArrayBuffer): Promise<void> => {
	const dto: SavePostDto = {
		data: buffer,
		post
	};
	return window.api.invoke('save-image', dto);
};
const sendSaveImageRequest = async (post: Post): Promise<void> => {
	const response = await fetch(post.fileUrl);
	const arrayBuffer = await (await response.blob()).arrayBuffer();
	return await sendImage(post, arrayBuffer);
};

const loadImage = (post: Post, onFullfiled: (response: SuccessfulLoadPostResponse) => void, onRejected: (post: Post) => void): void => {
	window.api.invoke('load-image', post).then((response: LoadPostResponse) => {
		if (response.data) {
			onFullfiled({ data: response.data, post: response.post });
		} else {
			onRejected(post);
		}
	});
};

export const useLoadImage = (): ((
	post: Post,
	onFullfiled: (response: SuccessfulLoadPostResponse) => void,
	onRejected: (post: Post) => void
) => void) => {
	return loadImage;
};

export const useSaveImage = (): ((post: Post) => Promise<void>) => {
	const saveImage = async (post: Post): Promise<void> => {
		return sendSaveImageRequest(post);
	};

	return saveImage;
};

export const useDeleteImage = (): ((post: Post) => void) => {
	const deleteImage = (post: Post): void => {
		window.api.invoke('delete-image', post);
	};

	return deleteImage;
};
