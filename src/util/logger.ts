/* eslint-disable @typescript-eslint/unbound-method */
type Logger = {
	debug(...params: unknown[]): void;
	error(...params: unknown[]): void;
	info(...params: unknown[]): void;
	warn(...params: unknown[]): void;
};

type ActionParam = {
	typePrefix: string;
};

export const getApiLogger = (functionName: string): Logger => {
	const logPrefix = `[api/${functionName}]`;
	return {
		debug: (...params: unknown[]): void => window.log.debug(logPrefix, '-', ...params),
		error: (...params: unknown[]): void => window.log.error(logPrefix, '-', ...params),
		info: (...params: unknown[]): void => window.log.info(logPrefix, '-', ...params),
		warn: (...params: unknown[]): void => window.log.warn(logPrefix, '-', ...params),
	};
};

export const getActionLogger = (action: ActionParam): Logger => {
	const logPrefix = `[${action.typePrefix}]`;
	return {
		debug: (...params: unknown[]): void => window.log.debug(logPrefix, '-', ...params),
		error: (...params: unknown[]): void => window.log.error(logPrefix, '-', ...params),
		info: (...params: unknown[]): void => window.log.info(logPrefix, '-', ...params),
		warn: (...params: unknown[]): void => window.log.warn(logPrefix, '-', ...params),
	};
};
