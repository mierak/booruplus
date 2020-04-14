import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';

import { Button, Popover } from 'antd';
import { PlusOutlined, MinusOutlined, PicCenterOutlined, TagsOutlined, GlobalOutlined } from '@ant-design/icons';

import { Renderer } from './renderer';
import { Post } from 'types/gelbooruTypes';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'store/types';
import { actions } from 'store/';
import TagsPopover from './TagsPopover';
import { useLoadImage } from 'hooks/useImageBus';

interface Props {
	url: string;
	className?: string;
	showControls?: boolean;
	post: Post;
}

const Container = styled.div`
	position: relative;
`;

const StyledControlsContainer = styled.div`
	position: absolute;
	display: grid;
	grid-template-columns: 1fr;
	grid-template-rows: repeat(4, 1fr);
	grid-row-gap: 5px;
	top: 25px;
	left: 25px;
`;

const ControllableImage: React.FunctionComponent<Props> = ({ url, className, post, showControls }: Props) => {
	const dispatch = useDispatch<AppDispatch>();
	const loadImage = useLoadImage();
	const containerRef = useRef<HTMLDivElement>(null);
	const viewportRef = useRef<HTMLCanvasElement>(null);
	const renderer = useState<Renderer>(new Renderer())[0];

	const initViewport = (viewport: HTMLCanvasElement, container: HTMLDivElement): void => {
		if (renderer) {
			viewport.width = container.clientWidth;
			viewport.height = container.clientHeight;
			renderer.setViewportSettings({
				width: container.clientWidth,
				height: container.clientHeight,
				offsetX: viewport.getBoundingClientRect().left,
				offsetY: viewport.getBoundingClientRect().top
			});
		}
	};

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
		window.api.send('open-in-browser', `https://gelbooru.com/index.php?page=post&s=view&id=${post.id}`);
	};

	const handleTagsPopoverVisibilityChange = (visible: boolean): void => {
		dispatch(actions.system.setTagsPopovervisible(visible));
	};

	const renderTagsButton = (): React.ReactNode => {
		// eslint-disable-next-line react/prop-types
		const content = <TagsPopover tags={post.tags} />;
		return (
			<Popover
				content={content}
				key="btn-show-tags"
				trigger="click"
				autoAdjustOverflow={true}
				onVisibleChange={handleTagsPopoverVisibilityChange}
			>
				<Button type="primary" title="Show Tags" icon={<TagsOutlined />} />
			</Popover>
		);
	};

	const renderZoomButtons = (): React.ReactNode => {
		const btnZoomIn = <Button type="primary" key="btn-zoomin" title="Zoom in" icon={<PlusOutlined />} onClick={handleZoomIn} />;
		const btnZoomOut = <Button type="primary" key="bton-zoomout" title="Zoom out" icon={<MinusOutlined />} onClick={handleZoomOut} />;
		const btnCenter = <Button type="primary" key="btn-center" title="Center image" icon={<PicCenterOutlined />} onClick={handleCenter} />;
		const btnShowTags = renderTagsButton();
		const btnOpenWeb = (
			<Button type="primary" key="btn-open-web" title="Open in browser" icon={<GlobalOutlined />} onClick={handleOpenWeb} />
		);
		return <StyledControlsContainer>{[btnZoomIn, btnZoomOut, btnCenter, btnShowTags, btnOpenWeb]}</StyledControlsContainer>;
	};

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
	}, []);

	useEffect(() => {
		const viewport = viewportRef.current;
		const container = containerRef.current;
		let objectUrl = '';
		if (renderer && viewport && container) {
			dispatch(actions.system.setIsLoadingImage(true));
			const img = new Image();
			img.onload = (): void => {
				dispatch(actions.system.setIsLoadingImage(false));
				initViewport(viewport, container);
				renderer.renderImage(img);
			};
			loadImage(
				post,
				async response => {
					const buffer = new Blob([response.data]);

					objectUrl = URL.createObjectURL(buffer);
					!url.includes('webm') && (img.src = objectUrl);
				},
				response => {
					!url.includes('webm') && (img.src = response.fileUrl);
				}
			);
		}

		return (): void => {
			URL.revokeObjectURL(objectUrl);
		};
	}, [url]);

	return (
		<Container ref={containerRef} className={className}>
			{showControls && renderZoomButtons()}
			<canvas ref={viewportRef} height={1000} width={1000} />
		</Container>
	);
};

export default React.memo(ControllableImage);
