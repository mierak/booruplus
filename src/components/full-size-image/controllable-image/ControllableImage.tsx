import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import { Renderer } from '@components/full-size-image/controllable-image/renderer';

import { AppDispatch, PostsContext, RootState } from '@store/types';
import { actions } from '@store';

import { Post } from '@appTypes/gelbooruTypes';
import { ImageControl, openNotificationWithIcon } from '@appTypes/components';
import { IpcSendChannels } from '@appTypes/processDto';

import TagsPopover from '@components/full-size-image/TagsPopover';
import ImageControls from '@components/full-size-image/ImageControls';
import LoadingMask from '@components/LoadingMask';
import { getPostUrl } from '@service/webService';
import { imageLoader } from '@util/componentUtils';

type Props = {
	className?: string;
	showControls?: boolean;
	context: PostsContext | string;
	post: Post;
};

const Container = styled.div`
	position: relative;
`;

const ControllableImage: React.FunctionComponent<Props> = ({ className, post, showControls, context }: Props) => {
	const dispatch = useDispatch<AppDispatch>();

	const isLoading = useSelector((state: RootState) => state.loadingStates.isFullImageLoading);
	const downloadMissingImage = useSelector((state: RootState) => state.settings.downloadMissingImages);

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
		window.api.send(IpcSendChannels.OPEN_IN_BROWSER, getPostUrl(post.id));
	};

	const handleTagsPopoverVisibilityChange = (visible: boolean): void => {
		dispatch(actions.system.setTagsPopovervisible(visible));
	};

	const handleCopyToClipboard = (): void => {
		window.clipboard.writeText(post.fileUrl);
		openNotificationWithIcon('success', 'Link copied to clipboard', '');
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
				content: <TagsPopover context={context} tags={post.tags} />,
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
		{
			icon: 'copy-outlined',
			key: 'copy-to-clipboard',
			tooltip: 'Copy to clipboard',
			onClick: handleCopyToClipboard,
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
		dispatch(actions.loadingStates.setFullImageLoading(true));
		if (renderer && viewport && container) {
			let canceled = false;
			const img = new Image();
			img.onload = (): void => {
				dispatch(actions.loadingStates.setFullImageLoading(false));
				initViewport(viewport, container);
				renderer.renderImage(img);
			};
			const loader = imageLoader(post, downloadMissingImage);
			loader.then((url) => {
				if (!canceled) {
					img.src = url;
				}
			});
			return (): void => {
				canceled = true;
			};
		}
	}, [dispatch, downloadMissingImage, initViewport, post, renderer]);

	return (
		<Container ref={containerRef} className={className} data-testid='controllable-image-container'>
			{showControls && <ImageControls actions={imageControls} />}
			<canvas ref={viewportRef} height={1000} width={1000} aria-label='canvas' />
			<LoadingMask visible={isLoading} />
		</Container>
	);
};

export default React.memo(ControllableImage);
