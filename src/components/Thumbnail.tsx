import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import styled from 'styled-components';
import { State } from '../../store/main';
import { setActiveView } from '../../store/system';
import { setActivePost, setPostFavorite } from '../../store/posts';
import { Card } from 'antd';
import { Post } from '../../types/gelbooruTypes';
import { HeartOutlined, HeartFilled, DownloadOutlined, DeleteOutlined } from '@ant-design/icons';
import { updatePost } from '../../db/database';
import { useSaveImage } from '../../src/hooks/useImageBus';

interface Props extends PropsFromRedux {
	post: Post;
	index: number;
}

interface CardProps {
	readonly postindex: number;
	readonly activepostindex: number | undefined;
}

const StyledCard = styled(Card)<CardProps>`
	border: ${(props): false | 0 | 'dashed 1px black' | undefined =>
		props.activepostindex !== undefined && props.postindex === props.activepostindex && 'dashed 1px black'};
	width: 170px;
	height: 222px;
`;

const StyledImageContainer = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	align-content: center;
	padding: 10px;
`;

const StyledThumbnailImage = styled.img`
	max-width: 150px;
	max-height: 150px;
`;

const Thumbnail = (props: Props): React.ReactElement => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, setFavoriteState] = useState(props.post.favorite); //TODO replace this thumbnails action hack(icon refresh)
	const saveImage = useSaveImage();

	const handleThumbnailClick = (): void => {
		props.setActivePost(props.post);
		props.setActiveView('image');
	};

	const setFavorite = (favorite: 0 | 1): void => {
		props.setPostFavorite(props.post, favorite);
		updatePost(props.post);
		setFavoriteState(favorite);
	};

	const handleSave = (): void => {
		saveImage(props.post);
	};

	const renderActions = (): JSX.Element[] => {
		const arr: JSX.Element[] = [];
		if (props.post.favorite === 1) {
			arr.push(
				<HeartFilled
					key="heart-filled"
					onClick={(): void => {
						setFavorite(0);
					}}
				/>
			);
		} else {
			arr.push(
				<HeartOutlined
					key="heart-outlined"
					onClick={(): void => {
						setFavorite(1);
					}}
				/>
			);
		}
		arr.push(<DownloadOutlined key="download" onClick={handleSave} />, <DeleteOutlined key="delete" />);
		return arr;
	};

	return (
		<StyledCard
			bodyStyle={{ height: '172px', padding: '0' }}
			postindex={props.index}
			activepostindex={props.activePostIndex}
			actions={renderActions()}
		>
			<StyledImageContainer onClick={(): void => handleThumbnailClick()}>
				<StyledThumbnailImage
					src={`https://gelbooru.com/thumbnails/${props.post.directory}/thumbnail_${props.post.hash}.jpg`}
				></StyledThumbnailImage>
			</StyledImageContainer>
		</StyledCard>
	);
};

interface StateFromProps {
	activeView: string;
	activePostIndex: number | undefined;
	posts: Post[];
}

const mapState = (state: State): StateFromProps => ({
	activeView: state.system.activeView,
	activePostIndex: state.posts.activePostIndex,
	posts: state.posts.posts
});

const mapDispatch = {
	setActiveView,
	setPostFavorite,
	setActivePost
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Thumbnail);
