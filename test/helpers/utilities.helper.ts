export const defineClientSize = (container: HTMLElement, clientSize?: { clientWidth?: number; clientHeight?: number }): void => {
	Object.defineProperties(container, {
		_jsdomMockClientWidth: {
			value: clientSize?.clientWidth,
		},
		_jsdomMockClientHeight: {
			value: clientSize?.clientHeight,
		},
	});
};

export const defineClientBoundingRect = (
	container: HTMLElement,
	boundingRect?: { top?: number; right?: number; bottom?: number; left?: number }
): void => {
	Object.defineProperties(container, {
		_jsdomMockClientBoundingRect: {
			value: {
				top: boundingRect?.top ?? 0,
				left: boundingRect?.left ?? 0,
				right: boundingRect?.right ?? 0,
				bottom: boundingRect?.bottom ?? 0,
			},
		},
	});
};
