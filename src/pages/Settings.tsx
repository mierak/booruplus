import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { FolderOpenOutlined } from '@ant-design/icons';
import { Button, Card, Input, Form } from 'antd';

import { actions } from '../../store';
import { RootState } from '../../store/types';

const Container = styled.div`
	padding: 10px;
	height: 100vh;
`;

const { Item } = Form;

const Settings: React.FunctionComponent = () => {
	const dispatch = useDispatch();

	const imagesFolderPath = useSelector((state: RootState) => state.settings.imagesFolderPath);

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
				</Form>
			</Card>
		</Container>
	);
};

export default Settings;
