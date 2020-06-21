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

export const getThumbnailBorder = (active: string, theme: 'dark' | 'light'): undefined | 'dashed 1px black' | 'dashed 1px white' => {
	if (active === 'false') return undefined;
	if (theme === 'dark') return 'dashed 1px white';
	else return 'dashed 1px black';
};
