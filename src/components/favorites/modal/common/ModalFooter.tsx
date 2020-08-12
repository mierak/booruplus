import React from 'react';
import { Button } from 'antd';

interface FooterProps {
	okText?: string;
	cancelText?: string;
	onConfirm: () => void;
	onCancel: () => void;
}

const ModalFooter: React.FunctionComponent<FooterProps> = (props: FooterProps) => {
	return (
		<>
			<Button type='primary' key='ok' onClick={props.onConfirm}>
				{props.okText ?? 'Ok'}
			</Button>
			<Button key='cancel' onClick={props.onCancel}>
				{props.cancelText ?? 'Cancel'}
			</Button>
		</>
	);
};

export default ModalFooter;
