import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { Empty } from 'antd';

import { RootState } from '@store/types';
import { imageCache } from '@util/objectUrlCache';
import { previewLoader, getPreviewImageSize } from '@util/componentUtils';

interface Props {
	setImagePosition: () => void;
}

interface ImageProps {
	$loaded: boolean;
}

interface ContainerProps {
	$loading: boolean;
}

const Container = styled.div<ContainerProps>`
	z-index: 2000;
	pointer-events: none;
	position: absolute;
	box-sizing: content-box;
	${(props): string | undefined => {
		if (props.$loading)
			return `
				border: 1px solid rgb(48, 48, 48);
				background-color: rgb(20, 20, 20);
		`;
	}}
`;

const StyledHoverImage = styled.img<ImageProps>`
	z-index: 2000;
	pointer-events: none;
	display: ${(props): string => (props.$loaded ? 'block' : 'none')};
`;

const StyledEmpty = styled(Empty)`
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
`;

const PreviewImage = React.forwardRef<HTMLDivElement, Props>((props, ref) => {
	const containerRef = React.useRef<HTMLDivElement>(null);
	const imageRef = React.useRef<HTMLImageElement>(null);
	const hoveredPost = useSelector((state: RootState) => state.posts.hoveredPost);
	const [isLoading, setLoading] = React.useState(true);
	const [windowSize, setWindowSize] = React.useState({ width: 0, height: 0 });
	const [isEmpty, setEmpty] = React.useState(false);

	React.useEffect(() => {
		setWindowSize({
			width: window.innerWidth,
			height: window.innerHeight,
		});
	}, []);

	React.useEffect(() => {
		const image = imageRef.current;
		if (!ref || !image) return;
		if (typeof ref === 'function') {
			ref(containerRef.current);
		} else {
			ref.current = containerRef.current;
		}

		const cleanup = (): void => {
			image.src = '';
			setLoading(false);
			setEmpty(false);
		};

		const post = hoveredPost.post;
		const container = containerRef.current;
		if (!container || !post) return;

		const previewSize = getPreviewImageSize({ post, windowSize });
		container.style.width = `${previewSize.width}px`;
		container.style.height = `${previewSize.height}px`;
		image.style.width = `${previewSize.width}px`;
		image.style.height = `${previewSize.height}px`;
		props.setImagePosition();

		const cached = imageCache.getIfPresent(post.id);
		if (cached) {
			image.src = cached;
			return cleanup;
		}

		(async (): Promise<void> => {
			setLoading(true);
			const url = await previewLoader(post);
			if (url) {
				image.src = url;
			} else {
				setEmpty(true);
			}
		})();

		return cleanup;
	}, [hoveredPost.post, hoveredPost.visible, props, ref, windowSize]);

	return hoveredPost.visible ? (
		<Container ref={containerRef} $loading={isLoading}>
			{isEmpty && <StyledEmpty description='Preview not available' />}
			<StyledHoverImage data-testid='preview-image' ref={imageRef} $loaded={!isEmpty} />
		</Container>
	) : (
		<></>
	);
});
PreviewImage.displayName = 'PreviewImage';

export default PreviewImage;
