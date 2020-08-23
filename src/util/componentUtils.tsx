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
} from '@ant-design/icons';
import { Icon } from '../types/components';
import { Post } from '../types/gelbooruTypes';
import { Tooltip } from 'antd';
import { loadImage, saveImage, loadThumbnail, saveThumbnail } from './imageIpcUtils';
import { getThumbnailUrl } from '../service/webService';
import { thumbnailCache, imageCache, ImageCache, mostViewedCache } from './objectUrlCache';
import { SuccessfulLoadPostResponse } from 'types/processDto';

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
	}
};

export const renderPostCardAction = (
	icon: Icon,
	key: string,
	tooltip: string,
	onClick?: (post: Post) => void,
	post?: Post
): React.ReactElement => {
	const handler = onClick && post ? (): void => onClick(post) : undefined;
	return (
		<Tooltip destroyTooltipOnHide title={tooltip} key={key}>
			{getIcon(icon, handler)}
		</Tooltip>
	);
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
				const objectUrl = URL.createObjectURL(new Blob([result.data]));
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
