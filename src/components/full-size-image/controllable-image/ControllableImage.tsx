import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import { loadImage } from '../../../util/imageIpcUtils';
import { Renderer } from './renderer';

import { AppDispatch, RootState } from '../../../store/types';
import { actions } from '../../../store';

import { Post } from '../../../types/gelbooruTypes';
import { ImageControl } from '../../../types/components';
import { IpcChannels } from '../../../types/processDto';

import TagsPopover from '../TagsPopover';
import ImageControls from '../ImageControls';
import LoadingMask from '../../../components/LoadingMask';
import { getPostUrl } from '../../../service/webService';

interface Props {
	url: string;
	className?: string;
	showControls?: boolean;
	post: Post;
}

const Container = styled.div`
	position: relative;
`;

const ControllableImage: React.FunctionComponent<Props> = ({ url, className, post, showControls }: Props) => {
	const dispatch = useDispatch<AppDispatch>();

	const isLoading = useSelector((state: RootState) => state.loadingStates.isFullImageLoading);

	const containerRef = useRef<HTMLDivElement>(null);
	const viewportRef = useRef<HTMLCanvasElement>(null);
	const renderer = useState<Renderer>(new Renderer())[0];

	const initViewport = useCallback(
		(viewport: HTMLCanvasElement, container: HTMLDivElement): void => {
			if (renderer) {
				viewport.width = container.clientWidth;
				viewport.height = container.clientHeight;
				renderer.setViewportSettings({
					width: container.clientWidth,
					height: container.clientHeight,
					offsetX: viewport.getBoundingClientRect().left,
					offsetY: viewport.getBoundingClientRect().top,
				});
			}
		},
		[renderer]
	);

	const handleZoomIn = (): void => {
		renderer && renderer.zoomIn();
	};

	const handleZoomOut = (): void => {
		renderer && renderer.zoomOut();
	};

	const handleCenter = (): void => {
		const viewport = viewportRef.current;
		const container = containerRef.current;

		if (renderer && viewport && container) {
			initViewport(viewport, container);
			renderer.drawViewport();
		}
	};

	const handleOpenWeb = (): void => {
		window.api.send(IpcChannels.OPEN_IN_BROWSER, getPostUrl(post.id));
	};

	const handleTagsPopoverVisibilityChange = (visible: boolean): void => {
		dispatch(actions.system.setTagsPopovervisible(visible));
	};

	const imageControls: ImageControl[] = [
		{
			icon: 'plus-outlined',
			key: 'image-control-zoom-in',
			tooltip: 'Zoom in',
			onClick: handleZoomIn,
		},
		{
			icon: 'minus-outlined',
			key: 'image-control-zoom-out',
			tooltip: 'Zoom out',
			onClick: handleZoomOut,
		},
		{
			icon: 'pic-center-outlined',
			key: 'image-control-center',
			tooltip: 'Center Image',
			onClick: handleCenter,
		},
		{
			icon: 'tags-outlined',
			key: 'image-control-show-tags',
			tooltip: 'Show tags',
			popOver: {
				content: <TagsPopover tags={post.tags} />,
				autoAdjustOverflow: true,
				onVisibleChange: handleTagsPopoverVisibilityChange,
				trigger: 'click',
			},
		},
		{
			icon: 'global-outlined',
			key: 'image-control-open-web',
			tooltip: 'Open in browser',
			onClick: handleOpenWeb,
		},
	];

	useEffect(() => {
		if (containerRef.current && viewportRef.current) {
			const viewport = viewportRef.current;
			const container = containerRef.current;
			renderer.setViewport(viewport);

			renderer.initListeners();

			const ro = new ResizeObserver(() => {
				initViewport(viewport, container);
				renderer.drawViewport();
			});
			ro.observe(containerRef.current);

			return (): void => {
				renderer.removeListeners(); // TODO change to only add listeners once
				ro.disconnect();
			};
		}
	}, [initViewport, renderer]);

	useEffect(() => {
		const viewport = viewportRef.current;
		const container = containerRef.current;
		let objectUrl = '';
		dispatch(actions.loadingStates.setFullImageLoading(true));
		if (renderer && viewport && container) {
			const img = new Image();
			img.onload = (): void => {
				dispatch(actions.loadingStates.setFullImageLoading(false));
				initViewport(viewport, container);
				renderer.renderImage(img);
			};
			loadImage(
				post,
				async (response) => {
					const buffer = new Blob([response.data]);

					objectUrl = URL.createObjectURL(buffer);
					!url.includes('webm') && (img.src = objectUrl);
				},
				(response) => {
					!url.includes('webm') && (img.src = response.fileUrl);
				}
			);
		}

		return (): void => {
			URL.revokeObjectURL(objectUrl);
		};
	}, [dispatch, initViewport, post, renderer, url]);

	return (
		<Container ref={containerRef} className={className} data-testid='controllable-image-container'>
			{showControls && <ImageControls actions={imageControls} />}
			<canvas ref={viewportRef} height={1000} width={1000} aria-label='canvas' />
			<LoadingMask visible={isLoading} />
		</Container>
	);
};

export default React.memo(ControllableImage);
