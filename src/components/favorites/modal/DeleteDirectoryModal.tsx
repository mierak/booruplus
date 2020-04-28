import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Button } from 'antd';

import { actions } from 'store/';
import { AppDispatch, RootState } from 'store/types';

import { openNotificationWithIcon } from 'types/components';
import { thunks } from 'store';

const DeleteDirectoryModal: React.FunctionComponent = () => {
	const dispatch = useDispatch<AppDispatch>();

	const selectedNodeKey = useSelector((state: RootState) => state.favorites.selectedNodeKey);

	const handleDelete = async (): Promise<void> => {
		if (!selectedNodeKey) {
			openNotificationWithIcon('error', 'Failed to delete folder', 'Failed to delete folder because no node was selected');
			return;
		}
		try {
			await dispatch(thunks.favorites.deleteDirectoryAndChildren(selectedNodeKey));
			openNotificationWithIcon('success', 'Success', 'Successfuly deleted folder');
		} catch (err) {
			openNotificationWithIcon('error', 'Error!', `Reason: '${err}`, 5);
		}
		dispatch(actions.modals.setVisible(false));
	};

	const handleClose = (): void => {
		dispatch(actions.modals.setVisible(false));
	};

	const renderModalFooter = (): React.ReactNode => {
		return [
			<Button type="primary" key="delete" onClick={handleDelete}>
				Delete
			</Button>,
			<Button key="cancel" onClick={handleClose}>
				Cancel
			</Button>,
		];
	};

	return (
		<Modal destroyOnClose centered visible={true} title="Delete Directory" footer={renderModalFooter()} onCancel={handleClose}>
			Are you sure you want to delete directory and its subdirectories? This action is irreversible.
		</Modal>
	);
};

export default DeleteDirectoryModal;
