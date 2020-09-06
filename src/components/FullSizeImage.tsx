import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';

import { RootState } from '@store/types';
import { thunks } from '@store';

import { isFilenameVideo, getImageExtensionFromFilename } from '@util/utils';

import EmptyThumbnails from './EmptyThumbnails';
import ControllableImage from './full-size-image/controllable-image/ControllableImage';
import Video from './full-size-image/Video';
import Gif from './full-size-image/Gif';

interface Props {
	className?: string;
}

const Container = styled.div`
	height: 100%;
`;

const StyledControllableImage = styled(ControllableImage)`
	position: relative;
	max-width: 100%;
	max-height: 100vh;
	display: block;
	margin-left: auto;
	margin-right: auto;
	overflow: hidden;
`;

const StyledVideo = styled(Video)`
	max-width: 100%;
	max-height: 100vh;
	display: flex;
	height: 100%;
	margin-left: auto;
	margin-right: auto;
	overflow: hidden;
`;

const StyledGif = styled(Gif)`
	max-width: 100%;
	max-height: 100vh;
	margin-left: auto;
	margin-right: auto;
	overflow: hidden;
	height: 100%;
`;

const StyledEmptyThumbnails = styled(EmptyThumbnails)`
	&& {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
	}
`;

const FullSizeImage: React.FunctionComponent<Props> = (props: Props) => {
	const dispatch = useDispatch();

	const index = useSelector((state: RootState) => state.posts.activePostIndex);
	const post = useSelector((state: RootState) => (index !== undefined && state.posts.posts[index]) || undefined);

	const renderImage = (): JSX.Element => {
		if (post) {
			if (isFilenameVideo(post.image)) {
				return <StyledVideo post={post} />;
			} else if (getImageExtensionFromFilename(post.image) === 'gif') {
				return <StyledGif post={post} />;
			} else {
				return <StyledControllableImage post={post} showControls />;
			}
		}
		return <StyledEmptyThumbnails />;
	};

	useEffect(() => {
		if (post) {
			dispatch(thunks.posts.incrementViewCount(post));
		}
	}, [dispatch, index, post]);

	return <Container className={props.className}>{renderImage()}</Container>;
};

export default FullSizeImage;
