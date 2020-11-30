
jest.mock('../../src/store/selectors', () => {
	return jest.requireActual('../../src/store/selectors');
});

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
Object.defineProperty((global as any).window.HTMLMediaElement.prototype, 'play', {
	get: function() {
		return this._play ?? jest.fn();
	},
	set: function(value: any): void {
		this._play = value;
	},
});
Object.defineProperty((global as any).window.HTMLMediaElement.prototype, 'load', {
	get() {
		return (): void => undefined;
	},
});

import { doDatabaseMock } from '../helpers/database.mock';
doDatabaseMock();

import {
	deleteImageMock,
	saveImageMock,
	loadImageMock,
	loadThumbnailMock,
	saveThumbnailMock,
	thumbnailLoaderMock,
	imageLoaderMock,
	mostViewedLoaderMock,
	previewLoaderMock,
} from '../helpers/imageBus.mock';

jest.mock('../../src/util/imageIpcUtils', () => ({
	loadImage: loadImageMock,
	saveImage: saveImageMock,
	deleteImage: deleteImageMock,
	loadThumbnail: loadThumbnailMock,
	saveThumbnail: saveThumbnailMock,
}));

jest.mock('../../src/util/componentUtils', () => {
	const orig = jest.requireActual('../../src/util/componentUtils');
	return {
		...orig,
		thumbnailLoader: thumbnailLoaderMock,
		imageLoader: imageLoaderMock,
		mostViewedLoader: mostViewedLoaderMock,
		previewLoader: previewLoaderMock,
	};
});

(global as any).ResizeObserver = class {
	observe = observe;
	disconnect = disconnect;
	unobserve = jest.fn();
};

Object.defineProperties((global as any).HTMLElement.prototype, {
	clientWidth: {
		get: function (): number {
			return this._jsdomMockClientWidth || 0;
		},
	},
	clientHeight: {
		get: function (): number {
			return this._jsdomMockClientHeight || 0;
		},
	},
	scrollHeight: {
		get: function (): number {
			return this._jsdomMockScrollHeight || 0;
		},
	},
	scrollTop: {
		get: function (): number {
			return this._jsdomMockScrollTop || 0;
		},
		set: function (value: number): void {
			this._scrollTop = value;
		},
	},
	getBoundingClientRect: {
		value: function (): { top: number; right: number; bottom: number; left: number } {
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
	onload: {
		set: function (cb: any): void {
			setTimeout(() => {
				cb();
			}, 100);
		},
	},
});