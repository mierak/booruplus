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

export const loadImage = (
	post: Post,
	onFullfiled: (response: SuccessfulLoadPostResponse) => void,
	onRejected: (post: Post) => void
): void => {
	window.api.invoke<LoadPostResponse>(IpcChannels.LOAD_IMAGE, post).then((response) => {
		if (response.data) {
			onFullfiled({ data: response.data, post: response.post });
		} else {
			onRejected(post);
		}
	});
};
