/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import log from 'electron-log';
import { clipboard } from 'electron';
import { IpcInvokeType, IpcSendType, IpcListenerType } from '@appTypes/processDto';

export declare global {
	interface Window {
		api: {
			send: IpcSendType;
			invoke: IpcInvokeType;
			on: IpcListenerType;
			removeListener: IpcListenerType;
		};
		log: typeof log.functions;
		clipboard: typeof clipboard;
	}
	const GLOBALS: {
		VERSION: string;
	};
}

declare global {
	namespace jest {
		/**
		 * Matches given redux action to an arrray of dispatched actions from redux-mock-store.
		 * meta.arg is matched by stringifying both objects and comparing the result. As a result
		 * this function does not support matching non-serializable objects
		 */
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		interface Matchers<R> {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			toContainMatchingAction(action: { type: string; meta?: any; payload?: any }): CustomMatcherResult;
		}
	}
}
