import { IconType } from 'antd/lib/notification';
import { notification } from 'antd';

import type { Post } from './gelbooruTypes';
import type { ContextMode, PostsContext } from '@store/types';

export type Icon =
	| 'heart-outlined'
	| 'delete-outlined'
	| 'download-outlined'
	| 'close-outlined'
	| 'plus-outlined'
	| 'folder-outlined'
	| 'minus-outlined'
	| 'pic-center-outlined'
	| 'tags-outlined'
	| 'global-outlined'
	| 'clock-circle-outlined'
	| 'loading-outlined'
	| 'copy-outlined'
	| 'reload-outlined'
	| 'edit-outlined'
	| 'dash-outlined'
	| 'disconnected-outlined';

export type ContextMenu = {
	title: string;
	key: string;
	action(post: Post): void;
};

export type CardAction = {
	icon: Icon;
	key: string;
	tooltip: string;
	onClick: (post: Post, context: PostsContext | string) => void;
	popConfirm?: { title: string; okText: string; cancelText: string };
	condition?: (post: Post) => boolean;
};

export type TabAction = {
	key: string;
	title: string;
	icon: Icon;
	disabled?: (context: string, mode: ContextMode) => boolean;
	onClick: (context: string, mode: ContextMode) => void;
};

export type ImageControl = {
	key: string;
	icon: Icon;
	tooltip: string;
	onClick?: () => void;
	popOver?: {
		content: React.ReactNode;
		trigger: 'hover' | 'focus' | 'click' | 'contextMenu';
		autoAdjustOverflow: boolean;
		onVisibleChange: (visible: boolean) => void;
	};
};

export const openNotificationWithIcon = (
	type: IconType,
	title: string,
	description: string,
	duration?: number
): void => {
	notification[type]({
		message: title,
		description: description,
		duration: duration ? duration : 2,
	});
};
