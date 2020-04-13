import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';

import { RootState } from '../../store/types';
import { actions } from '../../store';

import { isFilenameVideo } from 'util/utils';

import EmptyThumbnails from './EmptyThumbnails';
import ControllableImage from './controllable-image/ControllableImage';
import Video from './Video';

interface Props {
	className?: string;
}

const Container = styled.div``;

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
	display: block;
	margin-left: auto;
	margin-right: auto;
	overflow: hidden;
`;

const FullSizeImage: React.FunctionComponent<Props> = (props: Props) => {
	const dispatch = useDispatch();

	const index = useSelector((state: RootState) => state.posts.activePostIndex);
	const post = useSelector((state: RootState) => (index !== undefined && state.posts.posts[index]) || undefined);

	const renderImage = (): JSX.Element => {
		if (post) {
			if (isFilenameVideo(post.image)) {
				return <StyledVideo post={post} />;
			} else {
				return <StyledControllableImage url={post.fileUrl} post={post} showControls />;
			}
		}
		return <EmptyThumbnails />;
	};

	useEffect(() => {
		if (post) {
			dispatch(actions.posts.incrementViewCount(post));
			dispatch(actions.system.setIsLoadingImage(true));
		}
	}, [index]);

	return <Container className={props.className}>{renderImage()}</Container>;
};

export default FullSizeImage;
