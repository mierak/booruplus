import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal } from 'antd';

import { actions, thunks } from '@store';
import { AppDispatch, RootState } from '@store/types';
import { openNotificationWithIcon } from '@appTypes/components';

import ModalFooter from './common/ModalFooter';

const DeleteDirectoryModal: React.FunctionComponent = () => {
	const dispatch = useDispatch<AppDispatch>();

	const selectedNodeKey = useSelector((state: RootState) => state.favorites.selectedNodeKey);

	const handleDelete = async (): Promise<void> => {
		if (!selectedNodeKey) {
			openNotificationWithIcon('error', 'Failed to delete folder', 'Failed to delete folder because no node was selected');
			dispatch(actions.modals.setVisible(false));
			return;
		}
		if (selectedNodeKey === 1) {
			openNotificationWithIcon('error', 'Failed to delete folder', 'The default folder cannot be deleted! You can rename it if you want.');
			dispatch(actions.modals.setVisible(false));
			return;
		}

		await dispatch(thunks.favorites.deleteDirectoryAndChildren(selectedNodeKey));
		openNotificationWithIcon('success', 'Success', 'Successfuly deleted folder');
		dispatch(actions.modals.setVisible(false));
	};

	const handleClose = (): void => {
		dispatch(actions.modals.setVisible(false));
	};

	return (
		<Modal
			destroyOnClose
			centered
			visible={true}
			title='Delete Directory'
			onCancel={handleClose}
			footer={<ModalFooter onConfirm={handleDelete} onCancel={handleClose} okText='Delete' cancelText='Close' />}
		>
			Are you sure you want to delete directory and its subdirectories? This action is irreversible.
		</Modal>
	);
};

export default DeleteDirectoryModal;
