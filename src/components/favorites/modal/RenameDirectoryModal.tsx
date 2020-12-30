import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Modal, Input, Form } from 'antd';

import { actions, thunks } from '@store';
import { AppDispatch } from '@store/types';
import { openNotificationWithIcon } from '@appTypes/components';

import ModalFooter from '../../common/ModalFooter';
import { RenameDirectoryModalProps } from '@appTypes/modalTypes';

type ValidationStatus = {
	validateStatus: 'error' | 'success' | '';
	message: string;
}

const RenameDirectoryModal: React.FunctionComponent<RenameDirectoryModalProps> = ({ targetDirectoryKey }) => {
	const dispatch = useDispatch<AppDispatch>();
	const [text, setText] = useState('');
	const [validationStatus, setValidationStatus] = useState<ValidationStatus>({
		validateStatus: '',
		message: '',
	});

	const validateName = (name?: string): boolean => {
		if (!name || name.length === 0) {
			return false;
		} else {
			return /^[a-zA-Z0-9 ]+$/.test(name);
		}
	};

	const handleRenameSubFolder = async (): Promise<void> => {
		if (validateName(text)) {
			await dispatch(thunks.favorites.renameDirectory({ key: targetDirectoryKey, title: text }));
			openNotificationWithIcon('success', 'Success', 'Successfuly renamed sub folder');
			dispatch(actions.modals.setVisible(false));
		} else {
			openNotificationWithIcon('error', 'Directory name cannot be empty', 'Please enter new directory name');
		}
	};

	const handleClose = (): void => {
		dispatch(actions.modals.setVisible(false));
		setText('');
	};

	const handleConfirm = (): void => {
		handleRenameSubFolder();
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

	return (
		<Modal
			centered
			title='Input new category name'
			visible={true}
			destroyOnClose
			onCancel={handleClose}
			footer={<ModalFooter onConfirm={handleConfirm} onCancel={handleClose} okText='Rename' cancelText='Close' />}
		>
			<Form.Item hasFeedback validateStatus={validationStatus.validateStatus}>
				<Input autoFocus onChange={handleInputChange} onKeyPress={handleKeyPress} />
			</Form.Item>
		</Modal>
	);
};

export default RenameDirectoryModal;
