import { Post } from 'types/gelbooruTypes';

export declare global {
	interface Window {
		api: {
			send(channel: string, data?: unknown): void;
			on(channel: string, data: Function): void;
			removeListener(channel: string, listener: unknown): void;
			removeAllListeners(channel: string): void;
			invoke(channel: string, post?: Post): Promise<any>;
		};
	}
}
