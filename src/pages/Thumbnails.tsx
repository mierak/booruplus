import React from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { PageHeader, Button, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import { actions, thunks } from '../store';
import { RootState, AppDispatch } from '../store/types';

import ThumbnailsList from '../components/thumbnails/ThumbnailsList';
import { CardAction, openNotificationWithIcon } from '../types/components';
import { Post } from '../types/gelbooruTypes';
import { getThumbnailUrl } from '../service/webService';

interface Props {
	className?: string;
}

const Container = styled.div`
	overflow-y: hidden;
	height: 100vh;
`;

const StyledThumbnailsList = styled(ThumbnailsList)`
	overflow: auto;
	max-height: calc(100vh - 72px);
`;

const StyledSpin = styled(Spin)`
	&& {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
	}
`;

const Thumbnails: React.FunctionComponent<Props> = (props: Props) => {
	const dispatch = useDispatch<AppDispatch>();

	const isFetchingPosts = useSelector((state: RootState) => state.loadingStates.isFetchingPosts);
	const mode = useSelector((state: RootState) => state.system.searchMode);

	const selectedTags = useSelector(
		(state: RootState) => (mode === 'offline' && state.downloadedSearchForm.selectedTags) || state.onlineSearchForm.selectedTags
	);
	const excludedTags = useSelector(
		(state: RootState) => (mode === 'offline' && state.downloadedSearchForm.excludedTags) || state.onlineSearchForm.excludedTags
	);
	const rating = useSelector(
		(state: RootState) => (mode === 'offline' && state.downloadedSearchForm.rating) || state.onlineSearchForm.rating
	);

	const handleFavorite = (post: Post): void => {
		dispatch(actions.modals.showModal('add-to-favorites'));
		dispatch(actions.modals.addToFavoritesModal.setPostIds([post.id]));
	};

	const handleBlacklist = (post: Post): void => {
		dispatch(thunks.posts.blacklistPosts([post]));
		openNotificationWithIcon('success', 'Post deleted', 'Image was successfuly deleted from disk.');
	};

	const handleDownload = async (post: Post): Promise<void> => {
		await dispatch(thunks.posts.downloadPost({ post }));
		openNotificationWithIcon('success', 'Post downloaded', 'Image was successfuly saved to disk.');
	};

	const handleAddPreview = (post: Post): void => {
		dispatch(thunks.savedSearches.addPreviewToActiveSavedSearch(getThumbnailUrl(post.directory, post.hash)));
		openNotificationWithIcon('success', 'Preview added', 'Preview was successfuly added to saved search');
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
			key: 'card-action-add-preview-to-saved-search',
			tooltip: 'Add preview',
			icon: 'plus-outlined',
			onClick: handleAddPreview,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			condition: (_: Post): boolean => mode === 'saved-search-online' || mode === 'saved-search-offline',
			popConfirm: {
				okText: 'Add',
				cancelText: 'Cancel',
				title: 'Add preview to Saved Search?',
			},
		},
	];

	const renderThumbnailList = (): JSX.Element => {
		if (isFetchingPosts) {
			return <StyledSpin indicator={<LoadingOutlined style={{ fontSize: '64px' }} />} />;
		} else {
			return <StyledThumbnailsList hasHeader emptyDataLogoCentered={true} actions={thumbnailActions} />;
		}
	};

	const handleDownloadWholeSearch = async (): Promise<void> => {
		dispatch(thunks.posts.downloadWholeSearch());
	};

	const handleBlacklistAll = (): void => {
		dispatch(thunks.posts.blacklistAllPosts());
	};

	const handleBlacklistSelected = (): void => {
		dispatch(thunks.posts.blacklistSelectedPosts());
	};

	const handleAddAllToFavorites = (): void => {
		dispatch(actions.modals.addToFavoritesModal.setPostIdsToFavorite('all'));
		dispatch(actions.modals.showModal('add-to-favorites'));
	};

	const handleAddSelectedToFavorites = (): void => {
		dispatch(actions.modals.addToFavoritesModal.setPostIdsToFavorite('selected'));
		dispatch(actions.modals.showModal('add-to-favorites'));
	};

	const handleDownloadAll = async (): Promise<void> => {
		await dispatch(thunks.posts.downloadAllPosts());
	};

	const handleDownloadSelected = async (): Promise<void> => {
		dispatch(thunks.posts.downloadSelectedPosts());
	};

	const handleSaveSearch = async (): Promise<void> => {
		dispatch(thunks.savedSearches.saveSearch({ tags: selectedTags, excludedTags, rating }));
	};

	const renderButtons = (): JSX.Element[] => {
		return [
			<Button key='9' onClick={handleDownloadWholeSearch}>
				Download Search
			</Button>,
			<Button key='8' onClick={handleSaveSearch}>
				Save Search
			</Button>,
			<Button key='7' onClick={handleBlacklistAll}>
				Blacklist All
			</Button>,
			<Button key='6' onClick={handleBlacklistSelected}>
				Blacklist Selected
			</Button>,
			<Button key='5' onClick={handleAddAllToFavorites}>
				Add All To Favorites
			</Button>,
			<Button key='4' onClick={handleAddSelectedToFavorites}>
				Add Selected To Favorites
			</Button>,
			<Button key='3' onClick={handleDownloadAll}>
				Download All
			</Button>,
			<Button key='2' onClick={handleDownloadSelected}>
				Download Selected
			</Button>,
		];
	};

	return (
		<Container className={props.className}>
			<PageHeader ghost={false} title='Image List' extra={renderButtons()}></PageHeader>
			{renderThumbnailList()}
		</Container>
	);
};

export default Thumbnails;
