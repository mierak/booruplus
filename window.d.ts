/* eslint-disable @typescript-eslint/no-explicit-any */
import { Post } from 'src/types/gelbooruTypes';
import { SavePostDto } from 'src/types/processDto';

export declare global {
	interface Window {
		api: {
			send(channel: string, data?: unknown): void;
			on(channel: string, data: Function): void;
			removeListener(channel: string, listener: unknown): void;
			removeAllListeners(channel: string): void;
			invoke(channel: string, post?: Post | SavePostDto): Promise<any>;
		};
	}
}

declare global {
	namespace jest {
		/**
		 * Matches given redux action to an arrray of dispatched actions from redux-mock-store.
		 * meta.arg is matched by stringifying both objects and comparing the result. As a result
		 * this function does not support matching non-serializable objects
		 */
		interface Matchers<R> {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			toContainMatchingAction(action: { type: string; meta?: any; payload?: any }): CustomMatcherResult;
		}
	}
}
