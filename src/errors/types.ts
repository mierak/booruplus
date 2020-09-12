import { IconType } from 'antd/lib/notification';
import { showErrorNotification } from './errorNotificationRegistry';

export type ErrorWithNotificationConstructor = new (...args: never[]) => ErrorWithNotification;

export interface ErrorInstance {
	constructor: ErrorWithNotificationConstructor;
}

export interface ErrorNotification {
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
