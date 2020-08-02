import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { RootState } from '../store/types';

import TaskProgress from '../components/TaskProgress';
import { List } from 'antd';
import { createSelector } from '@reduxjs/toolkit';
import { Tasks } from '../store/tasks';

interface Props {
	className?: string;
}

const Container = styled.div`
	overflow-x: hidden;
`;

const taskIdsSelector = createSelector<RootState, Tasks, string[]>(
	(state) => state.tasks.tasks,
	(tasks) => Object.keys(tasks)
);

const Tasks: React.FunctionComponent<Props> = (props: Props) => {
	const [tasksArray, setTasksArray] = useState<string[]>([]);
	const taskIds = useSelector(taskIdsSelector);

	useEffect(() => {
		setTasksArray(taskIds.sort().reverse());
		window.log.debug(taskIds);
	}, [taskIds, taskIds.length]);

	const renderItem = (id: string): React.ReactNode => {
		return (
			<List.Item>
				<TaskProgress key={`task${id}`} taskId={parseInt(id)} />
			</List.Item>
		);
	};

	return (
		<Container className={props.className}>
			<List size='small' renderItem={renderItem} dataSource={tasksArray} />
		</Container>
	);
};

export default Tasks;
