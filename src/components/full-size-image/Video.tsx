import React, { useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';

import { loadImage } from '../../util/imageIpcUtils';
import { AppDispatch } from '../../store/types';

import { Post } from '../../types/gelbooruTypes';
import { IpcChannels } from '../../types/processDto';

import { isFilenameVideo } from '../../util/utils';
import { actions } from '../../store';
import ImageControls from './ImageControls';
import TagsPopover from './TagsPopover';
import { ImageControl } from '../../types/components';
import { getPostUrl } from '../../service/webService';

interface Props {
	className?: string;
	post: Post;
}

const Container = styled.div`
	position: relative;
`;

const StyledVideo = styled.video`
	width: 100%;
`;

const Video: React.FunctionComponent<Props> = ({ post, className }: Props) => {
	const dispatch = useDispatch<AppDispatch>();
	const videoRef = useRef<HTMLVideoElement>(null);

	const playVideo = (sourceElement: HTMLSourceElement): void => {
		if (videoRef.current) {
			videoRef.current.muted = true;
			videoRef.current.appendChild(sourceElement);
			videoRef.current.load();
			videoRef.current.play();
		}
	};

	useEffect(() => {
		if (videoRef.current && isFilenameVideo(post.image)) {
			let objectUrl = '';
			const source = document.createElement('source');
			source.setAttribute('data-testid', 'video-source');
			dispatch(actions.loadingStates.setFullImageLoading(true));
			source.onload = (): void => {
				dispatch(actions.loadingStates.setFullImageLoading(false));
			};
			loadImage(
				post,
				(response) => {
					const buffer = new Blob([response.data]);
					objectUrl = URL.createObjectURL(buffer);
					source.setAttribute('src', objectUrl);
					playVideo(source);
				},
				(response) => {
					source.setAttribute('src', response.fileUrl);
					playVideo(source);
				}
			);

			return (): void => {
				URL.revokeObjectURL(objectUrl);
			};
		}
	}, [dispatch, post]);

	const handleOpenWeb = (): void => {
		window.api.send(IpcChannels.OPEN_IN_BROWSER, getPostUrl(post.id));
	};

	const handleTagsPopoverVisibilityChange = (visible: boolean): void => {
		dispatch(actions.system.setTagsPopovervisible(visible));
	};

	const imageControls: ImageControl[] = [
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

	return (
		<Container className={className}>
			<StyledVideo ref={videoRef} key={post.id} controls autoPlay loop aria-label='video' />
			<ImageControls actions={imageControls} />
		</Container>
	);
};

export default Video;
