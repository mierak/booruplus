import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import { actions } from '@store';
import { AppDispatch, PostsContext, RootState } from '@store/types';
import { imageLoader } from '@util/componentUtils';
import { getPostUrl } from '@service/webService';

import { IpcSendChannels } from '@appTypes/processDto';
import { ImageControl, openNotificationWithIcon } from '@appTypes/components';
import { Post } from '@appTypes/gelbooruTypes';

import LoadingMask from '@components/LoadingMask';

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
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
`;

const StyledImg = styled.img`
	max-height: 100%;
	max-width: 1005;
`;

const Gif: React.FunctionComponent<Props> = (props: Props) => {
	const dispatch = useDispatch<AppDispatch>();
	const isLoading = useSelector((state: RootState) => state.loadingStates.isFullImageLoading);
	const downloadMissingImage = useSelector((state: RootState) => state.settings.downloadMissingImages);
	const imgRef = useRef<HTMLImageElement>(null);

	const handleOpenWeb = (): void => {
		window.api.send(IpcSendChannels.OPEN_IN_BROWSER, getPostUrl(props.post.id));
	};

	const handleTagsPopoverVisibilityChange = (visible: boolean): void => {
		dispatch(actions.system.setTagsPopovervisible(visible));
	};

	const handleCopyToClipboard = (): void => {
		window.clipboard.writeText(props.post.fileUrl);
		openNotificationWithIcon('success', 'Link copied to clipboard', '');
	};

	useEffect(() => {
		dispatch(actions.loadingStates.setFullImageLoading(true));
		const ref = imgRef.current;
		if (ref) {
			let canceled = false;
			ref.onload = (): void => {
				dispatch(actions.loadingStates.setFullImageLoading(false));
			};
			ref.onerror = (): void => {
				dispatch(actions.loadingStates.setFullImageLoading(false));
				openNotificationWithIcon(
					'error',
					'Image load failed',
					'Could not load image. This could be caused by a network error or the image being deleted from the server.'
				);
			};
			const loader = imageLoader(props.post, downloadMissingImage);
			loader.then((url) => {
				if (!canceled) {
					ref.src = url;
				}
			});

			return (): void => {
				canceled = true;
			};
		}
	}, [dispatch, downloadMissingImage, props.post]);

	const imageControls: ImageControl[] = [
		{
			icon: 'tags-outlined',
			key: 'image-control-show-tags',
			tooltip: 'Show tags',
			popOver: {
				content: <TagsPopover context={props.context} tags={props.post.tags} />,
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
				dispatch(
					actions.modals.showModal(ActiveModal.ADD_POSTS_TO_FAVORITES, {
						context: props.context,
						postsToFavorite: [props.post],
					})
				);
			},
		},
	];
	return (
		<Container className={props.className}>
			<StyledImg ref={imgRef} data-testid='full-image-gif' />
			<ImageControls actions={imageControls} />
			<LoadingMask visible={isLoading} />
		</Container>
	);
};

export default Gif;
