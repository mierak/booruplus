import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { FolderOpenOutlined, FolderOutlined } from '@ant-design/icons';
import { Form, Input, Button, Select } from 'antd';

import { AppDispatch, RootState } from '../../store/types';
import { IpcChannels } from '../../types/processDto';
import { thunks } from '../../store';

interface SelectFolderDialogResponse {
	canceled: boolean;
	filePaths: string[];
}

const { Item } = Form;

const StyledButton = styled(Button)`
	width: 100%;
`;

const General: React.FunctionComponent = () => {
	const dispatch = useDispatch<AppDispatch>();

	const imagesFolderPath = useSelector((state: RootState) => state.settings.imagesFolderPath);
	const theme = useSelector((state: RootState) => state.settings.theme);

	const handleThemeChange = (value: 'dark' | 'light'): void => {
		dispatch(thunks.settings.updateTheme(value)).then(() => {
			window.api.send(IpcChannels.THEME_CHANGED);
		});
	};

	const handleOpenDirectory = (): void => {
		window.api.send(IpcChannels.OPEN_PATH, imagesFolderPath);
	};

	const handleSelectDirectory = (): void => {
		window.api.invoke<SelectFolderDialogResponse>(IpcChannels.OPEN_SELECT_FOLDER_DIALOG).then((response) => {
			if (!response.canceled) {
				dispatch(thunks.settings.updateImagePath(response.filePaths[0]));
			}
		});
	};
	return (
		<Form>
			<Item label='Path to images' labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
				<Input value={imagesFolderPath} />
			</Item>
			<Item wrapperCol={{ span: 16, offset: 4 }}>
				<StyledButton onClick={handleSelectDirectory} style={{ width: '100px' }}>
					<FolderOutlined /> Select
				</StyledButton>
				<StyledButton onClick={handleOpenDirectory} style={{ width: '100px', marginLeft: '8px' }}>
					<FolderOpenOutlined /> Open
				</StyledButton>
			</Item>
			<Item label='Theme' labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
				<Select defaultValue={theme} style={{ width: '150px' }} onChange={handleThemeChange}>
					<Select.Option key='dark' value='dark'>
						Dark
					</Select.Option>
					<Select.Option key='light' value='light'>
						Light
					</Select.Option>
				</Select>
			</Item>
		</Form>
	);
};

export default General;
