import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';

import { actions } from '../../store';
import { AppDispatch } from '../../store/types';

import { IpcChannels } from '../../types/processDto';
import { Post } from '../../types/gelbooruTypes';
import TagsPopover from './TagsPopover';
import { ImageControl } from '../../types/components';
import ImageControls from './ImageControls';
import { useLoadImage } from '../../hooks/useImageBus';
import { getPostUrl } from '../../service/webService';

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
	const loadImage = useLoadImage();
	const imgRef = useRef<HTMLImageElement>(null);

	const [url, setUrl] = useState('');

	const handleOpenWeb = (): void => {
		window.api.send(IpcChannels.OPEN_IN_BROWSER, getPostUrl(props.post.id));
	};

	const handleTagsPopoverVisibilityChange = (visible: boolean): void => {
		dispatch(actions.system.setTagsPopovervisible(visible));
	};

	useEffect(() => {
		let objectUrl = '';
		dispatch(actions.loadingStates.setFullImageLoading(true));
		if (imgRef.current) {
			imgRef.current.onload = (): void => {
				dispatch(actions.loadingStates.setFullImageLoading(false));
			};
		}
		loadImage(
			props.post,
			(response) => {
				const buffer = new Blob([response.data]);
				objectUrl = URL.createObjectURL(buffer);
				setUrl(objectUrl);
			},
			(response) => {
				setUrl(response.fileUrl);
			}
		);

		return (): void => {
			URL.revokeObjectURL(objectUrl);
		};
	}, [props.post]);

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
			<StyledImg src={url} ref={imgRef} data-testid='full-image-gif' />
			<ImageControls actions={imageControls} />
		</Container>
	);
};

export default Gif;
