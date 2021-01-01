import { Post } from '@appTypes/gelbooruTypes';
import { SuccessfulLoadPostResponse, IpcInvokeChannels } from '@appTypes/processDto';
import { getThumbnailUrl } from '@service/webService';

export const deleteImage = (post: Post): void => {
	window.api.invoke(IpcInvokeChannels.DELETE_IMAGE, post);
};

export const saveImage = async (post: Post): Promise<void> => {
	const response = await fetch(post.fileUrl);
	const data = await (await response.blob()).arrayBuffer();

	const thumbnailResponse = await fetch(getThumbnailUrl(post.directory, post.hash));
	const thumbnailData = await (await thumbnailResponse.blob()).arrayBuffer();

	return window.api.invoke(IpcInvokeChannels.SAVE_IMAGE, { data, thumbnailData, post });
};

export const saveThumbnail = async (post: Post): Promise<void> => {
	const thumbnailResponse = await fetch(getThumbnailUrl(post.directory, post.hash));
	const data = await (await thumbnailResponse.blob()).arrayBuffer();

	return window.api.invoke(IpcInvokeChannels.SAVE_THUMBNAIL, { data, post });
};

const load = (
	post: Post,
	channel: IpcInvokeChannels.LOAD_IMAGE | IpcInvokeChannels.LOAD_THUMBNAIL
): Promise<SuccessfulLoadPostResponse> => {
	return new Promise((resolve, reject) => {
		window.api.invoke(channel, post).then((response) => {
			if (response.data) {
				resolve({ data: new Blob([response.data]), post: response.post });
			} else {
				reject(post);
			}
		});
	});
};

export const loadImage = (post: Post): Promise<SuccessfulLoadPostResponse> => load(post, IpcInvokeChannels.LOAD_IMAGE);

export const loadThumbnail = (post: Post): Promise<SuccessfulLoadPostResponse> =>
	load(post, IpcInvokeChannels.LOAD_THUMBNAIL);
