import { Post } from '../types/gelbooruTypes';
import { LoadPostResponse, SuccessfulLoadPostResponse, SavePostDto, IpcChannels, SaveThumbnailDto } from '../types/processDto';
import { getThumbnailUrl } from '../service/webService';

export const deleteImage = (post: Post): void => {
	window.api.invoke(IpcChannels.DELETE_IMAGE, post);
};

export const saveImage = async (post: Post): Promise<void> => {
	const response = await fetch(post.fileUrl);
	const arrayBuffer = await (await response.blob()).arrayBuffer();

	const thumbnailResponse = await fetch(getThumbnailUrl(post.directory, post.hash));
	const thumbnailArrayBuffer = await (await thumbnailResponse.blob()).arrayBuffer();

	const dto: SavePostDto = {
		data: arrayBuffer,
		thumbnailData: thumbnailArrayBuffer,
		post,
	};
	return window.api.invoke(IpcChannels.SAVE_IMAGE, dto);
};

export const saveThumbnail = async (post: Post): Promise<void> => {
	const thumbnailResponse = await fetch(getThumbnailUrl(post.directory, post.hash));
	const thumbnailArrayBuffer = await (await thumbnailResponse.blob()).arrayBuffer();

	const dto: SaveThumbnailDto = {
		data: thumbnailArrayBuffer,
		post,
	};
	return window.api.invoke(IpcChannels.SAVE_THUMBNAIL, dto);
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

export const loadThumbnail = (post: Post): Promise<SuccessfulLoadPostResponse> => {
	return new Promise((resolve, reject) => {
		window.api.invoke<LoadPostResponse>(IpcChannels.LOAD_THUMBNAIL, post).then((response) => {
			if (response.data) {
				resolve({ data: response.data, post: response.post });
			} else {
				reject(post);
			}
		});
	});
};
