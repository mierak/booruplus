import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import { actions } from '../../store';
import { RootState, PostPropertyOptions, AppDispatch } from '../../store/types';

import { Card, Popconfirm, notification, Tooltip, Spin } from 'antd';
import {
	HeartOutlined,
	HeartFilled,
	DownloadOutlined,
	DeleteOutlined,
	CheckCircleTwoTone,
	LoadingOutlined,
	PlusOutlined
} from '@ant-design/icons';
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
	const dispatch = useDispatch<AppDispatch>();

	const searchMode = useSelector((state: RootState) => state.system.searchMode);
	const activeView = useSelector((state: RootState) => state.system.activeView);
	const post = useSelector((state: RootState) =>
		props.index >= 0 && props.index < state.posts.posts.length ? state.posts.posts[props.index] : undefined
	);
	const isActive = useSelector((state: RootState) => props.index === state.posts.activePostIndex);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, setFavoriteState] = useState(post && post.favorite); //TODO replace this thumbnails action hack(icon refresh)
	const [loaded, setLoaded] = useState(true);

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
				dispatch(actions.posts.setPostSelected({ post: post, selected: !post.selected }));
			}
		} else {
			dispatch(actions.posts.setActivePostIndex(props.index));
			activeView !== 'image' && dispatch(actions.system.setActiveView('image'));
		}
	};

	const handleFavorite = (): void => {
		if (post) {
			const options: PostPropertyOptions = { favorite: 1, blacklisted: 0 };
			dispatch(actions.posts.changePostProperties(post, options));
			const description = 'Post succesfuly added to favorites.';
			openNotificationWithIcon('success', 'Post updated', description);
		}
	};

	const handleRemoveFavorite = (): void => {
		if (post) {
			const options: PostPropertyOptions = { favorite: 0 };
			dispatch(actions.posts.changePostProperties(post, options));
			const description = 'Post successfuly removed from favorites.';
			openNotificationWithIcon('success', 'Post updated', description);
		}
	};

	const handleSave = (): void => {
		if (post) {
			dispatch(actions.posts.downloadPost(post));
			openNotificationWithIcon('success', 'Post downloaded', 'Image was successfuly saved to disk.');
		}
	};

	const renderWithTooltip = (element: JSX.Element, text: string, key: string): JSX.Element => {
		return (
			<Tooltip title={text} key={key}>
				{element}
			</Tooltip>
		);
	};

	const handleBlacklistClick = (): void => {
		if (post) {
			dispatch(actions.posts.blacklistPost(post));
			openNotificationWithIcon('success', 'Post deleted', 'Image was successfuly deleted from disk.');
		}
	};

	const renderActions = (): JSX.Element[] => {
		const favorite = renderWithTooltip(
			<HeartFilled key="heart-filled" onClick={handleRemoveFavorite} />,
			'Remove from favorites',
			'heart-filled'
		);
		const notFavorite = renderWithTooltip(
			<HeartOutlined key="heart-outlined" onClick={handleFavorite} />,
			'Add to favorites',
			'heart-outlined'
		);
		const download = renderWithTooltip(<DownloadOutlined key="download" onClick={handleSave} />, 'Download post image', 'download');
		const blackist = renderWithTooltip(
			<Popconfirm title="Are you sure you want to blacklist this image?" onConfirm={handleBlacklistClick}>
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

		if (searchMode === 'saved-search-offline' || searchMode === 'saved-search-online') {
			arr.push(
				renderWithTooltip(
					<PlusOutlined
						key="preview"
						// TODO Add confirmation of adding, add posibility to delete preview, change icon
						onClick={(): void => {
							post &&
								dispatch(
									actions.savedSearches.addPreviewToActiveSavedSearch(
										`https://gelbooru.com/thumbnails/${post.directory}/thumbnail_${post.hash}.jpg`
									)
								);
						}}
					/>,
					'Add post as Saved Search preview',
					'add-preview'
				)
			);
		}
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

export default React.memo(Thumbnail);
