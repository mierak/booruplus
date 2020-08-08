import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Layout } from 'antd';

import { actions, thunks } from '../store';
import ThumbnailsList from '../components/thumbnails/ThumbnailsList';

import SiderContent from '../components/favorites/SiderContent';
import { Post } from '../types/gelbooruTypes';
import { RootState, AppDispatch } from '../store/types';
import { CardAction, openNotificationWithIcon } from '../types/components';

interface Props {
	className?: string;
}

const Container = styled.div``;

const StyledContent = styled(Layout.Content)`
	height: 100vh;
`;

const Favorites: React.FunctionComponent<Props> = (props: Props) => {
	const dispatch = useDispatch<AppDispatch>();

	const activeDirectory = useSelector((state: RootState) => state.favorites.activeNodeKey);

	useEffect(() => {
		const renderThumbnailList = async (): Promise<void> => {
			dispatch(actions.favorites.setActiveNodeKey(1));
			dispatch(thunks.favorites.fetchPostsInDirectory(1));
		};
		renderThumbnailList();
		dispatch(actions.system.setSearchMode('favorites'));
	}, [dispatch]);

	const handleBlacklist = (post: Post): void => {
		dispatch(thunks.posts.blacklistPosts([post]));
		openNotificationWithIcon('success', 'Post deleted', 'Image was successfuly deleted from disk.');
	};

	const handleDownload = (post: Post): void => {
		dispatch(thunks.posts.downloadPost({ post }));
		openNotificationWithIcon('success', 'Post downloaded', 'Image was successfuly saved to disk.');
	};

	const handleRemoveFromDirectory = async (post: Post): Promise<void> => {
		await dispatch(thunks.favorites.removePostsFromActiveDirectory([post.id]));
		await dispatch(thunks.favorites.fetchPostsInDirectory(activeDirectory)); // TODO change to just remove from store/posts array
		openNotificationWithIcon('success', 'Success', 'Successfuly removed post from directory');
	};

	const handleMoveToDirectory = (post: Post): void => {
		dispatch(actions.modals.showModal('move-to-directory'));
		dispatch(actions.modals.addToFavoritesModal.setPostIds([post.id]));
	};

	const toggleCollapse = (): void => {
		dispatch(actions.system.toggleFavoritesDirectoryTreeCollapsed());
	};

	const cardActions: CardAction[] = [
		{
			key: 'card-action-remove-from-favorites',
			icon: 'close-outlined',
			tooltip: 'Remove from this directory',
			onClick: handleRemoveFromDirectory,
			popConfirm: {
				okText: 'Remove',
				cancelText: 'Cancel',
				title: 'Remove from Favorites?',
			},
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
			key: 'card-action-move-to-folder',
			tooltip: 'Move to Folder',
			icon: 'folder-outlined',
			onClick: handleMoveToDirectory,
		},
	];

	return (
		<Container className={props.className}>
			<Layout>
				<StyledContent>
					<ThumbnailsList emptyDataLogoCentered={true} actions={cardActions} hasHeader={false} />
				</StyledContent>
				<Layout.Sider collapsible reverseArrow collapsedWidth={25} width={250} onCollapse={toggleCollapse}>
					<SiderContent />
				</Layout.Sider>
			</Layout>
		</Container>
	);
};

export default Favorites;
