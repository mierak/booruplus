import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Modal, Input, Form } from 'antd';

import { actions, thunks } from '@store';
import { AppDispatch } from '@store/types';
import { openNotificationWithIcon } from '@appTypes/components';

import ModalFooter from './common/ModalFooter';
import { AddDirectoryModalProps } from '@appTypes/modalTypes';

interface ValidationStatus {
	validateStatus: 'error' | 'success' | '';
	message: string;
}

const AddDirectoryModal: React.FunctionComponent<AddDirectoryModalProps> = ({ selectedNodeKey }) => {
	const dispatch = useDispatch<AppDispatch>();
	const [text, setText] = useState('');
	const [validationStatus, setValidationStatus] = useState<ValidationStatus>({
		validateStatus: 'error',
		message: '',
	});

	const validateName = (name?: string): boolean => {
		if (!name || name.length === 0) {
			return false;
		} else {
			return /^[a-zA-Z0-9 ]+$/.test(name);
		}
	};

	const handleAddSubFolder = async (): Promise<void> => {
		if (validateName(text)) {
			await dispatch(thunks.favorites.addDirectory({ parentKey: selectedNodeKey, title: text }));
			openNotificationWithIcon('success', 'Success', 'Successfuly added sub folder');
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
		handleAddSubFolder();
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
			footer={<ModalFooter onConfirm={handleConfirm} onCancel={handleClose} okText='Add' cancelText='Close' />}
		>
			<Form.Item hasFeedback validateStatus={validationStatus.validateStatus}>
				<Input autoFocus onChange={handleInputChange} onKeyPress={handleKeyPress} />
			</Form.Item>
		</Modal>
	);
};

export default AddDirectoryModal;
