import React from 'react';
import styled from 'styled-components';
import { Progress as AntProgress, message } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useSelector, Provider } from 'react-redux';
import { RootState, AppDispatch } from 'store/types';
import { store, thunks } from 'store';
import { MessageType } from 'antd/lib/message';

interface Props {
	id: number;
}

const StyledProgress = styled(AntProgress)`
	display: flex;
	align-items: center;
`;

const Progress: React.FunctionComponent<Props> = ({ id }: Props) => {
	const task = useSelector((state: RootState) => state.tasks.tasks[id]);

	const getStatus = (): 'exception' | 'success' | 'active' => {
		if (task.isCanceled) {
			return 'exception';
		}
		if (task.progressPercent === 100) {
			return 'success';
		}
		return 'active';
	};

	return (
		<>
			{(task.progressPercent === 0 && 'Setting up. This might take a while...') || (
				<StyledProgress percent={Math.round(task.progressPercent)} status={getStatus()} showInfo={false} />
			)}
		</>
	);
};

export const useProgress = async (dispatch: AppDispatch): Promise<[number, MessageType]> => {
	const id = await dispatch(thunks.tasks.create());

	const close = message.loading({
		content: (
			<div style={{ width: '500px', display: 'flex' }}>
				<Provider store={store}>
					<Progress id={id} />
				</Provider>
				<div style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
					<a
						onClick={(): void => {
							// dispatch(actions.tasks.setCanceled({ id, value: true }));
						}}
						style={{ paddingLeft: '16px' }}
					>
						Cancel
					</a>
					<CloseOutlined onClick={(): void => close()} style={{ fontSize: '14px', marginLeft: '8px', marginRight: '0' }} />
				</div>
			</div>
		),
		duration: 0,
		icon: <></>,
	});

	return [id, close];
};
