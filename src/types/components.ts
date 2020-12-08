import { Post } from './gelbooruTypes';
import { IconType } from 'antd/lib/notification';
import { notification } from 'antd';

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
	| 'loading-outlined';

export interface ContextMenu {
	title: string;
	key: string;
	action(post: Post): void;
}

export interface CardAction {
	icon: Icon;
	key: string;
	tooltip: string;
	onClick: (post: Post) => void;
	popConfirm?: { title: string; okText: string; cancelText: string };
	condition?: (post: Post) => boolean;
}

export interface ImageControl {
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
}

export const openNotificationWithIcon = (type: IconType, title: string, description: string, duration?: number): void => {
	notification[type]({
		message: title,
		description: description,
		duration: duration ? duration : 2,
	});
};
