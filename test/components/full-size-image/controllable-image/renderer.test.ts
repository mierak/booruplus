/* eslint-disable @typescript-eslint/unbound-method */

import { Renderer } from '../../../../src/components/full-size-image/controllable-image/renderer';

describe('full-size-image/controllable-image/renderer', () => {
	let clearRect: jest.SpyInstance;
	let drawImage: jest.SpyInstance;
	const createRenderer = (params?: {
		viewportHeight?: number;
		viewportWidth?: number;
	}): { renderer: Renderer; viewport: HTMLCanvasElement } => {
		const viewport = document.createElement('canvas');
		const ctx = viewport.getContext('2d');
		if (ctx) {
			clearRect = jest.spyOn(ctx, 'clearRect').mockImplementation();
			drawImage = jest.spyOn(ctx, 'drawImage').mockImplementation();
		}

		const renderer = new Renderer();
		renderer.setViewport(viewport);
		renderer.setViewportSettings({
			height: params?.viewportHeight ?? 640,
			width: params?.viewportWidth ?? 800,
			offsetX: 30,
			offsetY: 50,
		});

		return { renderer, viewport };
	};
	beforeEach(() => {
		jest.clearAllMocks();
		jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback): number => {
			cb(123);
			return 1;
		});
	});
	describe('initListeners()', () => {
		it('Adds correct number of listeners', () => {
			// given
			const { renderer, viewport } = createRenderer();
			const addEventListenerSpy = jest.spyOn(viewport, 'addEventListener').mockImplementation();

			// when
			renderer.initListeners();

			// then
			expect(addEventListenerSpy).toBeCalledWith('mouseup', expect.anything());
			expect(addEventListenerSpy).toBeCalledWith('mousedown', expect.anything());
			expect(addEventListenerSpy).toBeCalledWith('mousemove', expect.anything());
			expect(addEventListenerSpy).toBeCalledWith('wheel', expect.anything(), { passive: true });
			expect(addEventListenerSpy).toBeCalledWith('mouseleave', expect.anything());
		});
	});
	describe('removeListeners()', () => {
		it('Adds correct number of listeners', () => {
			// given
			const { renderer, viewport } = createRenderer();
			const removeEventListenerSpy = jest.spyOn(viewport, 'removeEventListener').mockImplementation();

			// when
			renderer.removeListeners();

			// then
			expect(removeEventListenerSpy).toBeCalledWith('mouseup', expect.anything());
			expect(removeEventListenerSpy).toBeCalledWith('mousedown', expect.anything());
			expect(removeEventListenerSpy).toBeCalledWith('mousemove', expect.anything());
			expect(removeEventListenerSpy).toBeCalledWith('wheel', expect.anything());
			expect(removeEventListenerSpy).toBeCalledWith('mouseleave', expect.anything());
		});
	});
	describe('renderImage()', () => {
		it('Calls drawImage with correct settings img.width > img.height', () => {
			// given
			const viewportWidth = 1024;
			const viewportHeight = 768;
			const imageWidth = 800;
			const imageHeight = 300;
			const { renderer } = createRenderer({ viewportWidth, viewportHeight });
			const imageElement = document.createElement('img');
			imageElement.width = imageWidth;
			imageElement.height = imageHeight;
			const scale = viewportWidth / imageWidth;
			const topToCenter = viewportHeight / scale - imageHeight;
			const offsetY = -topToCenter / 2;
			const sourceWidth = viewportWidth / scale;
			const sourceHeight = viewportHeight / scale;

			// when
			renderer.setViewportSettings({
				height: viewportHeight,
				width: viewportWidth,
				offsetX: 30,
				offsetY: 50,
			});
			renderer.renderImage(imageElement);

			// then
			expect(clearRect).toBeCalledWith(0, 0, viewportWidth, viewportHeight);
			expect(drawImage).toBeCalledTimes(1);
			expect(drawImage).toBeCalledWith(
				expect.any(HTMLImageElement),
				0,
				offsetY,
				sourceWidth,
				sourceHeight,
				0,
				0,
				viewportWidth,
				viewportHeight
			);
		});
		it('Calls drawImage with correct settings when img.width > img.height and scale makes image taller than viewport height', () => {
			// given
			const viewportWidth = 1024;
			const viewportHeight = 768;
			const imageWidth = 800;
			const imageHeight = 640;
			const { renderer } = createRenderer({ viewportWidth, viewportHeight });
			const imageElement = document.createElement('img');
			imageElement.width = imageWidth;
			imageElement.height = imageHeight;
			const scale = viewportHeight / imageHeight;
			const leftToCenter = viewportWidth / scale - imageWidth;
			const offsetX = -leftToCenter / 2;
			const sourceWidth = viewportWidth / scale;
			const sourceHeight = viewportHeight / scale;

			// when
			renderer.setViewportSettings({
				height: viewportHeight,
				width: viewportWidth,
				offsetX: 30,
				offsetY: 50,
			});
			renderer.renderImage(imageElement);

			// then
			expect(drawImage).toBeCalledTimes(1);
			expect(drawImage).toBeCalledWith(
				expect.any(HTMLImageElement),
				offsetX,
				0,
				sourceWidth,
				sourceHeight,
				0,
				0,
				viewportWidth,
				viewportHeight
			);
		});
		it('Calls drawImage with correct settings when img.width < img.height', () => {
			// given
			const viewportWidth = 768;
			const viewportHeight = 1024;
			const imageWidth = 100;
			const imageHeight = 800;
			const { renderer } = createRenderer({ viewportWidth, viewportHeight });
			const imageElement = document.createElement('img');
			imageElement.width = imageWidth;
			imageElement.height = imageHeight;
			const scale = viewportHeight / imageHeight;
			const leftToCenter = viewportWidth / scale - imageWidth;
			const offsetX = -leftToCenter / 2;
			const sourceWidth = viewportWidth / scale;
			const sourceHeight = viewportHeight / scale;

			// when
			renderer.setViewportSettings({
				height: viewportHeight,
				width: viewportWidth,
				offsetX: 30,
				offsetY: 50,
			});
			renderer.renderImage(imageElement);

			// then
			expect(drawImage).toBeCalledTimes(1);
			expect(drawImage).toBeCalledWith(
				expect.any(HTMLImageElement),
				offsetX,
				0,
				sourceWidth,
				sourceHeight,
				0,
				0,
				viewportWidth,
				viewportHeight
			);
		});
		it('Calls drawImage with correct settings when img.width < img.height and scale makes image wider than viewport width', () => {
			// given
			const viewportWidth = 768;
			const viewportHeight = 1024;
			const imageWidth = 490;
			const imageHeight = 500;
			const { renderer } = createRenderer({ viewportWidth, viewportHeight });
			const imageElement = document.createElement('img');
			imageElement.width = imageWidth;
			imageElement.height = imageHeight;
			const scale = viewportWidth / imageWidth;
			const topToCenter = viewportHeight / scale - imageHeight;
			const offsetY = -topToCenter / 2;
			const sourceWidth = viewportWidth / scale;
			const sourceHeight = viewportHeight / scale;

			// when
			renderer.setViewportSettings({
				height: viewportHeight,
				width: viewportWidth,
				offsetX: 30,
				offsetY: 50,
			});
			renderer.renderImage(imageElement);

			// then
			expect(drawImage).toBeCalledTimes(1);
			expect(drawImage).toBeCalledWith(
				expect.any(HTMLImageElement),
				0,
				offsetY,
				sourceWidth,
				sourceHeight,
				0,
				0,
				viewportWidth,
				viewportHeight
			);
		});
		it('Calls drawImage with correct settings img.width == img.height and viewport.width > viewport.height', () => {
			// given
			const viewportWidth = 1024;
			const viewportHeight = 768;
			const imageWidth = 500;
			const imageHeight = 500;
			const { renderer } = createRenderer({ viewportWidth, viewportHeight });
			const imageElement = document.createElement('img');
			imageElement.width = imageWidth;
			imageElement.height = imageHeight;
			const scale = viewportHeight / imageHeight;
			const leftToCenter = viewportWidth / scale - imageWidth;
			const offsetX = -leftToCenter / 2;
			const sourceWidth = viewportWidth / scale;
			const sourceHeight = viewportHeight / scale;

			// when
			renderer.setViewportSettings({
				height: viewportHeight,
				width: viewportWidth,
				offsetX: 30,
				offsetY: 50,
			});
			renderer.renderImage(imageElement);

			// then
			expect(drawImage).toBeCalledTimes(1);
			expect(drawImage).toBeCalledWith(
				expect.any(HTMLImageElement),
				offsetX,
				0,
				sourceWidth,
				sourceHeight,
				0,
				0,
				viewportWidth,
				viewportHeight
			);
		});
		it('Calls drawImage with correct settings img.width == img.height and viewport.width < viewport.height', () => {
			// given
			const viewportWidth = 768;
			const viewportHeight = 1024;
			const imageWidth = 500;
			const imageHeight = 500;
			const { renderer } = createRenderer({ viewportWidth, viewportHeight });
			const imageElement = document.createElement('img');
			imageElement.width = imageWidth;
			imageElement.height = imageHeight;
			const scale = viewportWidth / imageWidth;
			const topToCenter = viewportHeight / scale - imageHeight;
			const offsetY = -topToCenter / 2;
			const sourceWidth = viewportWidth / scale;
			const sourceHeight = viewportHeight / scale;

			// when
			renderer.setViewportSettings({
				height: viewportHeight,
				width: viewportWidth,
				offsetX: 30,
				offsetY: 50,
			});
			renderer.renderImage(imageElement);

			// then
			expect(drawImage).toBeCalledTimes(1);
			expect(drawImage).toBeCalledWith(
				expect.any(HTMLImageElement),
				0,
				offsetY,
				sourceWidth,
				sourceHeight,
				0,
				0,
				viewportWidth,
				viewportHeight
			);
		});
	});
});
