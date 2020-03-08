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

export const useSaveImage = (): ((post: Post) => void) => {
	const sendImage = (post: Post, base64: string | ArrayBuffer | null): void => {
		const dto: SavePostDto = {
			data: base64 as string,
			post
		};
		window.api.invoke('save-image', dto);
	};
	const sendSaveImageRequest = (post: Post): void => {
		fetch(post.fileUrl).then((response) =>
			response.blob().then((blob) => {
				const reader = new FileReader();
				reader.addEventListener('load', () => {
					sendImage(post, reader.result);
				});
				reader.readAsDataURL(blob);
			})
		);
	};

	const saveImage = (post: Post): void => {
		sendSaveImageRequest(post);
	};

	return saveImage;
};

export const useDeleteImage = (): ((post: Post) => void) => {
	const deleteImage = (post: Post): void => {
		window.api.invoke('delete-image', post);
	};

	return deleteImage;
};
