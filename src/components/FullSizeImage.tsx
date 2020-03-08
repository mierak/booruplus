/* eslint-disable react/prop-types */
import React, { useEffect, useState, useRef } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { State } from '../../store/main';
import styled from 'styled-components';
import { useLoadImage } from '../../src/hooks/useImageBus';
import { Post } from '../../types/gelbooruTypes';
import EmptyThumbnails from './EmptyThumbnails';

interface OwnProps {
	className?: string;
}

interface Props extends PropsFromRedux, OwnProps {}

const Container = styled.div``;

const Image = styled.img`
	max-width: 100%;
	max-height: 100vh;
	display: block;
	margin-left: auto;
	margin-right: auto;
`;

const FullSizeImage: React.FunctionComponent<Props> = (props: Props) => {
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
		if (props.post) {
			if (props.post.fileUrl.includes('webm')) {
				return <Image as="video" ref={videoRef} key={props.post.id} controls autoPlay loop muted></Image>;
			} else {
				return <Image src={imageUrl} />;
			}
		}
		return <EmptyThumbnails />;
	};

	useEffect(() => {
		if (props.post) {
			loadImage(
				props.post,
				(response) => {
					handleLoadResponse(response.data, response.post.fileUrl);
				},
				(response) => {
					handleLoadResponse(response.fileUrl, response.fileUrl);
				}
			);
		}
	}, [props.post]);

	return <Container className={props.className}>{renderImage()}</Container>;
};

interface StateFromProps {
	post: Post | undefined;
}

const mapState = (state: State): StateFromProps => ({
	post: state.posts.activePost
});

const mapDispatch = {};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(FullSizeImage);
