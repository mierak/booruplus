import React, { useEffect, createRef } from 'react';

import { Renderer } from './renderer';

interface Props {
	url: string;
	className?: string;
}

const ControllableImage: React.FunctionComponent<Props> = ({ url, className }: Props) => {
	const containerRef = createRef<HTMLDivElement>();
	const viewportRef = createRef<HTMLCanvasElement>();

	useEffect(() => {
		if (containerRef.current && viewportRef.current) {
			const viewport = viewportRef.current;
			const container = containerRef.current;
			const renderer = new Renderer(viewport);

			renderer.initListeners();

			const initViewport = (): void => {
				viewport.width = container.clientWidth;
				viewport.height = container.clientHeight;
				renderer.setViewportSettings({
					width: container.clientWidth,
					height: container.clientHeight,
					offsetX: viewport.getBoundingClientRect().left,
					offsetY: viewport.getBoundingClientRect().top,
				});
			};

			const ro = new ResizeObserver(() => {
				initViewport();
			});
			ro.observe(containerRef.current);

			const img = new Image();
			img.onload = (): void => {
				initViewport();
				renderer.renderImage(img);
			};
			img.src = url;
			initViewport();

			return (): void => {
				renderer.removeListeners(); // TODO change to only add listeners once
			};
		}
	}, [url]);

	return (
		<div ref={containerRef} className={className}>
			<canvas ref={viewportRef} height={1000} width={1000} />
		</div>
	);
};

export default ControllableImage;
