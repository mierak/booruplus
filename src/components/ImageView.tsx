/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import styled from 'styled-components';
import { State } from '../../store/main';
import { setActivePostIndex } from '../../store/posts';
import { setImageViewThumbnailsCollapsed } from '../../store/system';
import { Post } from '../../types/gelbooruTypes';
import ThumbnailsList from './ThumbnailsList';
import { Layout } from 'antd';
import EmptyThumbnails from './EmptyThumbnails';

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

const ImageContainer = styled.div`
	width: 100%;
	display: block;
	float: left;
	min-height: 1px;
`;

const StyledThumbnailsList = styled(ThumbnailsList)`
	max-width: 220px;
	margin: 0 0 0 7px;
`;

const ImageView: React.FunctionComponent<Props> = (props: Props) => {
	useEffect(() => {
		if (props.activePost === undefined && props.posts.length > 0) {
			props.setActivePostIndex(0);
		}
	}, []);

	const renderImage = (): JSX.Element => {
		if (props.activePost) {
			if (props.activePost.fileUrl.includes('webm')) {
				return (
					<Image as="video" key={props.activePost.id} controls autoPlay muted>
						<source src={props.activePost.fileUrl} type="video/webm" />
					</Image>
				);
			} else {
				return <Image src={props.activePost.fileUrl} />;
			}
		}
		return <EmptyThumbnails />;
	};

	return (
		<Container>
			<Layout>
				<ImageContainer>{renderImage()}</ImageContainer>
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
				<StyledThumbnailsList posts={props.posts} />
			</Layout.Sider>
		</Container>
	);
};

interface StateFromProps {
	activePost: Post | undefined;
	posts: Post[];
	thumbnailsListvisible: boolean;
}

const mapState = (state: State): StateFromProps => ({
	posts: state.posts.posts,
	activePost: state.posts.activePost,
	thumbnailsListvisible: state.system.imageViewThumbnailsCollapsed
});

const mapDispatch = {
	setActivePostIndex,
	setImageViewThumbnailsCollapsed
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(ImageView);
