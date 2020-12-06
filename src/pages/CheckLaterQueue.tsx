import React from 'react';
import { useDispatch } from 'react-redux';
import { Menu } from 'antd';
import {
	DownloadOutlined,
	HeartOutlined,
	DeleteOutlined,
	EyeOutlined,
	CheckSquareOutlined,
	CloseOutlined,
} from '@ant-design/icons';

import { AppDispatch, PostsContext } from '@store/types';
import ThumbnailsList from '@components/thumbnails/ThumbnailsList';
import { Post } from '@appTypes/gelbooruTypes';
import { ActiveModal } from '@appTypes/modalTypes';
import { actions, thunks } from '@store/';
import { CardAction, openNotificationWithIcon } from '@appTypes/components';
import styled from 'styled-components';
import PageMenuHeader from '@components/common/PageMenuHeader';

const Container = styled.div``;
const context: PostsContext = 'checkLaterQueue';

const HeaderMenu: React.FunctionComponent = () => {
	const dispatch = useDispatch<AppDispatch>();

	const downloadAll = (): void => {
		dispatch(thunks.posts.downloadAllPosts({ context }));
	};
	const downloadSelected = (): void => {
		dispatch(thunks.posts.downloadSelectedPosts({ context }));
	};
	const favoriteAll = (): void => {
		dispatch(
			actions.modals.showModal({
				modal: ActiveModal.ADD_POSTS_TO_FAVORITES,
				modalState: {
					[ActiveModal.ADD_POSTS_TO_FAVORITES]: {
						context,
						type: 'all',
					},
				},
			})
		);
	};
	const favoriteSelected = (): void => {
		dispatch(
			actions.modals.showModal({
				modal: ActiveModal.ADD_POSTS_TO_FAVORITES,
				modalState: {
					[ActiveModal.ADD_POSTS_TO_FAVORITES]: {
						context,
						type: 'selected',
					},
				},
			})
		);
	};
	const blacklistAll = (): void => {
		dispatch(thunks.posts.blacklistAllPosts({ context }));
	};
	const blacklistSelected = (): void => {
		dispatch(thunks.posts.blacklistSelectedPosts({ context }));
	};
	const clear = (): void => {
		dispatch(actions.posts.setPosts({ context, data: [] }));
		dispatch(actions.system.setActiveView('dashboard'));
	};
	return (
		<Menu mode='horizontal' forceSubMenuRender selectedKeys={[]}>
			<Menu.SubMenu title='Download' icon={<DownloadOutlined />}>
				<Menu.Item onClick={downloadAll} icon={<EyeOutlined />}>
					All
				</Menu.Item>
				<Menu.Item onClick={downloadSelected} icon={<CheckSquareOutlined />}>
					Selected
				</Menu.Item>
			</Menu.SubMenu>
			<Menu.SubMenu title='Add to Favorites' icon={<HeartOutlined />}>
				<Menu.Item onClick={favoriteAll} icon={<EyeOutlined />}>
					All
				</Menu.Item>
				<Menu.Item onClick={favoriteSelected} icon={<CheckSquareOutlined />}>
					Selected
				</Menu.Item>
			</Menu.SubMenu>
			<Menu.SubMenu title='Blacklist' icon={<DeleteOutlined />}>
				<Menu.Item onClick={blacklistAll} icon={<EyeOutlined />}>
					All
				</Menu.Item>
				<Menu.Item onClick={blacklistSelected} icon={<CheckSquareOutlined />}>
					Selected
				</Menu.Item>
			</Menu.SubMenu>
			<Menu.Item icon={<CloseOutlined />} onClick={clear}>
				Clear
			</Menu.Item>
		</Menu>
	);
};

const CheckLaterQueue: React.FunctionComponent = () => {
	const dispatch = useDispatch<AppDispatch>();

	const handleFavorite = (post: Post): void => {
		dispatch(
			actions.modals.showModal({
				modal: ActiveModal.ADD_POSTS_TO_FAVORITES,
				modalState: { [ActiveModal.ADD_POSTS_TO_FAVORITES]: { postIdsToFavorite: [post.id] } },
			})
		);
		dispatch(actions.modals.addToFavoritesModal.setPostIds([post.id]));
	};

	const handleBlacklist = (post: Post): void => {
		dispatch(thunks.posts.blacklistPosts({ context, posts: [post] }));
		openNotificationWithIcon('success', 'Post deleted', 'Image was successfuly deleted from disk.');
	};

	const handleDownload = async (post: Post): Promise<void> => {
		await dispatch(thunks.posts.downloadPost({ context, post }));
		openNotificationWithIcon('success', 'Post downloaded', 'Image was successfuly saved to disk.');
	};

	const handleRemoveFromQueue = (post: Post): void => {
		dispatch(actions.posts.removePosts({ context, data: post }));
	};

	const thumbnailActions: CardAction[] = [
		{
			key: 'card-action-add-to-favorites',
			tooltip: 'Add to favorites',
			icon: 'heart-outlined',
			onClick: handleFavorite,
		},
		{
			key: 'card-action-download',
			tooltip: 'Download post image',
			icon: 'download-outlined',
			onClick: handleDownload,
			condition: (post: Post): boolean => post.downloaded === 0,
		},
		{
			key: 'card-action-blacklist',
			tooltip: 'Blacklist',
			icon: 'delete-outlined',
			onClick: handleBlacklist,
			popConfirm: {
				okText: 'Blacklist',
				cancelText: 'Cancel',
				title: 'Blacklist image?',
			},
		},
		{
			key: 'card-action-remove',
			tooltip: 'Remove from Queue',
			icon: 'close-outlined',
			onClick: handleRemoveFromQueue,
		},
	];

	return (
		<Container>
			<PageMenuHeader menu={<HeaderMenu />} title='Your Queue' />
			<ThumbnailsList emptyDataLogoCentered context={context} actions={thumbnailActions} />
		</Container>
	);
};

export default CheckLaterQueue;
