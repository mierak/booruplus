import { useEffect } from 'react';
import { Post } from '../../types/gelbooruTypes';
import { SavePostDto, LoadPostDto, LoadedImageDto } from '../../types/processDto';

export const useSaveImage = (): [(post: Post) => void, (listener: (dto: SavePostDto) => void) => void] => {
	const listeners = new Array<(dto: SavePostDto) => void>();

	const register = (listener: (dto: SavePostDto) => void): void => {
		listeners.push(listener);
	};

	const imageSavedListener = (dto: SavePostDto): void => {
		listeners.forEach((listener) => {
			listener(dto);
		});
	};

	useEffect(() => {
		window.api.on('image-saved', imageSavedListener);

		return (): void => {
			window.api.removeAllListeners('image-saved');
		};
	}, []);

	const sendImage = (post: Post, base64: string | ArrayBuffer | null): string => {
		const dto: SavePostDto = {
			id: post.id,
			data: base64 as string,
			directory: post.directory,
			name: post.image
		};
		window.api.send('save-image', dto);
		return base64 as string;
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

	return [sendSaveImageRequest, register];
};

export const useLoadImage = (): [(request: LoadPostDto) => void, (listener: (data: string) => void) => void] => {
	const listeners = new Array<(data: string) => void>();

	const register = (listener: (data: string) => void): void => {
		listeners.push(listener);
	};

	const imageLoadedListener = (dto: LoadedImageDto): void => {
		listeners.forEach((listener) => {
			listener(dto.data);
		});
	};
	useEffect(() => {
		window.api.on('image-loaded', imageLoadedListener);

		return (): void => {
			window.api.removeAllListeners('image-loaded');
		};
	}, []);

	const loadImage = (request: LoadPostDto): void => {
		window.api.send('load-image', request);
	};

	return [loadImage, register];
};
