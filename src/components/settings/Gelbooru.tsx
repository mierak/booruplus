import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Descriptions, Form, Input } from 'antd';

import { AppDispatch, RootState } from '@store/types';
import { actions } from '@store';

import { IpcSendChannels } from '@appTypes/processDto';
import { validateApiKey } from '@util/utils';
import { OPTIONS_URL } from '@service/webService';

type ApiKeyValidationStatus = {
	validateStatus: 'error' | 'success' | '';
	message: string;
}

const { Item } = Form;

const Gelbooru: React.FunctionComponent = () => {
	const dispatch = useDispatch<AppDispatch>();

	const apiKey = useSelector((state: RootState) => state.settings.apiKey);
	const [apiKeyValidationStatus, setApiKeyValidationStatus] = useState<ApiKeyValidationStatus>({
		message: '',
		validateStatus: '',
	});

	const handleApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
		const key = event.currentTarget.value;
		if (!validateApiKey(key)) {
			setApiKeyValidationStatus({
				message: 'Wrong API key format. Did you copy it properly?',
				validateStatus: 'error',
			});
			return;
		} else {
			setApiKeyValidationStatus({
				message: '',
				validateStatus: 'success',
			});
		}
		dispatch(actions.settings.setApiKey(key));
	};

	const handleOpenGelbooruSettings = (): void => {
		window.api.send(IpcSendChannels.OPEN_IN_BROWSER, OPTIONS_URL);
	};

	return (
		<>
			<Form>
				<Item wrapperCol={{ offset: 4, span: 16 }}>
					<Descriptions>
						<Descriptions.Item key='api-key-description'>
							<p>
								This is generally not needed. But if you use this app excesivelly, Gelbooru might start limiting requests from
								you and you need to authenticate. You can find your API key on the bottom of Settings on Gelbooru under{' '}
								<a onClick={handleOpenGelbooruSettings}>Options</a>.
							</p>
						</Descriptions.Item>
					</Descriptions>
				</Item>
				<Item
					label='API key'
					labelCol={{ span: 4 }}
					wrapperCol={{ span: 16 }}
					hasFeedback
					validateStatus={apiKeyValidationStatus.validateStatus}
				>
					<Input onChange={handleApiKeyChange} value={apiKey} />
				</Item>
			</Form>
		</>
	);
};

export default Gelbooru;
