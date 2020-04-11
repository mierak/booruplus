import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';

import { RootState } from '../../store/types';
import { actions } from '../../store';

import { useLoadImage } from '../../src/hooks/useImageBus';
import EmptyThumbnails from './EmptyThumbnails';
import ControllableImage from './controllable-image/ControllableImage';

interface Props {
	className?: string;
}

const Container = styled.div``;

const StyledVideo = styled.video`
	max-width: 100%;
	max-height: 100vh;
	display: block;
	margin-left: auto;
	margin-right: auto;
	overflow: hidden;
`;
const StyledControllableImage = styled(ControllableImage)`
	max-width: 100%;
	max-height: 100vh;
	display: block;
	margin-left: auto;
	margin-right: auto;
	overflow: hidden;
`;

const FullSizeImage: React.FunctionComponent<Props> = (props: Props) => {
	const dispatch = useDispatch();

	const index = useSelector((state: RootState) => state.posts.activePostIndex);
	const post = useSelector((state: RootState) => (index !== undefined && state.posts.posts[index]) || undefined);

	const videoRef = useRef<HTMLVideoElement>(null);
	const [imageUrl, setImageUrl] = useState<string>('');
	const loadImage = useLoadImage();

	const setVideo = (src: string): void => {
		if (videoRef.current) {
			const source = document.createElement('source');
			source.setAttribute('src', src);
			videoRef.current.appendChild(source);
			videoRef.current.load();
			videoRef.current.play();
		}
	};

	const handleLoadResponse = (src: string, url: string): void => {
		if (url.includes('webm')) {
			setVideo(src);
		} else {
			setImageUrl(src);
		}
	};

	const onLoad = (): void => {
		dispatch(actions.system.setIsLoadingImage(false));
	};

	const renderImage = (): JSX.Element => {
		if (post) {
			if (post.fileUrl.includes('webm')) {
				return <StyledVideo ref={videoRef} key={post.id} controls autoPlay loop muted onLoad={onLoad} />;
			} else {
				return <StyledControllableImage url={imageUrl} />;
			}
		}
		return <EmptyThumbnails />;
	};

	useEffect(() => {
		if (post) {
			loadImage(
				post,
				(response) => {
					handleLoadResponse(response.data, response.post.fileUrl);
				},
				(response) => {
					handleLoadResponse(response.fileUrl, response.fileUrl);
				}
			);
			dispatch(actions.posts.incrementViewCount(post));
			dispatch(actions.system.setIsLoadingImage(true));
		}
	}, [index]);

	return (
		<Container className={props.className}>
			{renderImage()}
			{console.log('render image')}
		</Container>
	);
};

export default FullSizeImage;
