class Image {
	constructor() {
		setTimeout(() => {
			this.onload();
		}, 100);
	}
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	onload(): void {}
}
(global as any).Image = Image;

import { addEventListener, removeEventListener } from '../helpers/windowEventListener.mock';
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: jest.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: jest.fn(), // deprecated
		removeListener: jest.fn(), // deprecated
		addEventListener: addEventListener,
		removeEventListener: removeEventListener,
		dispatchEvent: jest.fn(),
	})),
});
import { observe, disconnect, createObjectURL, revokeObjectURL } from '../helpers/window.mock';
Object.defineProperty(window, 'URL', {
	value: {
		createObjectURL: createObjectURL,
		revokeObjectURL: revokeObjectURL,
	},
});

import { doDatabaseMock } from '../helpers/database.mock';
doDatabaseMock();

import { deleteImageMock, saveImageMock, loadImageMock } from '../helpers/imageBus.mock';

jest.mock('../../src/hooks/useImageBus', () => ({
	useDeleteImage: jest.fn().mockReturnValue(deleteImageMock),
	useSaveImage: jest.fn().mockReturnValue(saveImageMock),
	useLoadImage: jest.fn().mockReturnValue(loadImageMock),
}));

(global as any).ResizeObserver = class {
	observe = observe;
	disconnect = disconnect;
	unobserve = jest.fn();
};

expect.extend({
	/**
	 * Matches given redux action to an arrray of dispatched actions from redux-mock-store.
	 * meta.arg is matched by stringifying both objects and comparing the result. As a result
	 * this function does not support matching non-serializable objects
	 */
	toContainMatchingAction(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		received: { type: string; meta?: any; payload?: any }[],
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expected: { type: string; meta?: any; payload?: any }
	): jest.CustomMatcherResult {
		let found = false;
		let foundSameTypeMessage = '';
		for (const r of received) {
			if (
				r.type === expected.type &&
				JSON.stringify(r.meta?.arg) === JSON.stringify(expected.meta?.arg) &&
				JSON.stringify(r.payload) === JSON.stringify(expected.payload)
			) {
				found = true;
				break;
			} else if (
				r.type === expected.type &&
				expected.meta === undefined &&
				JSON.stringify(r.payload) === JSON.stringify(expected.payload)
			) {
				found = true;
				break;
			} else if (
				r.type === expected.type &&
				expected.payload === undefined &&
				JSON.stringify(r.meta?.arg) === JSON.stringify(expected.meta?.arg)
			) {
				found = true;
				break;
			} else if (r.type === expected.type && expected.payload === undefined && expected.meta === undefined) {
				found = true;
				break;
			} else if (r.type === expected.type) {
				foundSameTypeMessage = ` Found action with the same type: \r\n${JSON.stringify(r)}\r\nexpected:\r\n${JSON.stringify(expected)}`;
			}
		}
		return {
			message: (): string => (found ? '' : `Supplied action not found in dispatched actions.${foundSameTypeMessage}`),
			pass: found,
		};
	},
});

Object.defineProperties((global as any).HTMLElement.prototype, {
	clientWidth: {
		get: function(): number {
			return this._jsdomMockClientWidth || 0;
		},
	},
	clientHeight: {
		get: function(): number {
			return this._jsdomMockClientHeight || 0;
		},
	},
	getBoundingClientRect: {
		value: function(): { top: number; right: number; bottom: number; left: number } {
			return (
				this._jsdomMockClientBoundingRect || {
					top: 0,
					bottom: 0,
					left: 0,
					right: 0,
				}
			);
		},
	},
});
