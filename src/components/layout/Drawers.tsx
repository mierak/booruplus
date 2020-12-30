import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Drawer } from 'antd';

import { AppDispatch, RootState } from '@store/types';
import { actions } from '@store';

import Tasks from '@pages/Tasks';

type DrawerProps = {
	$disablePadding?: boolean;
};
const StyledDrawer = styled(Drawer)<DrawerProps>`
	&& .ant-drawer-body {
		${(props): string => (props.$disablePadding ? 'padding: 0' : '')};
	}
`;

const Drawers: React.FunctionComponent = () => {
	const dispatch = useDispatch<AppDispatch>();

	const isTasksDrawerVisible = useSelector((state: RootState) => state.system.isTasksDrawerVisible);

	const handleTasksDrawerClose = (): void => {
		dispatch(actions.system.setTasksDrawerVisible(false));
	};

	return (
		<>
			<StyledDrawer
				$disablePadding
				title='Downloads'
				placement='right'
				width={500}
				visible={isTasksDrawerVisible}
				onClose={handleTasksDrawerClose}
			>
				<Tasks />
			</StyledDrawer>
		</>
	);
};

export default Drawers;
