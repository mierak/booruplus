import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { RootState } from '../../store/types';
import { useLoadImage } from '../../src/hooks/useImageBus';
import EmptyThumbnails from './EmptyThumbnails';

interface Props {
	className?: string;
}

const Container = styled.div``;

const Image = styled.img`
	max-width: 100%;
	max-height: 100vh;
	display: block;
	margin-left: auto;
	margin-right: auto;
`;

const FullSizeImage: React.FunctionComponent<Props> = (props: Props) => {
	const post = useSelector(
		(state: RootState) => (state.posts.activePostIndex !== undefined && state.posts.posts[state.posts.activePostIndex]) || undefined
	);
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

	const renderImage = (): JSX.Element => {
		if (post) {
			if (post.fileUrl.includes('webm')) {
				return <Image as="video" ref={videoRef} key={post.id} controls autoPlay loop muted></Image>;
			} else {
				return <Image src={imageUrl} />;
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
		}
	}, [post]);

	return <Container className={props.className}>{renderImage()}</Container>;
};

export default FullSizeImage;
