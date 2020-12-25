import { IconType } from 'antd/lib/notification';
import { showErrorNotification } from './errorNotificationRegistry';

export type ErrorWithNotificationConstructor = new (...args: never[]) => ErrorWithNotification;

export type ErrorInstance = {
	constructor: ErrorWithNotificationConstructor;
}

export type ErrorNotification = {
	icon?: IconType;
	title: string;
	message: string;
	duration?: number;
}

export abstract class ErrorWithNotification extends Error {
	constructor(message: string) {
		super(message);
	}

	showNotification(): void {
		showErrorNotification(this);
	}
}
