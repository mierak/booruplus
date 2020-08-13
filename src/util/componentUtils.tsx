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
import { loadImage, saveImage } from './imageIpcUtils';

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

export const imageLoader = (post: Post, downloadMissingImage = true): { url: Promise<string>; cleanup: () => Promise<void> } => {
	const log = window.log;
	let objectUrlExists = false;
	let objectUrl = '';

	const promise = new Promise<string>((resolve) => {
		if (post.downloaded) {
			loadImage(post)
				.then((result) => {
					objectUrl = URL.createObjectURL(new Blob([result.data]));
					log.debug('Post was found and loaded successfuly, ObjectURL:', objectUrl);
					objectUrlExists = true;
					resolve(objectUrl);
				})
				.catch((err) => {
					log.debug('Downloaded post not found on disk. Reading from URL');
					resolve(err.fileUrl);
					if (downloadMissingImage) {
						log.debug('Saving missing image. Id: ', post.id);
						saveImage(post);
					}
				});
		} else {
			log.debug('Post is not downloaded. Reading from URL', post.fileUrl);
			resolve(post.fileUrl);
		}
	});

	const cleanup = async (): Promise<void> => {
		await promise;
		if (objectUrlExists) {
			if (objectUrl) {
				log.debug('Cleaning up objectUrl', objectUrl);
				URL.revokeObjectURL(objectUrl);
			} else {
				log.error('Could not clean up object URL create for post id', post.id, '. This might cause a memory leak!');
			}
		}
	};

	return { cleanup, url: promise };
};
