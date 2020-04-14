import React, { useState, ChangeEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { FolderOpenOutlined, FolderOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Card, Input, Form, Select, Row, Col, Descriptions, notification, InputNumber } from 'antd';

import { actions } from '../../store';
import { RootState, AppDispatch } from '../../store/types';

const Container = styled.div`
	padding: 10px;
	height: 100vh;
`;

const StyledCard = styled(Card)`
	width: 100%;
`;

const StyledButton = styled(Button)`
	width: 100%;
`;

interface ApiKeyValidationStatus {
	validateStatus: 'error' | 'success' | '';
	message: string;
}

const { Item } = Form;

const Settings: React.FunctionComponent = () => {
	const dispatch = useDispatch<AppDispatch>();
	const [apiKeyValidationStatus, setApiKeyValidationStatus] = useState<ApiKeyValidationStatus>({
		message: '',
		validateStatus: ''
	});

	const imagesFolderPath = useSelector((state: RootState) => state.settings.imagesFolderPath);
	const mostViewedCount = useSelector((state: RootState) => state.settings.mostViewedCount);
	const apiKey = useSelector((state: RootState) => state.settings.apiKey);
	const theme = useSelector((state: RootState) => state.settings.theme);

	const validateApiKey = (key?: string): boolean => {
		if (!key || key.length === 0) {
			return true;
		} else {
			return /^(?=.*&api_key=)(?=.*&user_id=)(?=.*[a-z0-9]{64})(?=.*[0-9]{1,}).*$/.test(key);
		}
	};

	const handleThemeChange = (value: 'dark' | 'light'): void => {
		dispatch(actions.settings.updateTheme(value)).then(() => {
			window.api.send('theme-changed');
		});
	};

	const handleSelectDirectory = (): void => {
		window.api.invoke('open-select-directory-dialog').then((response: { canceled: boolean; filePaths: string[] }) => {
			if (!response.canceled) {
				dispatch(actions.settings.updateImagePath(response.filePaths[0]));
			}
		});
	};

	const handleApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
		const key = event.currentTarget.value;
		if (!validateApiKey(key)) {
			setApiKeyValidationStatus({
				message: 'Wrong API key format. Did you copy it properly?',
				validateStatus: 'error'
			});
		} else {
			setApiKeyValidationStatus({
				message: '',
				validateStatus: 'success'
			});
		}
		dispatch(actions.settings.setApiKey(key));
	};

	const handleMostViewedCountChange = (value: number | undefined): void => {
		value && dispatch(actions.settings.updateMostViewedCount(value));
	};

	const handleSaveSettings = async (): Promise<void> => {
		if (validateApiKey(apiKey)) {
			await dispatch(actions.settings.saveSettings());
			notification.success({
				message: 'Settings saved',
				description: 'Settings were succesfuly saved to database',
				duration: 2
			});
		} else {
			notification.error({
				message: 'Invalid API key',
				description: 'Please enter valid API key',
				duration: 0
			});
		}
	};

	const handleOpenDirectory = (): void => {
		window.api.send('open-path', imagesFolderPath);
	};

	const handleOpenGelbooruSettings = (): void => {
		window.api.send('open-in-browser', 'https://gelbooru.com/index.php?page=account&s=options');
	};

	return (
		<Container>
			<Row gutter={10} style={{ marginBottom: '10px' }}>
				<StyledCard title="General" size="small">
					<Form>
						<Row gutter={8}>
							<Col span={8}>
								<Item label="Path to images" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
									<Input disabled value={imagesFolderPath} />
								</Item>
							</Col>
							<Col span={2}>
								<Item labelCol={{ span: 0 }} wrapperCol={{ span: 24 }}>
									<StyledButton onClick={handleSelectDirectory}>
										<FolderOutlined /> Select
									</StyledButton>
								</Item>
							</Col>
							<Col span={2}>
								<Item labelCol={{ span: 0 }} wrapperCol={{ span: 24 }}>
									<StyledButton onClick={handleOpenDirectory}>
										<FolderOpenOutlined /> Open
									</StyledButton>
								</Item>
							</Col>
						</Row>
						<Row>
							<Col span={8}>
								<Item label="Theme" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
									<Select defaultValue={theme} style={{ width: '150px' }} onChange={handleThemeChange}>
										<Select.Option key="dark" value="dark">
											Dark
										</Select.Option>
										<Select.Option key="light" value="light">
											Light
										</Select.Option>
									</Select>
								</Item>
							</Col>
						</Row>
						<Row>
							<Col span={8}>
								<Item label="Most Viewed Count" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
									<InputNumber value={mostViewedCount} min={1} max={100} onChange={handleMostViewedCountChange} />
								</Item>
							</Col>
						</Row>
					</Form>
				</StyledCard>
			</Row>
			<Row gutter={10} style={{ marginBottom: '10px' }}>
				<StyledCard title="Gelbooru specific settings" size="small">
					<Descriptions>
						<Descriptions.Item key="api-key-description">
							This is generally not needed. But if you use this app excesivelly, Gelbooru might start limiting requests from you and you
							need to authenticate. You can find your API key on the bottom of Settings on Gelbooru under
							<a onClick={handleOpenGelbooruSettings}> Options</a>.
						</Descriptions.Item>
					</Descriptions>
					<Form>
						<Row gutter={8}>
							<Col span={16}>
								<Item
									label="API key"
									labelCol={{ span: 4 }}
									wrapperCol={{ span: 16 }}
									hasFeedback
									validateStatus={apiKeyValidationStatus.validateStatus}
								>
									<Input onChange={handleApiKeyChange} value={apiKey} />
								</Item>
							</Col>
						</Row>
						<Row>
							<Col span={8}>
								<Item wrapperCol={{ offset: 8 }}>
									<StyledButton onClick={handleSaveSettings}>
										<SaveOutlined /> Save
									</StyledButton>
								</Item>
							</Col>
						</Row>
					</Form>
				</StyledCard>
			</Row>
		</Container>
	);
};

export default Settings;
