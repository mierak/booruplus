import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Button, Input, Form } from 'antd';

import { actions, thunks } from 'store/';
import { AppDispatch, RootState } from 'store/types';

import { openNotificationWithIcon } from 'types/components';

interface ValidationStatus {
	validateStatus: 'error' | 'success' | '';
	message: string;
}

const RenameDirectoryModal: React.FunctionComponent = () => {
	const dispatch = useDispatch<AppDispatch>();
	const [text, setText] = useState('');
	const [validationStatus, setValidationStatus] = useState<ValidationStatus>({
		validateStatus: '',
		message: '',
	});
	const selectedNodeKey = useSelector((state: RootState) => state.favorites.selectedNodeKey);

	const validateName = (name?: string): boolean => {
		if (!name || name.length === 0) {
			return true;
		} else {
			return /^[a-zA-Z0-9 ]+$/.test(name);
		}
	};

	const handleRenameSubFolder = async (): Promise<void> => {
		if (selectedNodeKey === undefined) {
			openNotificationWithIcon('error', 'Failed to rename folder', 'Failed to rename folder because no node was selected');
			return;
		}
		try {
			await dispatch(thunks.favorites.renameDirectory({ key: selectedNodeKey, title: text }));
			openNotificationWithIcon('success', 'Success', 'Successfuly renamed sub folder');
		} catch (err) {
			openNotificationWithIcon('error', 'Error!', `Reason: ${err}`, 5);
		}
	};

	const handleClose = (): void => {
		dispatch(actions.modals.setVisible(false));
		setText('');
	};

	const handleConfirm = (): void => {
		handleRenameSubFolder();
		dispatch(actions.modals.setVisible(false));
		setText('');
	};

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
		setText(event.currentTarget.value);
		if (!validateName(event.currentTarget.value)) {
			setValidationStatus({
				message: '',
				validateStatus: 'error',
			});
		} else {
			setValidationStatus({
				message: '',
				validateStatus: 'success',
			});
		}
	};

	const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>): void => {
		event.key === 'Enter' && handleConfirm();
	};

	const renderModalFooter = (): React.ReactNode => {
		return [
			<Button type="primary" key="add" onClick={handleConfirm}>
				Rename
			</Button>,
			<Button key="cancel" onClick={handleClose}>
				Cancel
			</Button>,
		];
	};

	return (
		<Modal centered title="Input new category name" visible={true} destroyOnClose onCancel={handleClose} footer={renderModalFooter()}>
			<Form.Item hasFeedback validateStatus={validationStatus.validateStatus}>
				<Input autoFocus onChange={handleInputChange} onKeyPress={handleKeyPress} />
			</Form.Item>
		</Modal>
	);
};

export default RenameDirectoryModal;
