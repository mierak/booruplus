import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Layout } from 'antd';

import { actions, thunks } from '../../store';
import ThumbnailsList from '../components/ThumbnailsList';

import SiderContent from '../components/favorites/SiderContent';
import { Post } from 'types/gelbooruTypes';
import { RootState, AppDispatch } from 'store/types';
import { CardAction, openNotificationWithIcon } from 'types/components';

interface Props {
	className?: string;
}

const Container = styled.div``;

const Favorites: React.FunctionComponent<Props> = (props: Props) => {
	const dispatch = useDispatch<AppDispatch>();

	const activeDirectory = useSelector((state: RootState) => state.favorites.activeNodeKey);

	useEffect(() => {
		const renderThumbnailList = async (): Promise<void> => {
			dispatch(thunks.favorites.fetchPostsInDirectory('root'));
		};
		renderThumbnailList();
		dispatch(actions.system.setSearchMode('favorites'));
	}, []);

	const handleBlacklist = (post: Post): void => {
		dispatch(thunks.posts.blacklistPosts([post]));
		openNotificationWithIcon('success', 'Post deleted', 'Image was successfuly deleted from disk.');
	};

	const handleDownload = (post: Post): void => {
		dispatch(thunks.posts.downloadPost({ post }));
		openNotificationWithIcon('success', 'Post downloaded', 'Image was successfuly saved to disk.');
	};

	const handleRemoveFromDirectory = async (post: Post): Promise<void> => {
		try {
			await dispatch(thunks.favorites.removePostFromActiveDirectory(post.id));
			if (!activeDirectory) throw new Error('Could not reload posts in active directory, because active directory is undefined');
			await dispatch(thunks.favorites.fetchPostsInDirectory(activeDirectory)); // TODO change to just remove from store/posts array
			openNotificationWithIcon('success', 'Success', 'Successfuly removed post from directory');
		} catch (err) {
			openNotificationWithIcon('error', 'Error!', `Reason: ${err}`, 5);
		}
	};

	const handleMoveToDirectory = (post: Post): void => {
		dispatch(actions.modals.showModal('move-to-directory'));
		dispatch(actions.modals.addToFavoritesModal.setPostIds([post.id]));
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
				<Layout.Content>
					<ThumbnailsList emptyDataLogoCentered={true} actions={cardActions} />
				</Layout.Content>
				<Layout.Sider collapsible reverseArrow collapsedWidth={25} width={250}>
					<SiderContent />
				</Layout.Sider>
			</Layout>
		</Container>
	);
};

export default Favorites;
