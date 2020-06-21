import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Progress, Popover } from 'antd';

import { RootState, Task, AppDispatch } from '../store/types';
import { thunks } from '../store';
import moment from 'moment';

interface Props {
	className?: string;
	taskId: number;
}

const TaskProgress: React.FunctionComponent<Props> = (props: Props) => {
	const dispatch = useDispatch<AppDispatch>();

	const task = useSelector((state: RootState) => state.tasks.tasks[props.taskId]);

	const momentFormat = 'DD/MM/YYYY, HH:mm:ss';

	const formatTimestamp = (timestamp: number): string => {
		return moment(timestamp).format(momentFormat);
	};

	const getTaskProgressStatus = (task: Task): 'exception' | 'success' | 'active' | undefined => {
		if (task.state === 'canceled') {
			return 'exception';
		}
		if (task.itemsDone / task.items >= 1) {
			return 'success';
		}
		if (task.state === 'preparing') {
			return 'active';
		}
	};

	const handleOpen = (): void => {
		dispatch(thunks.posts.fetchPostsByIds(task.postIds));
	};

	const handleCancel = (): void => {
		dispatch(thunks.tasks.cancel(props.taskId));
	};

	const renderButtons = (): React.ReactNode => {
		const buttons: React.ReactNode[] = [];
		const taskProgress = task.itemsDone / task.items;

		taskProgress >= 1 &&
			buttons.push(
				<Button key="btn-task-open" type="link" onClick={handleOpen}>
					Open
				</Button>
			);
		task.state !== 'canceled' &&
			task.state !== 'failed' &&
			taskProgress < 1 &&
			buttons.push(
				<Button key="btn-task-cancel" type="link" onClick={handleCancel}>
					Cancel
				</Button>
			);
		return buttons;
	};

	const getDescription = (): string => {
		switch (task.state) {
			case 'canceled':
				return 'Canceled';
			case 'completed':
				return 'Completed';
			case 'failed':
				return 'Failed';
			case 'preparing':
				return 'Preparing to download';
			case 'downloading':
				return `Downloading ${task.itemsDone} of ${task.items} posts`;
		}
	};

	//TODO extract to own component and test
	const renderWithTooltip = (children: React.ReactElement): React.ReactNode => {
		const items: string[] = [];
		items.push(`Added: ${formatTimestamp(task.timestampStarted)}`);
		task.timestampDone && items.push(`${task.state === 'canceled' ? 'Canceled' : 'Completed'}: ${formatTimestamp(task.timestampDone)}`);

		const content = items.map((item, index) => <div key={item + '' + index}>{item}</div>);
		return (
			<Popover content={content} destroyTooltipOnHide mouseEnterDelay={0.3}>
				{children}
			</Popover>
		);
	};

	const calculateProgressPercent = (): number => Math.round((task.itemsDone / task.items) * 100);

	return (
		<>
			{renderWithTooltip(
				<div style={{ width: '100%' }}>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '32px' }}>
						{<span>{getDescription()}</span>}
						{renderButtons()}
					</div>
					{<Progress key={task.id} status={getTaskProgressStatus(task)} percent={calculateProgressPercent()} />}
				</div>
			)}
		</>
	);
};

export default TaskProgress;
