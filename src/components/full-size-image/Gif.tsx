import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import { actions } from '../../store';
import { AppDispatch, RootState } from '../../store/types';

import { IpcChannels } from '../../types/processDto';
import { Post } from '../../types/gelbooruTypes';
import TagsPopover from './TagsPopover';
import { ImageControl } from '../../types/components';
import ImageControls from './ImageControls';
import { getPostUrl } from '../../service/webService';
import LoadingMask from '../LoadingMask';
import { imageLoader } from '../../util/componentUtils';

interface Props {
	className?: string;
	post: Post;
}

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
		window.api.send(IpcChannels.OPEN_IN_BROWSER, getPostUrl(props.post.id));
	};

	const handleTagsPopoverVisibilityChange = (visible: boolean): void => {
		dispatch(actions.system.setTagsPopovervisible(visible));
	};

	useEffect(() => {
		dispatch(actions.loadingStates.setFullImageLoading(true));
		const ref = imgRef.current;
		if (ref) {
			ref.onload = (): void => {
				dispatch(actions.loadingStates.setFullImageLoading(false));
			};
			const loader = imageLoader(props.post, downloadMissingImage);
			loader.url.then((url) => {
				ref.src = url;
			});

			return (): void => {
				loader.cleanup();
			};
		}
	}, [dispatch, downloadMissingImage, props.post]);

	const imageControls: ImageControl[] = [
		{
			icon: 'tags-outlined',
			key: 'image-control-show-tags',
			tooltip: 'Show tags',
			popOver: {
				content: <TagsPopover tags={props.post.tags} />,
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
		<Container className={props.className}>
			<StyledImg ref={imgRef} data-testid='full-image-gif' />
			<ImageControls actions={imageControls} />
			<LoadingMask visible={isLoading} />
		</Container>
	);
};

export default Gif;
