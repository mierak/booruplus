import React from 'react';
import { Modal } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch, RootState } from '../../../store/types';
import { actions, thunks } from '../../../store';
import { openNotificationWithIcon } from '../../../types/components';
import ModalFooter from './common/ModalFooter';

const MoveSelectedToDirectoryModal: React.FunctionComponent = () => {
	const dispatch = useDispatch<AppDispatch>();
	const postIdsToFavorite = useSelector((state: RootState) => state.modals.addToFavoritesModal.postIdsToFavorite);
	const selectedNodeKey = useSelector((state: RootState) => state.favorites.selectedNodeKey);

	const handleClose = (): void => {
		dispatch(actions.modals.setVisible(false));
	};

	const handleConfirm = async (): Promise<void> => {
		if (postIdsToFavorite.length === 0) {
			openNotificationWithIcon(
				'error',
				'Failed to add post to directory',
				'Could not add post to directory because no post id was supplied.',
				5
			);
			dispatch(actions.modals.setVisible(false));
			return;
		}
		await dispatch(thunks.favorites.removePostsFromActiveDirectory(postIdsToFavorite));
		await dispatch(thunks.favorites.addPostsToDirectory({ ids: postIdsToFavorite, key: !selectedNodeKey ? 1 : selectedNodeKey }));
		await dispatch(thunks.favorites.fetchPostsInDirectory());
		openNotificationWithIcon('success', 'Success', 'Successfuly moved post to folder');
		dispatch(actions.modals.setVisible(false));
	};

	return (
		<Modal
			visible
			centered
			destroyOnClose
			title='Move selected posts?'
			onCancel={handleClose}
			footer={<ModalFooter onCancel={handleClose} onConfirm={handleConfirm} cancelText='Close' okText='Move' />}
		>
			Do you really want to move selected posts to this directory?
		</Modal>
	);
};

export default MoveSelectedToDirectoryModal;
