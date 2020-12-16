/* eslint-disable @typescript-eslint/no-explicit-any */
import { Post } from 'src/types/gelbooruTypes';
import { SavePostDto } from 'src/types/processDto';
import { IpcChannels, IpcListener } from 'src/types/processDto';
import log from 'electron-log';
import { clipboard } from 'electron';

interface IpcListener {
	listener: (event: IpcRendererEvent, ...args: unknown[]) => void;
}

export declare global {
	interface Window {
		api: {
			send<T = string>(channel: IpcChannels, data?: T): void;
			invoke<T>(channel: IpcChannels, post?: Post | SavePostDto): Promise<T>;
			on(channel: IpcChannels, listener: IpcListener): void;
			removeListener(channel: IpcChannels, listener: IpcListener): void;
		};
		log: typeof log.functions;
		clipboard: typeof clipboard;
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
