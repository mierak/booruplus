import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { FolderOpenOutlined, FolderOutlined, ImportOutlined, ExportOutlined } from '@ant-design/icons';
import { Form, Input, Button, Select, Checkbox } from 'antd';

import { AppDispatch, RootState } from '../../store/types';
import { IpcChannels } from '../../types/processDto';
import { thunks, actions } from '../../store';

interface SelectFolderDialogResponse {
	canceled: boolean;
	filePaths: string[];
}

interface ButtonProps {
	$isOffset?: boolean;
}

const { Item } = Form;

const StyledButton = styled(Button)<ButtonProps>`
	width: 100px;
	margin-left: ${(props: ButtonProps): string => (props.$isOffset ? '8px' : '0')};
`;

const labelCol = { span: 4 };
const wrapperCol = { span: 16 };

const General: React.FunctionComponent = () => {
	const dispatch = useDispatch<AppDispatch>();

	const imagesFolderPath = useSelector((state: RootState) => state.settings.imagesFolderPath);
	const theme = useSelector((state: RootState) => state.settings.theme);
	const downloadMissingImages = useSelector((state: RootState) => state.settings.downloadMissingImages);

	const handleThemeChange = (value: 'dark' | 'light'): void => {
		dispatch(thunks.settings.updateTheme(value)).then(() => {
			window.api.send(IpcChannels.THEME_CHANGED);
		});
	};

	const handleOpenDirectory = (): void => {
		window.api.send(IpcChannels.OPEN_PATH, imagesFolderPath);
	};

	const handleSelectDirectory = (): void => {
		window.api.invoke<SelectFolderDialogResponse>(IpcChannels.OPEN_SELECT_IMAGES_FOLDER_DIALOG).then((response) => {
			if (!response.canceled) {
				dispatch(thunks.settings.updateImagePath(response.filePaths[0]));
			}
		});
	};

	const handleToggleDownloadMissingIMages = (): void => {
		dispatch(actions.settings.toggleDownloadMissingImages());
	};

	const handleImport = (): void => {
		dispatch(thunks.settings.importDatabase());
	};

	const handleExport = (): void => {
		dispatch(thunks.settings.exportDatabase());
	};

	return (
		<Form>
			<Item label='Path to images' labelCol={labelCol} wrapperCol={wrapperCol}>
				<Input value={imagesFolderPath} />
			</Item>
			<Item wrapperCol={{ ...wrapperCol, offset: 4 }}>
				<StyledButton onClick={handleSelectDirectory}>
					<FolderOutlined /> Select
				</StyledButton>
				<StyledButton $isOffset onClick={handleOpenDirectory}>
					<FolderOpenOutlined /> Open
				</StyledButton>
			</Item>
			<Item label='Theme' labelCol={labelCol} wrapperCol={wrapperCol}>
				<Select defaultValue={theme} style={{ width: '150px' }} onChange={handleThemeChange}>
					<Select.Option key='dark' value='dark'>
						Dark
					</Select.Option>
					<Select.Option key='light' value='light'>
						Light
					</Select.Option>
				</Select>
			</Item>
			<Item label='Import/Export' labelCol={labelCol} wrapperCol={wrapperCol}>
				<StyledButton onClick={handleImport}>
					<ImportOutlined /> Import
				</StyledButton>
				<StyledButton $isOffset onClick={handleExport}>
					<ExportOutlined /> Export
				</StyledButton>
			</Item>
			<Item wrapperCol={{ offset: 4 }}>
				<Checkbox checked={downloadMissingImages} onClick={handleToggleDownloadMissingIMages}>
					Download missing images
				</Checkbox>
			</Item>
		</Form>
	);
};

export default General;
