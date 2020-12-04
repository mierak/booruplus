import React from 'react';
import { Modal } from 'antd';
import { useDispatch } from 'react-redux';

import { AppDispatch } from '@store/types';
import { actions, thunks } from '@store';
import { openNotificationWithIcon } from '@appTypes/components';

import ModalFooter from './common/ModalFooter';
import { MovePostsToDirectoryConfirmationModalProps as MovePostsToSuppliedFavoritesDirectoryModalProps } from '@appTypes/modalTypes';

const MovePostsToSuppliedFavoritesDirectoryModal: React.FunctionComponent<MovePostsToSuppliedFavoritesDirectoryModalProps> = ({
	targetDirectoryKey,
	postIdsToMove,
}) => {
	const dispatch = useDispatch<AppDispatch>();

	const handleClose = (): void => {
		dispatch(actions.modals.setVisible(false));
	};

	const handleConfirm = async (): Promise<void> => {
		if (postIdsToMove.length === 0) {
			openNotificationWithIcon(
				'error',
				'Failed to add post to directory',
				'Could not add post to directory because no post id was supplied.',
				5
			);
			dispatch(actions.modals.setVisible(false));
			return;
		}
		await dispatch(thunks.favorites.removePostsFromActiveDirectory(postIdsToMove));
		await dispatch(thunks.favorites.addPostsToDirectory({ ids: postIdsToMove, key: targetDirectoryKey }));
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

export default MovePostsToSuppliedFavoritesDirectoryModal;
