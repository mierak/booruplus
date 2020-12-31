import React from 'react';
import { Form, Input, Modal } from 'antd';
import { useDispatch } from 'react-redux';

import type { RenameTabProps } from '@appTypes/modalTypes';

import ModalFooter from '@components/common/ModalFooter';
import { actions } from '@store/';

const RenameTabModal: React.FunctionComponent<RenameTabProps> = ({ context }) => {
	const dispatch = useDispatch();
	const [text, setText] = React.useState('');

	const onConfirm = () => {
		dispatch(actions.searchContexts.updateContext({ context, data: { tabName: text } }));
		setText('');
        dispatch(actions.modals.setVisible(false));
	};

	const onClose = () => {
		dispatch(actions.modals.setVisible(false));
	};

	const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>): void => {
		event.key === 'Enter' && onConfirm();
	};

	return (
		<Modal
			centered
			destroyOnClose
			visible
			title='Enter new tab name'
			onCancel={onClose}
			footer={<ModalFooter onConfirm={onConfirm} onCancel={onClose} okText='Rename' cancelText='Close' />}
		>
			<Form.Item>
				<Input autoFocus value={text} onChange={(e) => setText(e.currentTarget.value)} onKeyPress={handleKeyPress} />
			</Form.Item>
		</Modal>
	);
};

export default RenameTabModal;
