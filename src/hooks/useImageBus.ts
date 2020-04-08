import { Post } from '../../types/gelbooruTypes';
import { LoadPostResponse, SuccessfulLoadPostResponse, SavePostDto } from '../../types/processDto';

export const useLoadImage = (): ((
	post: Post,
	onFullfiled: (response: SuccessfulLoadPostResponse) => void,
	onRejected: (post: Post) => void
) => void) => {
	const loadImage = (post: Post, onFullfiled: (response: SuccessfulLoadPostResponse) => void, onRejected: (post: Post) => void): void => {
		window.api.invoke('load-image', post).then((response: LoadPostResponse) => {
			if (response.data) {
				onFullfiled({ data: response.data, post: response.post });
			} else {
				onRejected(post);
			}
		});
	};

	return loadImage;
};

export const useSaveImage = (): ((post: Post) => Promise<void>) => {
	const sendImage = async (post: Post, base64: string | ArrayBuffer | null): Promise<void> => {
		const dto: SavePostDto = {
			data: base64 as string,
			post
		};
		return window.api.invoke('save-image', dto);
	};
	const sendSaveImageRequest = async (post: Post): Promise<void> => {
		const response = await fetch(post.fileUrl);
		const blob = await response.blob();
		const reader = new FileReader();
		reader.addEventListener('load', async () => {
			await sendImage(post, reader.result);
		});
		reader.readAsDataURL(blob);
		return Promise.resolve();
	};

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
