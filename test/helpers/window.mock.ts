export const createObjectURL = jest.fn();
export const revokeObjectURL = jest.fn();
export const observe = jest.fn();
export const disconnect = jest.fn();
export const ResizeObserver = class {
	observe = observe;
	disconnect = disconnect;
};
export const log = {
	info: jest.fn(),
	debug: jest.fn(),
	error: jest.fn(),
	warn: jest.fn(),
};
