import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { RootState } from '../store/types';

import TaskProgress from '../components/TaskProgress';
import { List } from 'antd';

interface Props {
	className?: string;
}

const Container = styled.div`
	overflow-x: hidden;
`;

const Tasks: React.FunctionComponent<Props> = (props: Props) => {
	const taskIds = useSelector((state: RootState) => Object.keys(state.tasks.tasks));
	const [tasksArray, setTasksArray] = useState<string[]>([]);

	useEffect(() => {
		setTasksArray(taskIds.sort().reverse());
	}, [taskIds.length]);

	const renderItem = (id: string): React.ReactNode => {
		return (
			<List.Item>
				<TaskProgress key={`task${id}`} taskId={parseInt(id)} />
			</List.Item>
		);
	};

	return (
		<Container className={props.className}>
			<List size="small" renderItem={renderItem} dataSource={tasksArray}></List>
		</Container>
	);
};

export default Tasks;
