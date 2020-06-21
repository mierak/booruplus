import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Drawer } from 'antd';

import { AppDispatch, RootState } from '../../store/types';
import { actions } from '../../store';
import DownloadedSearchForm from '../DownloadedSearchForm';
import OnlineSearchForm from '../OnlineSearchForm';
import Tasks from '../../pages/Tasks';

interface DrawerProps {
	$disablePadding?: boolean;
}
const StyledDrawer = styled(Drawer)<DrawerProps>`
	&& .ant-drawer-body {
		${(props): string => (props.$disablePadding ? 'padding: 0' : '')};
	}
`;

const Drawers: React.FunctionComponent = () => {
	const dispatch = useDispatch<AppDispatch>();

	const searchFormDrawerVisible = useSelector((state: RootState) => state.system.isSearchFormDrawerVsibile);
	const downloadedSearchFormDrawerVisible = useSelector((state: RootState) => state.system.isDownloadedSearchFormDrawerVisible);
	const isTasksDrawerVisible = useSelector((state: RootState) => state.system.isTasksDrawerVisible);

	const handleSearchFormDrawerClose = (): void => {
		dispatch(actions.system.setSearchFormDrawerVisible(false));
	};

	const handleDownloadedSearchFormDrawerClose = (): void => {
		dispatch(actions.system.setDownloadedSearchFormDrawerVisible(false));
	};

	const handleTasksDrawerClose = (): void => {
		dispatch(actions.system.setTasksDrawerVisible(false));
	};

	return (
		<>
			<Drawer
				title="New Online Search"
				placement="right"
				width={700}
				closable={true}
				visible={searchFormDrawerVisible}
				onClose={handleSearchFormDrawerClose}
			>
				<OnlineSearchForm />
			</Drawer>
			<Drawer
				title="New Offline Search"
				placement="right"
				width={700}
				visible={downloadedSearchFormDrawerVisible}
				onClose={handleDownloadedSearchFormDrawerClose}
			>
				<DownloadedSearchForm />
			</Drawer>
			<StyledDrawer
				$disablePadding
				title="Downloads"
				placement="right"
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
