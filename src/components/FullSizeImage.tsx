import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch, Selector } from 'react-redux';
import styled from 'styled-components';

import { RootState } from '../../store/types';
import { actions } from '../../store';

import { useLoadImage } from '../../src/hooks/useImageBus';
import EmptyThumbnails from './EmptyThumbnails';
import { createSelector } from '@reduxjs/toolkit';
import { Post } from '../../types/gelbooruTypes';

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

// const indexSelector: Selector<RootState, number | undefined> = (state: RootState): number | undefined => state.posts.activePostIndex;
// const postsSelector: Selector<RootState, Post[]> = (state: RootState): Post[] => state.posts.posts;

// const selector = createSelector<RootState, number | undefined, Post[], Post | undefined>(indexSelector, postsSelector, (index, posts) =>
// 	index ? posts[index] : undefined
// );

const FullSizeImage: React.FunctionComponent<Props> = (props: Props) => {
	const dispatch = useDispatch();

	const index = useSelector((state: RootState) => state.posts.activePostIndex);
	const post = useSelector((state: RootState) => (index !== undefined && state.posts.posts[index]) || undefined);

	// const post = useSelector(selector);

	// const isLoadingImage = useSelector((state: RootState) => state.system.isLoadingImage);
	const isLoadingImage = false;

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
				return (
					<Image
						as="video"
						ref={videoRef}
						key={post.id}
						controls
						autoPlay
						loop
						muted
						onLoad={onLoad}
						style={{ display: isLoadingImage ? 'hidden' : 'block' }}
					></Image>
				);
			} else {
				return <Image src={imageUrl} onLoad={onLoad} style={{ display: isLoadingImage ? 'hidden' : 'block' }} />;
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
			dispatch(actions.posts.incrementViewCount(post)); // TODO not incrementing because post is not updated in redux store, find a way to update post in store without rerendering fullsizeimage
			dispatch(actions.system.setIsLoadingImage(true));
			console.log('useEffect');
		}
	}, [index]);

	return (
		<Container className={props.className}>
			{/* {isLoadingImage && <div>LOADING DOPICE</div> && console.log('hue')} */}
			{console.log(index)}
			{console.log(post)}
			{renderImage()}
		</Container>
	);
};

export default FullSizeImage;
