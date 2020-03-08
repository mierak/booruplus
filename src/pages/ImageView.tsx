/* eslint-disable react/prop-types */
import React, { useEffect, useState, useRef } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import styled from 'styled-components';
import { State } from '../../store/main';
import { setActivePostIndex } from '../../store/posts';
import { setImageViewThumbnailsCollapsed } from '../../store/system';
import { Post } from '../../types/gelbooruTypes';
import ThumbnailsList from './ThumbnailsList';
import { Layout } from 'antd';
import EmptyThumbnails from '../components/EmptyThumbnails';
import { useLoadImage } from '../hooks/useImageBus';
import FullSizeImage from '../components/FullSizeImage';

interface Props extends PropsFromRedux {
	className?: string;
}

const Container = styled(Layout)`
	width: 100%;
	align-items: center;
`;

const Image = styled.img`
	max-width: 100%;
	max-height: 100vh;
	display: block;
	margin-left: auto;
	margin-right: auto;
`;

const StyledThumbnailsList = styled(ThumbnailsList)`
	max-width: 220px;
	margin: 0 0 0 7px;
`;

const ImageView: React.FunctionComponent<Props> = (props: Props) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [imageUrl, setImageUrl] = useState<string>('');
	const loadImage = useLoadImage();

	useEffect(() => {
		if (props.activePost === undefined && props.posts.length > 0) {
			props.setActivePostIndex(0);
		}
	}, []);

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

	useEffect(() => {
		if (props.activePost) {
			loadImage(
				props.activePost,
				(response) => {
					handleLoadResponse(response.data, response.post.fileUrl);
				},
				(response) => {
					handleLoadResponse(response.fileUrl, response.fileUrl);
				}
			);
		}
	}, [props.activePost]);

	const renderImage = (): JSX.Element => {
		if (props.activePost) {
			if (props.activePost.fileUrl.includes('webm')) {
				return <Image as="video" ref={videoRef} key={props.activePost.id} controls autoPlay loop muted></Image>;
			} else {
				return <Image src={imageUrl} />;
			}
		}
		return <EmptyThumbnails />;
	};

	return (
		<Container>
			<Layout>
				<FullSizeImage />
			</Layout>
			<Layout.Sider
				theme="light"
				collapsible
				reverseArrow
				collapsedWidth={0}
				collapsed={!props.thumbnailsListvisible}
				onCollapse={(): void => {
					props.setImageViewThumbnailsCollapsed(!props.thumbnailsListvisible);
				}}
			>
				<StyledThumbnailsList />
			</Layout.Sider>
		</Container>
	);
};

interface StateFromProps {
	activePost: Post | undefined;
	posts: Post[];
	thumbnailsListvisible: boolean;
	activePostIndex: number | undefined;
}

const mapState = (state: State): StateFromProps => ({
	posts: state.posts.posts,
	activePost: state.posts.activePost,
	activePostIndex: state.posts.activePostIndex,
	thumbnailsListvisible: state.system.imageViewThumbnailsCollapsed
});

const mapDispatch = {
	setActivePostIndex,
	setImageViewThumbnailsCollapsed
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(React.memo(ImageView));
