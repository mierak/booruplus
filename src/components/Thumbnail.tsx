/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { RootState } from '../../store/main';
import { setActiveView } from '../../store/system';
import { setActivePostIndex, changePostProperties, setPostSelected } from '../../store/posts';
import { Card, Popconfirm, notification, Tooltip, Spin } from 'antd';
import { HeartOutlined, HeartFilled, DownloadOutlined, DeleteOutlined, CheckCircleTwoTone, LoadingOutlined } from '@ant-design/icons';
import { useSaveImage, useDeleteImage } from '../../src/hooks/useImageBus';
import { IconType } from 'antd/lib/notification';

interface Props {
	index: number;
}

interface CardProps {
	readonly postindex: number;
	readonly isactive: string;
}

interface SelectedIndexes {
	first: number | undefined;
	last: number | undefined;
}

const StyledCard = styled(Card)<CardProps>`
	border: ${(props): false | 0 | 'dashed 1px black' | undefined => props.isactive === 'true' && 'dashed 1px black'};
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
	const activeView = useSelector((state: RootState) => state.system.activeView);
	const post = useSelector((state: RootState) =>
		props.index >= 0 && props.index < state.posts.posts.length ? state.posts.posts[props.index] : undefined
	);
	const isActive = useSelector((state: RootState) => props.index === state.posts.activePostIndex);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, setFavoriteState] = useState(post && post.favorite); //TODO replace this thumbnails action hack(icon refresh)
	const [loaded, setLoaded] = useState(true);
	const saveImageToDisk = useSaveImage();
	const deleteImageFromDisk = useDeleteImage();
	const dispatch = useDispatch();

	const openNotificationWithIcon = (type: IconType, title: string, description: string, duration?: number): void => {
		notification[type]({
			message: title,
			description: description,
			duration: duration ? duration : 2
		});
	};

	const handleThumbnailClick = (event: React.MouseEvent): void => {
		if (event.ctrlKey) {
			if (post) {
				dispatch(setPostSelected({ post: post, selected: !post.selected }));
			}
		} else {
			dispatch(setActivePostIndex(props.index));
			activeView !== 'image' && dispatch(setActiveView('image'));
		}
	};

	const setFavorite = (favorite: 0 | 1): void => {
		if (post) {
			dispatch(changePostProperties(post, { favorite }));
			const description = favorite === 1 ? 'Post succesfuly added to favorites.' : 'Post successfuly removed from favorites.';
			openNotificationWithIcon('success', 'Post updated', description);
		}
	};

	const handleSave = (): void => {
		if (post) {
			saveImageToDisk(post);
			dispatch(changePostProperties(post, { downloaded: 1 }));
			openNotificationWithIcon('success', 'Post downloaded', 'Image was successfuly saved to disk.');
		}
	};

	const handleDelete = (): void => {
		if (post) {
			deleteImageFromDisk(post);
			dispatch(changePostProperties(post, { favorite: 0, blacklisted: 1 }));
			openNotificationWithIcon('success', 'Post deleted', 'Image was successfuly deleted from disk.');
		}
	};

	const renderWithTooltip = (element: JSX.Element, text: string, key: string): JSX.Element => {
		return (
			<Tooltip title={text} key={key}>
				{element}
			</Tooltip>
		);
	};

	const renderActions = (): JSX.Element[] => {
		const favorite = renderWithTooltip(
			<HeartFilled
				key="heart-filled"
				onClick={(): void => {
					post && setFavorite(0);
				}}
			/>,
			'Remove from favorites',
			'heart-filled'
		);
		const notFavorite = renderWithTooltip(
			<HeartOutlined
				key="heart-outlined"
				onClick={(): void => {
					post && setFavorite(1);
				}}
			/>,
			'Add to favorites',
			'heart-outlined'
		);
		const download = renderWithTooltip(
			<DownloadOutlined key="download" onClick={(): void => post && handleSave()} />,
			'Download post image',
			'download'
		);
		const blackist = renderWithTooltip(
			<Popconfirm title="Are you sure you want to blacklist this image?" onConfirm={(): void => post && handleDelete()}>
				<DeleteOutlined key="delete" />
			</Popconfirm>,
			'Blacklist post',
			'delete'
		);
		const arr: JSX.Element[] = [];
		if (post && post.favorite === 1) {
			arr.push(favorite);
		} else {
			arr.push(notFavorite);
		}
		arr.push(download, blackist);
		return arr;
	};

	return (
		<StyledCard
			bodyStyle={{ height: '172px', width: '170px', padding: '0' }}
			postindex={props.index}
			isactive={isActive.toString()}
			actions={renderActions()}
			hoverable
		>
			<StyledImageContainer onClick={(event: React.MouseEvent): void => handleThumbnailClick(event)}>
				{post && post.selected ? (
					<CheckCircleTwoTone style={{ fontSize: '20px', position: 'absolute', top: '5px', right: '5px' }} />
				) : (
					<></>
				)}
				{post && (
					<StyledThumbnailImage
						src={`https://gelbooru.com/thumbnails/${post.directory}/thumbnail_${post.hash}.jpg`}
						style={{ display: loaded ? 'block' : 'none' }}
						onLoad={(): void => setLoaded(true)}
						onLoadStart={(): void => setLoaded(false)}
					></StyledThumbnailImage>
				)}
				{!loaded && <Spin indicator={<LoadingOutlined style={{ fontSize: '32px' }} />} />}
			</StyledImageContainer>
		</StyledCard>
	);
};

export default Thumbnail;
