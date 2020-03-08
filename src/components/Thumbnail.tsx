import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import styled from 'styled-components';
import { State } from '../../store/main';
import { setActiveView } from '../../store/system';
import { setActivePostIndex, setPostFavorite, removePost, setPostBlacklisted, setPosts, setPostSelected } from '../../store/posts';
import { Card, Popconfirm, notification, Tooltip } from 'antd';
import { Post } from '../../types/gelbooruTypes';
import { HeartOutlined, HeartFilled, DownloadOutlined, DeleteOutlined, CheckCircleTwoTone } from '@ant-design/icons';
import { updatePostInDb } from '../../db/database';
import { useSaveImage, useDeleteImage } from '../../src/hooks/useImageBus';
import { IconType } from 'antd/lib/notification';

interface OwnProps {
	index: number;
}

interface Props extends PropsFromRedux, OwnProps {}

interface CardProps {
	readonly postindex: number;
	readonly activepostindex: number | undefined;
}

interface SelectedIndexes {
	first: number | undefined;
	last: number | undefined;
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
	const saveImageToDisk = useSaveImage();
	const deleteImageFromDisk = useDeleteImage();

	const openNotificationWithIcon = (type: IconType, title: string, description: string, duration?: number): void => {
		notification[type]({
			message: title,
			description: description,
			duration: duration ? duration : 2
		});
	};

	const handleThumbnailClick = (event: React.MouseEvent): void => {
		if (event.ctrlKey) {
			// props.post.selected = !props.post.selected;
			const post = props.post;
			post.selected = !post.selected;
			props.setPostSelected(post, post.selected);
		} else {
			props.setActivePostIndex(props.index);
			props.activeView !== 'image' && props.setActiveView('image');
		}
	};

	const setFavorite = (favorite: 0 | 1): void => {
		const post = props.post;
		post.favorite = favorite;
		props.setPostFavorite(props.post, favorite);
		updatePostInDb(post);
		setFavoriteState(favorite);
		const description = favorite === 1 ? 'Post succesfuly added to favorites.' : 'Post successfuly removed from favorites.';
		openNotificationWithIcon('success', 'Post updated', description);
	};

	const handleSave = (): void => {
		saveImageToDisk(props.post);
		openNotificationWithIcon('success', 'Post downloaded', 'Image was successfuly saved to disk.');
	};

	const handleDelete = (): void => {
		const post = props.post;
		post.blacklisted = 1;
		post.favorite = 0;
		deleteImageFromDisk(props.post);
		setFavoriteState(0);
		props.removePost(post);
		updatePostInDb(post);
		openNotificationWithIcon('success', 'Post deleted', 'Image was successfuly deleted from disk.');
	};

	const renderWithTooltip = (element: JSX.Element, text: string): JSX.Element => {
		return <Tooltip title={text}>{element}</Tooltip>;
	};

	const renderActions = (): JSX.Element[] => {
		const favorite = renderWithTooltip(
			<HeartFilled
				key="heart-filled"
				onClick={(): void => {
					setFavorite(0);
				}}
			/>,
			'Remove from favorites'
		);
		const notFavorite = renderWithTooltip(
			<HeartOutlined
				key="heart-outlined"
				onClick={(): void => {
					setFavorite(1);
				}}
			/>,
			'Add to favorites'
		);
		const download = renderWithTooltip(<DownloadOutlined key="download" onClick={handleSave} />, 'Download post image');
		const blackist = renderWithTooltip(
			<Popconfirm title="Are you sure you want to blacklist this image?" onConfirm={handleDelete}>
				<DeleteOutlined key="delete" />
			</Popconfirm>,
			'Blacklist post'
		);
		const arr: JSX.Element[] = [];
		if (props.post.favorite === 1) {
			arr.push(favorite);
		} else {
			arr.push(notFavorite);
		}
		arr.push(download, blackist);
		return arr;
	};

	return (
		<StyledCard
			bodyStyle={{ height: '172px', padding: '0' }}
			postindex={props.index}
			activepostindex={props.activePostIndex}
			actions={renderActions()}
			hoverable
		>
			<StyledImageContainer onClick={(event: React.MouseEvent): void => handleThumbnailClick(event)}>
				{props.post.selected ? <CheckCircleTwoTone style={{ fontSize: '20px', position: 'absolute', top: '5px', right: '5px' }} /> : <></>}
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
	post: Post;
}

const mapState = (state: State, ownProps: OwnProps): StateFromProps => ({
	activeView: state.system.activeView,
	activePostIndex: state.posts.activePostIndex,
	post: state.posts.posts[ownProps.index]
});

const mapDispatch = {
	setActiveView,
	setPostFavorite,
	setActivePostIndex,
	removePost,
	setPostBlacklisted,
	setPosts,
	setPostSelected
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Thumbnail);
