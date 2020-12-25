type ViewportSettings = {
	width: number;
	height: number;
	offsetX: number;
	offsetY: number;
}

export type ListenerVariables = {
	mouseDown: boolean;
	previous: {
		x: number;
		y: number;
	};
	offset: {
		x: number;
		y: number;
	};
	scale: number;
	scaleBy: number;
}

export class Renderer {
	private _viewport: HTMLCanvasElement | undefined;
	private _viewportSettings: ViewportSettings;
	private _listenerVariables: ListenerVariables;
	private _viewportCtx: CanvasRenderingContext2D | null | undefined;
	private _img: HTMLImageElement | undefined;

	constructor() {
		this._viewportSettings = {
			height: 0,
			width: 0,
			offsetX: 0,
			offsetY: 0,
		};
		this._listenerVariables = {
			mouseDown: false,
			previous: {
				x: 0,
				y: 0,
			},
			offset: {
				x: 1500,
				y: 1500,
			},
			scale: 1,
			scaleBy: 1.05,
		};
	}

	setViewport = (viewport: HTMLCanvasElement): void => {
		this._viewport = viewport;
		this._viewportCtx = viewport.getContext('2d');
	};

	setViewportSettings = (settings: ViewportSettings): void => {
		this._viewportSettings = settings;
		this.initImageScaleAndOffset();
		this._img && this.renderImage(this._img);
	};

	drawViewport = (): void => {
		const render = (): void => {
			if (this._viewportCtx && this._img) {
				this._viewportCtx.clearRect(0, 0, this._viewportSettings.width, this._viewportSettings.height);
				this._viewportCtx.drawImage(
					this._img,
					this._listenerVariables.offset.x,
					this._listenerVariables.offset.y,
					this._viewportSettings.width / this._listenerVariables.scale,
					this._viewportSettings.height / this._listenerVariables.scale,
					0,
					0,
					this._viewportSettings.width,
					this._viewportSettings.height
				);
			}
		};
		requestAnimationFrame(render);
	};

	renderImage = (img: HTMLImageElement): void => {
		this._img = img;
		this._listenerVariables.offset.x = 0;
		this._listenerVariables.offset.y = 0;
		this.initImageScaleAndOffset();
		this.drawViewport();
	};

	private initImageScaleAndOffset = (): void => {
		if (this._img) {
			let offsetByWidth = false;
			if (this._img.width > this._img.height) {
				this._listenerVariables.scale = this._viewportSettings.width / this._img.width;
				offsetByWidth = true;
				if (this._img.height * this._listenerVariables.scale > this._viewportSettings.height) {
					this._listenerVariables.scale = this._viewportSettings.height / this._img.height;
					offsetByWidth = false;
				}
			} else if (this._img.width < this._img.height) {
				this._listenerVariables.scale = this._viewportSettings.height / this._img.height;
				offsetByWidth = false;
				if (this._img.width * this._listenerVariables.scale > this._viewportSettings.width) {
					this._listenerVariables.scale = this._viewportSettings.width / this._img.width;
					offsetByWidth = true;
				}
			} else {
				if (this._viewportSettings.width > this._viewportSettings.height) {
					this._listenerVariables.scale = this._viewportSettings.height / this._img.height;
					offsetByWidth = false;
				} else {
					this._listenerVariables.scale = this._viewportSettings.width / this._img.width;
					offsetByWidth = true;
				}
			}

			if (!offsetByWidth) {
				const leftToCenter = this._viewportSettings.width / this._listenerVariables.scale - this._img.width;
				this._listenerVariables.offset.x = -leftToCenter / 2;
			} else {
				const topToCenter = this._viewportSettings.height / this._listenerVariables.scale - this._img.height;
				this._listenerVariables.offset.y = -topToCenter / 2;
			}
		}
	};

	private handleMouseDown = (event: MouseEvent): void => {
		this._listenerVariables.previous.x = event.clientX;
		this._listenerVariables.previous.y = event.clientY;
		this._listenerVariables.mouseDown = true;
	};
	private handleMouseUp = (event: MouseEvent): void => {
		this._listenerVariables.previous.x = event.clientX;
		this._listenerVariables.previous.y = event.clientY;
		this._listenerVariables.mouseDown = false;
	};
	private handleMouseMove = (event: MouseEvent): void => {
		//handle drag
		if (this._listenerVariables.mouseDown) {
			event.preventDefault();
			const mouseX = event.clientX;
			const mouseY = event.clientY;
			const dX = mouseX - this._listenerVariables.previous.x;
			const dY = mouseY - this._listenerVariables.previous.y;
			this._listenerVariables.previous.x = mouseX;
			this._listenerVariables.previous.y = mouseY;
			this._listenerVariables.offset.x -= dX / this._listenerVariables.scale;
			this._listenerVariables.offset.y -= dY / this._listenerVariables.scale;
			this.drawViewport();
		}
	};

	zoomIn = (): void => {
		this._listenerVariables.scale = this._listenerVariables.scale * this._listenerVariables.scaleBy;
		this.drawViewport();
	};

	zoomOut = (): void => {
		this._listenerVariables.scale = this._listenerVariables.scale / this._listenerVariables.scaleBy;
		this.drawViewport();
	};

	private handleMouseWheel = (event: MouseWheelEvent): void => {
		const oldScale = this._listenerVariables.scale;
		const x = (event.clientX - this._viewportSettings.offsetX) / oldScale;
		const y = (event.clientY - this._viewportSettings.offsetY) / oldScale;
		const delta = Math.sign(event.deltaY);

		this._listenerVariables.scale =
			delta < 0
				? this._listenerVariables.scale * this._listenerVariables.scaleBy
				: this._listenerVariables.scale / this._listenerVariables.scaleBy;

		const scaleChange = this._listenerVariables.scale - oldScale;
		const offsetX = (x * scaleChange) / this._listenerVariables.scale;
		const offsetY = (y * scaleChange) / this._listenerVariables.scale;
		this._listenerVariables.offset.x += offsetX;
		this._listenerVariables.offset.y += offsetY;

		this.drawViewport();
	};

	private handleMouseLeave = (): void => {
		this._listenerVariables.mouseDown = false;
	};

	initListeners = (): void => {
		if (this._viewport) {
			this._viewport.addEventListener('mouseup', this.handleMouseUp);
			this._viewport.addEventListener('mousedown', this.handleMouseDown);
			this._viewport.addEventListener('mousemove', this.handleMouseMove);
			this._viewport.addEventListener('wheel', this.handleMouseWheel, { passive: true });
			this._viewport.addEventListener('mouseleave', this.handleMouseLeave);
		}
	};

	removeListeners = (): void => {
		if (this._viewport) {
			this._viewport.removeEventListener('mouseup', this.handleMouseUp);
			this._viewport.removeEventListener('mousedown', this.handleMouseDown);
			this._viewport.removeEventListener('mousemove', this.handleMouseMove);
			this._viewport.removeEventListener('wheel', this.handleMouseWheel);
			this._viewport.removeEventListener('mouseleave', this.handleMouseLeave);
		}
	};

	getListenerVariables = (): ListenerVariables => ({ ...this._listenerVariables });
}
