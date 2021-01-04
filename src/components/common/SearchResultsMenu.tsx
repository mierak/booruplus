import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Menu } from 'antd';
import useModal from 'antd/lib/modal/useModal';
import {
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

import { AppDispatch, PostsContext, RootState } from '@store/types';
import { actions, thunks } from '@store/';
import { ActiveModal } from '@appTypes/modalTypes';
import { exportPostsToDirectory } from '@store/commonActions';

type Props = {
	context: PostsContext | string;
};

const SearchResultsMenu: React.FunctionComponent<Props> = ({ context }) => {
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

	const { selectedTags, excludedTags, rating, isDisabled, savedSearchId, posts } = useSelector((state: RootState) => {
		const ctx = state.searchContexts[context];
		return {
			selectedTags: ctx.selectedTags,
			excludedTags: ctx.excludedTags,
			rating: ctx.rating,
			isDisabled: ctx.posts.length <= 0,
			savedSearchId: ctx.savedSearchId,
			posts: ctx.posts,
		};
	});

	const handleDownloadWholeSearch = async (): Promise<void> => {
		const m = showModal({
			title: 'Download?',
			message:
				'This will search for all posts with current parameters and then download them. This could take a while. Are you sure?',
			cancelText: 'Cancel',
			okText: 'Download',
			onOk: () => {
				dispatch(thunks.posts.downloadWholeSearch({ context }));
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
				dispatch(thunks.posts.blacklistAllPosts({ context }));
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
				dispatch(thunks.posts.blacklistSelectedPosts({ context }));
			},
		});
		m.destroy();
	};

	const handleAddAllToFavorites = (): void => {
		dispatch(
			actions.modals.showModal(ActiveModal.ADD_POSTS_TO_FAVORITES, {
				context,
				type: 'all',
			})
		);
	};

	const handleAddSelectedToFavorites = (): void => {
		dispatch(
			actions.modals.showModal(ActiveModal.ADD_POSTS_TO_FAVORITES, {
				context,
				type: 'selected',
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
				dispatch(thunks.posts.downloadAllPosts({ context }));
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
				dispatch(thunks.posts.downloadSelectedPosts({ context }));
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
				dispatch(thunks.savedSearches.saveSearch({ context, tags: selectedTags, excludedTags, rating }));
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
				dispatch(thunks.savedSearches.addPreviewsToSavedSearch({ savedSearchId, posts: posts.filter((p) => p.selected) }));
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
				dispatch(thunks.savedSearches.addPreviewsToSavedSearch({ savedSearchId, posts }));
			},
		});
		m.destroy();
	};

	const handleExportAll = (): void => {
		dispatch(exportPostsToDirectory({ type: 'all', context }));
	};

	const handleExportSelected = (): void => {
		dispatch(exportPostsToDirectory({ type: 'selected', context }));
	};

	return (
		<Menu mode='horizontal' selectedKeys={[]}>
			{contextHolder}
			<Menu.SubMenu disabled={isDisabled} title='Download' icon={<DownloadOutlined />}>
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
			<Menu.SubMenu disabled={isDisabled} title='Add to Favorites' icon={<HeartOutlined />}>
				<Menu.Item onClick={handleAddAllToFavorites} icon={<EyeOutlined />}>
					All
				</Menu.Item>
				<Menu.Item onClick={handleAddSelectedToFavorites} icon={<CheckSquareOutlined />}>
					Selected
				</Menu.Item>
			</Menu.SubMenu>
			<Menu.SubMenu disabled={isDisabled} title='Blacklist' icon={<DeleteOutlined />}>
				<Menu.Item onClick={handleBlacklistAll} icon={<EyeOutlined />}>
					All
				</Menu.Item>
				<Menu.Item onClick={handleBlacklistSelected} icon={<CheckSquareOutlined />}>
					Selected
				</Menu.Item>
			</Menu.SubMenu>
			{savedSearchId !== undefined && (
				<Menu.SubMenu disabled={isDisabled} title='Add to Previews' icon={<FolderViewOutlined />}>
					<Menu.Item onClick={handleAddAllToPreviews} icon={<EyeOutlined />}>
						All
					</Menu.Item>
					<Menu.Item onClick={handleAddSelectedToPreviews} icon={<CheckSquareOutlined />}>
						Selected
					</Menu.Item>
				</Menu.SubMenu>
			)}
			<Menu.SubMenu disabled={isDisabled} title='Export to Folder' icon={<ExportOutlined />}>
				<Menu.Item onClick={handleExportAll} icon={<EyeOutlined />}>
					All
				</Menu.Item>
				<Menu.Item onClick={handleExportSelected} icon={<CheckSquareOutlined />}>
					Selected
				</Menu.Item>
			</Menu.SubMenu>
			{savedSearchId === undefined && (
				<Menu.Item disabled={isDisabled} onClick={handleSaveSearch} icon={<SaveOutlined />}>
					Save Search
				</Menu.Item>
			)}
		</Menu>
	);
};

export default SearchResultsMenu;
