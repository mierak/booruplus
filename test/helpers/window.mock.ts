export const createObjectURL = jest.fn();
export const revokeObjectURL = jest.fn();
export const observe = jest.fn();
export const disconnect = jest.fn();
export const ResizeObserver = class {
	observe = observe;
	disconnect = disconnect;
};
