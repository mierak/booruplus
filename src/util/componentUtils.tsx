import React from 'react';
import {
	HeartOutlined,
	DownloadOutlined,
	DeleteOutlined,
	CloseOutlined,
	PlusOutlined,
	MinusOutlined,
	FolderOutlined,
	PicCenterOutlined,
	TagsOutlined,
	GlobalOutlined,
	ClockCircleOutlined,
	LoadingOutlined,
	CopyOutlined,
} from '@ant-design/icons';

import { Icon } from '@appTypes/components';
import { Post } from '@appTypes/gelbooruTypes';
import { getThumbnailUrl, getPreviewUrl } from '@service/webService';
import { SuccessfulLoadPostResponse } from '@appTypes/processDto';

import { thumbnailCache, imageCache, ImageCache, mostViewedCache } from './objectUrlCache';
import { loadImage, saveImage, loadThumbnail, saveThumbnail } from './imageIpcUtils';
import { isFilenameVideo } from './utils';

export const getIcon = (icon: Icon, onClick?: (() => void) | undefined): React.ReactElement => {
	switch (icon) {
		case 'delete-outlined':
			return <DeleteOutlined onClick={onClick} />;
		case 'download-outlined':
			return <DownloadOutlined onClick={onClick} />;
		case 'heart-outlined':
			return <HeartOutlined onClick={onClick} />;
		case 'close-outlined':
			return <CloseOutlined onClick={onClick} />;
		case 'plus-outlined':
			return <PlusOutlined onClick={onClick} />;
		case 'minus-outlined':
			return <MinusOutlined onClick={onClick} />;
		case 'folder-outlined':
			return <FolderOutlined onClick={onClick} />;
		case 'pic-center-outlined':
			return <PicCenterOutlined onClick={onClick} />;
		case 'tags-outlined':
			return <TagsOutlined onClick={onClick} />;
		case 'global-outlined':
			return <GlobalOutlined onClick={onClick} />;
		case 'clock-circle-outlined':
			return <ClockCircleOutlined onClick={onClick} />;
		case 'copy-outlined':
			return <CopyOutlined onClick={onClick}/>;
		case 'loading-outlined':
			return <LoadingOutlined />;
	}
};

export const getThumbnailBorder = (active: string, theme: 'dark' | 'light', selected: boolean): string | undefined => {
	if (selected) {
		if (active === 'false') return 'solid 1px #177ddc';
		return 'dashed 1px #177ddc';
	} else {
		if (active === 'false') return undefined;
		if (theme === 'dark') return 'dashed 1px white';
	}
	return 'dashed 1px black';
};
interface SetImageSizeParams {
	post: Post;
	windowSize: { width: number; height: number };
}

export const getPreviewImageSize = ({ post, windowSize }: SetImageSizeParams): { width: number; height: number } => {
	const ratio = post.width / post.height;
	if (post.width > post.height) {
		const width = windowSize.width * 0.66;
		const height = width / ratio;
		if (height > windowSize.height * 0.95) {
			const height2 = windowSize.height * 0.95;
			const width2 = height2 * ratio;
			return { width: width2, height: height2 };
		} else {
			return { width, height };
		}
	} else {
		const height = windowSize.height * 0.95;
		const width = height * ratio;
		if (width > windowSize.width * 0.66) {
			const width2 = windowSize.width * 0.66;
			const height2 = width2 / ratio;
			return { width: width2, height: height2 };
		} else {
			return { width, height };
		}
	}
};

interface LoaderParams {
	post: Post;
	downloadMissing: boolean;
	cache: ImageCache;
	notFoundResolveValue: string;
	shouldLog?: boolean;
	ignoreDownloadedStatus?: boolean;
	loadFunction: (post: Post) => Promise<SuccessfulLoadPostResponse>;
	saveCallback: (post: Post) => void;
}

const loader = ({
	post,
	downloadMissing,
	cache,
	notFoundResolveValue,
	shouldLog,
	ignoreDownloadedStatus,
	loadFunction,
	saveCallback,
}: LoaderParams): Promise<string> => {
	const log = window.log;
	return new Promise<string>((resolve) => {
		if (post.downloaded === 0 && !ignoreDownloadedStatus) {
			shouldLog && log.debug('Post is not downloaded. Reading from URL', notFoundResolveValue);
			resolve(notFoundResolveValue);
			return;
		}

		const cachedUrl = cache.getIfPresent(post.id);
		if (cachedUrl) {
			shouldLog && log.debug('Post found in cache, cached URL:', cachedUrl);
			resolve(cachedUrl);
			return;
		}

		loadFunction(post)
			.then((result) => {
				const objectUrl = URL.createObjectURL(result.data);
				cache.add(objectUrl, post.id);
				shouldLog && log.debug('Post was found and loaded successfuly, ObjectURL:', objectUrl);
				resolve(objectUrl);
			})
			.catch((_) => {
				shouldLog && log.debug('Downloaded post not found on disk. Reading from URL', notFoundResolveValue);
				if (downloadMissing) {
					shouldLog && log.debug('Saving missing or thumbnail image. Id: ', post.id);
					saveCallback(post);
				}
				resolve(notFoundResolveValue);
			});
	});
};

export const imageLoader = (post: Post, downloadMissingImage = true): Promise<string> => {
	return loader({
		post,
		downloadMissing: downloadMissingImage,
		cache: imageCache,
		notFoundResolveValue: post.fileUrl,
		shouldLog: true,
		saveCallback: saveImage,
		loadFunction: loadImage,
	});
};

export const thumbnailLoader = (post: Post, downloadMissingThumbnail = true): Promise<string> => {
	return loader({
		post,
		downloadMissing: downloadMissingThumbnail,
		cache: thumbnailCache,
		notFoundResolveValue: getThumbnailUrl(post.directory, post.hash),
		saveCallback: saveThumbnail,
		loadFunction: loadThumbnail,
	});
};

export const mostViewedLoader = (post: Post, downloadMissingThumbnail = true): Promise<string> => {
	return loader({
		post,
		downloadMissing: downloadMissingThumbnail,
		cache: mostViewedCache,
		notFoundResolveValue: getThumbnailUrl(post.directory, post.hash),
		ignoreDownloadedStatus: true,
		saveCallback: saveThumbnail,
		loadFunction: loadThumbnail,
	});
};

export const previewLoader = (post: Post): Promise<string | undefined> => {
	return new Promise<string | undefined>((resolve) => {
		const cached = imageCache.getIfPresent(post.id);
		if (cached) {
			resolve(cached);
		}
		if (post.downloaded) {
			if (isFilenameVideo(post.image)) {
				resolve(undefined);
			} else {
				loadImage(post)
					.then((result) => {
						const objectUrl = URL.createObjectURL(result.data);
						imageCache.add(objectUrl, post.id);
						resolve(objectUrl);
					})
					.catch(() => {
						resolve(post.fileUrl);
					});
			}
		} else {
			if (post.sample) {
				resolve(getPreviewUrl(post.directory, post.hash));
			} else {
				if (isFilenameVideo(post.image)) {
					resolve(undefined);
				} else {
					resolve(post.fileUrl);
				}
			}
		}
	});
};
