import React, { useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import { AppDispatch, RootState, PostsContext } from '@store/types';

import { Post } from '@appTypes/gelbooruTypes';
import { IpcSendChannels } from '@appTypes/processDto';
import { ImageControl, openNotificationWithIcon } from '@appTypes/components';

import { isFilenameVideo } from '@util/utils';
import { actions } from '@store';
import { getPostUrl } from '@service/webService';
import { imageLoader } from '@util/componentUtils';

import TagsPopover from './TagsPopover';
import ImageControls from './ImageControls';
import { ActiveModal } from '@appTypes/modalTypes';

type Props = {
	className?: string;
	post: Post;
	context: PostsContext | string;
};

const Container = styled.div`
	position: relative;
`;

const StyledVideo = styled.video`
	width: 100%;
`;

const Video: React.FunctionComponent<Props> = ({ post, className, context }: Props) => {
	const dispatch = useDispatch<AppDispatch>();
	const videoRef = useRef<HTMLVideoElement>(null);
	const downloadMissingImage = useSelector((state: RootState) => state.settings.downloadMissingImages);

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
			let canceled = false;
			const source = document.createElement('source');
			source.setAttribute('data-testid', 'video-source');
			dispatch(actions.loadingStates.setFullImageLoading(true));
			source.onload = (): void => {
				dispatch(actions.loadingStates.setFullImageLoading(false));
			};
			const loader = imageLoader(post, downloadMissingImage);
			loader.then((result) => {
				if (!canceled) {
					source.setAttribute('src', result);
					playVideo(source);
				}
			});

			return (): void => {
				canceled = true;
			};
		}
	}, [dispatch, downloadMissingImage, post]);

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
		{
			icon: 'heart-outlined',
			key: 'add-to-favorites',
			tooltip: 'Add to favorites',
			onClick: () => {
				dispatch(actions.modals.showModal(ActiveModal.ADD_POSTS_TO_FAVORITES, { context, postsToFavorite: [post] }));
			},
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
