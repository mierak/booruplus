import { Post } from '../types/gelbooruTypes';
import { LoadPostResponse, SuccessfulLoadPostResponse, SavePostDto, IpcChannels } from '../types/processDto';

export const deleteImage = (post: Post): void => {
	window.api.invoke(IpcChannels.DELETE_IMAGE, post);
};

export const saveImage = async (post: Post): Promise<void> => {
	const response = await fetch(post.fileUrl);
	const arrayBuffer = await (await response.blob()).arrayBuffer();
	const dto: SavePostDto = {
		data: arrayBuffer,
		post,
	};
	return window.api.invoke(IpcChannels.SAVE_IMAGE, dto);
};

export const loadImage = (post: Post): Promise<SuccessfulLoadPostResponse> => {
	return new Promise((resolve, reject) => {
		window.api.invoke<LoadPostResponse>(IpcChannels.LOAD_IMAGE, post).then((response) => {
			if (response.data) {
				resolve({ data: response.data, post: response.post });
			} else {
				reject(post);
			}
		});
	});
};
