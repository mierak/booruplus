/* eslint-disable @typescript-eslint/unbound-method */
type Logger = {
	debug(...params: unknown[]): void;
	error(...params: unknown[]): void;
	info(...params: unknown[]): void;
	warn(...params: unknown[]): void;
}

type ThunkLogger = {
	getActionLogger(action: ActionParam, options?: { logPending?: boolean; initialMessage?: string }): Logger;
}

type ActionParam = {
	typePrefix: string;
}

export const getApiLogger = (functionName: string): Logger => {
	const logPrefix = `[api/${functionName}]`;
	return {
		debug: (...params: unknown[]): void => window.log.debug(logPrefix, '-', ...params),
		error: (...params: unknown[]): void => window.log.error(logPrefix, '-', ...params),
		info: (...params: unknown[]): void => window.log.info(logPrefix, '-', ...params),
		warn: (...params: unknown[]): void => window.log.warn(logPrefix, '-', ...params),
	};
};

export const thunkLoggerFactory = (): ThunkLogger => {
	return {
		getActionLogger: (action: ActionParam, options = { logPending: true, initialMessage: '' }): Logger => {
			const logPrefix = `[thunk/${action.typePrefix}]`;
			if (options.logPending || options.initialMessage) {
				window.log.info(logPrefix, '- pending', options.initialMessage);
			}
			return {
				debug: (...params: unknown[]): void => window.log.debug(logPrefix, '-', ...params),
				error: (...params: unknown[]): void => window.log.error(logPrefix, '-', ...params),
				info: (...params: unknown[]): void => window.log.info(logPrefix, '-', ...params),
				warn: (...params: unknown[]): void => window.log.warn(logPrefix, '-', ...params),
			};
		},
	};
};
