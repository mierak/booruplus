import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { List, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

import { RootState } from '@store/types';
import TaskProgress from '@components/TaskProgress';
import { thunks } from '@store';

interface Props {
	className?: string;
}

const Container = styled.div`
	overflow-x: hidden;
`;

const Tasks: React.FunctionComponent<Props> = (props: Props) => {
	const dispatch = useDispatch();
	const taskIds = useSelector((state: RootState) => Object.keys(state.tasks.tasks));

	const handleRemoveTask = (id: string): void => {
		dispatch(thunks.tasks.removeTask(id));
	};

	const renderItem = (id: string): React.ReactNode => {
		return (
			<List.Item>
				<TaskProgress key={`task${id}`} taskId={parseInt(id)} />
				<Button type='link' icon={<CloseOutlined />} onClick={(): void => handleRemoveTask(id)} />
			</List.Item>
		);
	};

	return (
		<Container className={props.className}>
			<List size='small' renderItem={renderItem} dataSource={taskIds.sort((a, b) => parseInt(b) - parseInt(a))} />
		</Container>
	);
};

export default Tasks;
