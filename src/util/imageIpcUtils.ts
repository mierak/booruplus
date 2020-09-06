import { Post } from '@appTypes/gelbooruTypes';
import { LoadPostResponse, SuccessfulLoadPostResponse, SavePostDto, IpcChannels, SaveThumbnailDto } from '@appTypes/processDto';
import { getThumbnailUrl } from '@service/webService';

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

const load = (post: Post, channel: IpcChannels): Promise<SuccessfulLoadPostResponse> => {
	return new Promise((resolve, reject) => {
		window.api.invoke<LoadPostResponse>(channel, post).then((response) => {
			if (response.data) {
				resolve({ data: response.data, post: response.post });
			} else {
				reject(post);
			}
		});
	});
};

export const loadImage = (post: Post): Promise<SuccessfulLoadPostResponse> => load(post, IpcChannels.LOAD_IMAGE);

export const loadThumbnail = (post: Post): Promise<SuccessfulLoadPostResponse> => load(post, IpcChannels.LOAD_THUMBNAIL);
