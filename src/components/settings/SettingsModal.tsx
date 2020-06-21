import React from 'react';
import { Modal, Button, Tabs } from 'antd';
import { actions, thunks } from '../../store';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/types';
import General from './General';
import Dashboard from './Dashboard';
import Gelbooru from './Gelbooru';
import { validateApiKey } from '../../util/utils';
import { openNotificationWithIcon } from '../../types/components';

interface Props {
	className?: string;
}

const { TabPane } = Tabs;

const SettingsModal: React.FunctionComponent<Props> = (props: Props) => {
	const dispatch = useDispatch<AppDispatch>();

	const apiKey = useSelector((state: RootState) => state.settings.apiKey);

	const handleClose = (): void => {
		dispatch(actions.modals.setVisible(false));
		dispatch(thunks.settings.loadSettings('user'));
	};

	const handleSaveSettings = async (): Promise<void> => {
		if (validateApiKey(apiKey)) {
			await dispatch(thunks.settings.saveSettings());
			dispatch(actions.modals.setVisible(false));
			openNotificationWithIcon('success', 'Settings saved', 'Settings were succesfuly saved to database', 2);
		} else {
			openNotificationWithIcon('error', 'Invalid API key', 'Please enter valid API key', 5);
		}
	};

	const renderModalFooter = (): React.ReactNode => {
		return [
			<Button type="primary" key="add" onClick={handleSaveSettings}>
				Save
			</Button>,
			<Button key="cancel" onClick={handleClose}>
				Cancel
			</Button>,
		];
	};

	return (
		<Modal
			className={props.className}
			centered
			footer={renderModalFooter()}
			title="Settings"
			visible={true}
			destroyOnClose
			onCancel={handleClose}
			width={900}
			bodyStyle={{ height: '500px' }}
		>
			<Tabs tabPosition="left" tabBarStyle={{ width: '150px', height: '100%' }} style={{ height: '100%' }}>
				<TabPane key="1" tab="General">
					<General />
				</TabPane>
				<TabPane key="2" tab="Dashboard">
					<Dashboard />
				</TabPane>
				<TabPane key="3" tab="Gelbooru">
					<Gelbooru />
				</TabPane>
			</Tabs>
		</Modal>
	);
};

export default SettingsModal;
