import React from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { PageHeader, Spin, Menu } from 'antd';
import {
	LoadingOutlined,
	DownloadOutlined,
	HeartOutlined,
	DeleteOutlined,
	FolderViewOutlined,
	EyeOutlined,
	CheckSquareOutlined,
	SearchOutlined,
	SaveOutlined,
	ExportOutlined,
} from '@ant-design/icons';
import useModal from 'antd/lib/modal/useModal';

import { actions, thunks } from '@store';
import { exportPostsToDirectory } from '@store/commonActions';
import { RootState, AppDispatch } from '@store/types';
import ThumbnailsList from '@components/thumbnails/ThumbnailsList';
import { CardAction, openNotificationWithIcon } from '@appTypes/components';
import { Post } from '@appTypes/gelbooruTypes';
import { ActiveModal } from '@appTypes/modalTypes';

interface Props {
	className?: string;
}

const Container = styled.div`
	overflow-y: hidden;
	height: 100vh;
`;

const StyledPageHeader = styled(PageHeader)`
	.ant-page-header-heading {
		justify-content: flex-start;
	}
	.ant-page-header-heading-extra {
		height: 32px;
		margin-top: 0px;
		margin-left: 50px;
	}
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
	const [modal, contextHolder] = useModal();
	const showModal = ({
		title,
		message,
		okText,
		cancelText,
		onOk,
	}: {
		title: string;
		message: string;
		okText: string;
		cancelText: string;
		onOk: () => unknown;
	}): ReturnType<typeof modal.confirm> => {
		return modal.confirm({
			title: title,
			content: message,
			cancelButtonProps: {
				type: 'primary',
			},
			okButtonProps: {
				type: 'default',
			},
			cancelText: okText,
			okText: cancelText,
			onCancel: onOk,
			autoFocusButton: null,
		});
	};

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
		dispatch(
			actions.modals.showModal({
				modal: ActiveModal.ADD_POSTS_TO_FAVORITES,
				modalState: { [ActiveModal.ADD_POSTS_TO_FAVORITES]: { postIdsToFavorite: [post.id] } },
			})
		);
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
		dispatch(thunks.savedSearches.addPreviewToActiveSavedSearch(post));
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
			return <StyledThumbnailsList context={'posts'} hasHeader emptyDataLogoCentered={true} actions={thumbnailActions} />;
		}
	};

	const handleDownloadWholeSearch = async (): Promise<void> => {
		const m = showModal({
			title: 'Download?',
			message: 'This will search for all posts with current parameters and then download them. This could take a while. Are you sure?',
			cancelText: 'Cancel',
			okText: 'Download',
			onOk: () => {
				dispatch(thunks.posts.downloadWholeSearch());
			},
		});
		m.destroy();
	};

	const handleBlacklistAll = (): void => {
		const m = showModal({
			title: 'Blacklist?',
			message: 'All current posts will be blacklisted to. You will not see them anymore. Continue?',
			cancelText: 'Cancel',
			okText: 'Blacklist',
			onOk: () => {
				dispatch(thunks.posts.blacklistAllPosts());
			},
		});
		m.destroy();
	};

	const handleBlacklistSelected = (): void => {
		const m = showModal({
			title: 'Blacklist?',
			message: 'Selected posts will be blacklisted to. You will not see them anymore. Continue?',
			cancelText: 'Cancel',
			okText: 'Blacklist',
			onOk: () => {
				dispatch(thunks.posts.blacklistSelectedPosts());
			},
		});
		m.destroy();
	};

	const handleAddAllToFavorites = (): void => {
		dispatch(
			actions.modals.showModal({
				modal: ActiveModal.ADD_POSTS_TO_FAVORITES,
				modalState: {
					[ActiveModal.ADD_POSTS_TO_FAVORITES]: {
						context: 'posts',
						type: 'all',
					},
				},
			})
		);
	};

	const handleAddSelectedToFavorites = (): void => {
		dispatch(
			actions.modals.showModal({
				modal: ActiveModal.ADD_POSTS_TO_FAVORITES,
				modalState: {
					[ActiveModal.ADD_POSTS_TO_FAVORITES]: {
						context: 'posts',
						type: 'selected',
					},
				},
			})
		);
	};

	const handleDownloadAll = async (): Promise<void> => {
		const m = showModal({
			title: 'Download?',
			message: 'All current posts will be downloaded. Continue?',
			cancelText: 'Cancel',
			okText: 'Download',
			onOk: () => {
				dispatch(thunks.posts.downloadAllPosts());
			},
		});
		m.destroy();
	};

	const handleDownloadSelected = async (): Promise<void> => {
		const m = showModal({
			title: 'Download?',
			message: 'Selected posts will be downloaded. Continue?',
			cancelText: 'Cancel',
			okText: 'Download',
			onOk: () => {
				dispatch(thunks.posts.downloadSelectedPosts());
			},
		});
		m.destroy();
	};

	const handleSaveSearch = async (): Promise<void> => {
		const m = showModal({
			title: 'Add search to Saved Searches?',
			message: 'Current search with its parameters will be saved. Continue?',
			cancelText: 'Cancel',
			okText: 'Save',
			onOk: () => {
				dispatch(thunks.savedSearches.saveSearch({ tags: selectedTags, excludedTags, rating }));
			},
		});
		m.destroy();
	};

	const handleAddSelectedToPreviews = (): void => {
		const m = showModal({
			title: 'Add previews?',
			message: 'Selected posts will be added to the current Saved Search preview. Continue?',
			cancelText: 'Cancel',
			okText: 'Add',
			onOk: () => {
				dispatch(thunks.savedSearches.addSelectedPreviewsToActiveSavedSearch());
			},
		});
		m.destroy();
	};

	const handleAddAllToPreviews = (): void => {
		const m = showModal({
			title: 'Add previews?',
			message: 'All current posts will be added to the current Saved Search preview. Continue?',
			cancelText: 'Cancel',
			okText: 'Add',
			onOk: () => {
				dispatch(thunks.savedSearches.addAllPreviewsToActiveSavedSearch());
			},
		});
		m.destroy();
	};

	const handleExportAll = (): void => {
		dispatch(exportPostsToDirectory('all'));
	};

	const handleExportSelected = (): void => {
		dispatch(exportPostsToDirectory('selected'));
	};

	const renderMenu = (): React.ReactNode => {
		return (
			<Menu mode='horizontal' forceSubMenuRender>
				<Menu.SubMenu title='Download' icon={<DownloadOutlined />}>
					<Menu.Item onClick={handleDownloadAll} icon={<EyeOutlined />}>
						All
					</Menu.Item>
					<Menu.Item onClick={handleDownloadSelected} icon={<CheckSquareOutlined />}>
						Selected
					</Menu.Item>
					<Menu.Item onClick={handleDownloadWholeSearch} icon={<SearchOutlined />}>
						Whole Search
					</Menu.Item>
				</Menu.SubMenu>
				<Menu.SubMenu title='Add to Favorites' icon={<HeartOutlined />}>
					<Menu.Item onClick={handleAddAllToFavorites} icon={<EyeOutlined />}>
						All
					</Menu.Item>
					<Menu.Item onClick={handleAddSelectedToFavorites} icon={<CheckSquareOutlined />}>
						Selected
					</Menu.Item>
				</Menu.SubMenu>
				<Menu.SubMenu title='Blacklist' icon={<DeleteOutlined />}>
					<Menu.Item onClick={handleBlacklistAll} icon={<EyeOutlined />}>
						All
					</Menu.Item>
					<Menu.Item onClick={handleBlacklistSelected} icon={<CheckSquareOutlined />}>
						Selected
					</Menu.Item>
				</Menu.SubMenu>
				{mode === 'saved-search-online' || mode === 'saved-search-offline' ? (
					<Menu.SubMenu title='Add to Previews' icon={<FolderViewOutlined />}>
						<Menu.Item onClick={handleAddAllToPreviews} icon={<EyeOutlined />}>
							All
						</Menu.Item>
						<Menu.Item onClick={handleAddSelectedToPreviews} icon={<CheckSquareOutlined />}>
							Selected
						</Menu.Item>
					</Menu.SubMenu>
				) : null}
				<Menu.SubMenu title='Export to Folder' icon={<ExportOutlined />}>
					<Menu.Item onClick={handleExportAll} icon={<EyeOutlined />}>
						All
					</Menu.Item>
					<Menu.Item onClick={handleExportSelected} icon={<CheckSquareOutlined />}>
						Selected
					</Menu.Item>
				</Menu.SubMenu>
				{mode !== 'saved-search-offline' && mode !== 'saved-search-online' ? (
					<Menu.Item onClick={handleSaveSearch} icon={<SaveOutlined />}>
						Save Search
					</Menu.Item>
				) : null}
			</Menu>
		);
	};

	return (
		<Container className={props.className}>
			<StyledPageHeader ghost={false} title='Image List' extra={renderMenu()} />
			{renderThumbnailList()}
			{contextHolder}
		</Container>
	);
};

export default Thumbnails;
