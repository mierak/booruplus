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
import { thumbnailCache, imageCache } from './objectUrlCache';

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

export const imageLoader = (post: Post, downloadMissingImage = true): Promise<string> => {
	const log = window.log;
	let objectUrl = '';

	return new Promise<string>((resolve) => {
		if (post.downloaded) {
			const cachedUrl = imageCache.returnIfExists(post.id);
			if (cachedUrl) {
				resolve(cachedUrl);
			} else {
				loadImage(post)
					.then((result) => {
						objectUrl = URL.createObjectURL(new Blob([result.data]));
						log.debug('Post was found and loaded successfuly, ObjectURL:', objectUrl);
						imageCache.add(objectUrl, post.id);
						resolve(objectUrl);
					})
					.catch((err) => {
						resolve(err.fileUrl);
						log.debug('Downloaded post not found on disk. Reading from URL', err.fileUrl);
						if (downloadMissingImage) {
							log.debug('Saving missing image. Id: ', post.id);
							saveImage(post);
						}
					});
			}
		} else {
			log.debug('Post is not downloaded. Reading from URL', post.fileUrl);
			resolve(post.fileUrl);
		}
	});
};

export const thumbnailLoader = (post: Post, downloadMissingThumbnail = true): Promise<string> => {
	const log = window.log;
	let objectUrl = '';

	return new Promise<string>((resolve) => {
		if (post.downloaded) {
			const cacheUrl = thumbnailCache.returnIfExists(post.id);
			if (cacheUrl) {
				resolve(cacheUrl);
			} else {
				loadThumbnail(post)
					.then((result) => {
						objectUrl = URL.createObjectURL(new Blob([result.data]));
						thumbnailCache.add(objectUrl, post.id);
						resolve(objectUrl);
					})
					.catch((_) => {
						if (downloadMissingThumbnail) {
							log.debug('Saving missing thumbnail. Id: ', post.id);
							saveThumbnail(post);
						}
						resolve(getThumbnailUrl(post.directory, post.hash));
					});
			}
		} else {
			resolve(getThumbnailUrl(post.directory, post.hash));
		}
	});
};
