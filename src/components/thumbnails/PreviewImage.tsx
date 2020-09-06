import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { debounce } from 'lodash';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin, Empty } from 'antd';

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

const StyledSpin = styled(Spin)`
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
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
	const [isLoaded, setLoaded] = React.useState(false);
	const [isLoading, setLoading] = React.useState(false);
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

		let isCanceled = false;
		const cleanup = (db?: ReturnType<typeof debounce>): void => {
			db && db.cancel();
			image.src = '';
			isCanceled = true;
			setLoaded(false);
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
			setLoaded(true);
			return cleanup;
		}

		const db = debounce(async () => {
			setLoading(true);
			const url = await previewLoader(post);
			if (url) {
				image.src = url;
				image.onload = (): void => {
					if (!isCanceled) {
						setLoaded(true);
					}
				};
			} else {
				setEmpty(true);
				setLoaded(true);
			}
		}, 500);
		db();

		return (): void => cleanup(db);
	}, [hoveredPost.post, hoveredPost.visible, props, ref, windowSize]);

	return hoveredPost.visible ? (
		<Container ref={containerRef} $loading={isLoading}>
			{!isLoaded && isLoading && <StyledSpin indicator={<LoadingOutlined style={{ fontSize: '64px' }} />} />}
			{isLoaded && isEmpty && <StyledEmpty description='Preview not available' />}
			<StyledHoverImage data-testid='preview-image' ref={imageRef} $loaded={isLoaded && !isEmpty} />
		</Container>
	) : (
		<></>
	);
});
PreviewImage.displayName = 'PreviewImage';

export default PreviewImage;
