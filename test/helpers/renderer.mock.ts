export const renderImage = jest.fn();
export const setViewportSettings = jest.fn();
export const zoomIn = jest.fn();
export const zoomOut = jest.fn();
export const drawViewport = jest.fn();

jest.mock('../../src/components/full-size-image/controllable-image/renderer', () => {
	return {
		Renderer: jest.fn().mockImplementation(() => {
			return {
				setViewport: jest.fn(),
				initListeners: jest.fn(),
				removeListeners: jest.fn(),
				setViewportSettings: setViewportSettings,
				drawViewport: drawViewport,
				renderImage: renderImage,
				zoomIn: zoomIn,
				zoomOut: zoomOut,
			};
		}),
	};
});
