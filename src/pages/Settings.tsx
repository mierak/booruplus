import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { FolderOpenOutlined } from '@ant-design/icons';
import { Button, Card, Input, Form, Select } from 'antd';

import { actions } from '../../store';
import { RootState, AppDispatch } from '../../store/types';

const Container = styled.div`
	padding: 10px;
	height: 100vh;
`;

const { Item } = Form;

const Settings: React.FunctionComponent = () => {
	const dispatch = useDispatch<AppDispatch>();

	const imagesFolderPath = useSelector((state: RootState) => state.settings.imagesFolderPath);
	const theme = useSelector((state: RootState) => state.settings.theme);

	const handleThemeChange = (value: 'dark' | 'light'): void => {
		dispatch(actions.settings.updateTheme(value)).then(() => {
			window.api.send('theme-changed');
		});
	};

	return (
		<Container>
			<Card style={{ height: '100%' }}>
				<Form>
					<Item label="Path to images">
						<Input disabled value={imagesFolderPath} />
					</Item>
					<Item>
						<Button
							onClick={(): void => {
								window.api.invoke('open-select-directory-dialog').then((response: { canceled: boolean; filePaths: string[] }) => {
									if (!response.canceled) {
										dispatch(actions.settings.updateImagePath(response.filePaths[0]));
									}
								});
							}}
						>
							<FolderOpenOutlined /> Select
						</Button>
					</Item>
					<Item label="Theme">
						<Select defaultValue={theme} style={{ width: '150px' }} onChange={handleThemeChange}>
							<Select.Option key="dark" value="dark">
								Dark
							</Select.Option>
							<Select.Option key="light" value="light">
								Light
							</Select.Option>
						</Select>
					</Item>
				</Form>
			</Card>
		</Container>
	);
};

export default Settings;
