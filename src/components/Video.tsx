import React, { useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { useLoadImage } from 'hooks/useImageBus';
import { AppDispatch } from 'store/types';

import { Post } from 'types/gelbooruTypes';
import { isFilenameVideo } from 'util/utils';
import { actions } from 'store/';

interface Props {
	className?: string;
	post: Post;
}

const Video: React.FunctionComponent<Props> = ({ post, className }: Props) => {
	const dispatch = useDispatch<AppDispatch>();
	const loadImage = useLoadImage();
	const videoRef = useRef<HTMLVideoElement>(null);

	const playVideo = (sourceElement: HTMLSourceElement): void => {
		if (videoRef.current) {
			videoRef.current.appendChild(sourceElement);
			videoRef.current.load();
			videoRef.current.play();
		}
	};

	useEffect(() => {
		if (videoRef.current && isFilenameVideo(post.image)) {
			const source = document.createElement('source');
			dispatch(actions.system.setIsLoadingImage(true));
			loadImage(
				post,
				(response) => {
					source.setAttribute('src', response.data);
					playVideo(source);
				},
				(response) => {
					source.setAttribute('src', response.fileUrl);
					playVideo(source);
				}
			);
		}
	}, [post]);

	return <video className={className} ref={videoRef} key={post.id} controls autoPlay loop muted />;
};

export default Video;
