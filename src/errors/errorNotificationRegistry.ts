import { openNotificationWithIcon } from '@appTypes/components';
import { ErrorInstance, ErrorNotification, ErrorWithNotification, ErrorWithNotificationConstructor } from './types';

const registry = new Map<ErrorWithNotificationConstructor, ErrorNotification>();

export const registerErrorNotification = (type: ErrorWithNotificationConstructor, notification: ErrorNotification): void => {
	registry.set(type, notification);
};

export const showErrorNotification = <E extends ErrorWithNotification>(err: E): void => {
	const constructor = ((err as unknown) as ErrorInstance).constructor;
	const notification = registry.get(constructor);

	if (notification) {
		openNotificationWithIcon(notification.icon ?? 'error', notification.title, notification.message, notification.duration ?? 5);
	} else {
		window.log.error(
			`Tried to show notification for ${constructor.name} which was not registered. Maybe you forgot to register it's notification?`
		);
	}
};

export const clearRegistry = (): void => {
	registry.clear();
};
