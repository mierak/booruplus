import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Layout, Menu, Affix } from 'antd';
import {
	DashboardOutlined,
	UnorderedListOutlined,
	HeartOutlined,
	TagsOutlined,
	SaveOutlined,
	SettingOutlined,
	DownloadOutlined,
	ClockCircleOutlined,
} from '@ant-design/icons';

import { actions } from '@store';
import { RootState, View } from '@store/types';
import Modals from '@components/layout/Modals';
import { ActiveModal } from '@appTypes/modalTypes';

import Drawers from './Drawers';

const { Content, Sider } = Layout;

type Props = {
	children?: React.ReactNode;
	className?: string;
};

const NavigationMenu: React.FunctionComponent = () => {
	const dispatch = useDispatch();
	const activeView = useSelector((state: RootState) => state.system.activeView);
	const isQueueEmpty = useSelector((state: RootState) => !state.searchContexts.checkLaterQueue.posts.length);

	const handleMenuClick = (view: View): void => {
		dispatch(actions.system.setActiveView(view));
	};

	const handleTasksDrawerOpen = (): void => {
		dispatch(actions.system.setTasksDrawerVisible(true));
	};

	return (
		<Menu theme='dark' mode='inline' selectedKeys={[activeView]}>
			<Menu.Item key='dashboard' onClick={(): void => handleMenuClick('dashboard')}>
				<DashboardOutlined />
				<span>Dashboard</span>
			</Menu.Item>
			<Menu.Item key='searches' onClick={(): void => handleMenuClick('searches')}>
				<UnorderedListOutlined />
				<span>Search</span>
			</Menu.Item>
			<Menu.Item key='saved-searches' onClick={(): void => handleMenuClick('saved-searches')}>
				<SaveOutlined />
				<span>Saved Searches</span>
			</Menu.Item>
			<Menu.Item key='favorites' onClick={(): void => handleMenuClick('favorites')}>
				<HeartOutlined />
				<span>Favorites</span>
			</Menu.Item>
			<Menu.Item key='tag-list' onClick={(): void => handleMenuClick('tag-list')}>
				<TagsOutlined />
				<span>Tag List</span>
			</Menu.Item>
			<Menu.Item key='tasks' onClick={handleTasksDrawerOpen}>
				<DownloadOutlined />
				<span>Downloads</span>
			</Menu.Item>
			<Menu.Item
				key='settings'
				onClick={(): void => {
					dispatch(actions.modals.showModal(ActiveModal.SETTINGS));
				}}
			>
				<SettingOutlined />
				<span>Settings</span>
			</Menu.Item>
			{!isQueueEmpty && (
				<Menu.Item key='check-later' onClick={(): void => handleMenuClick('check-later')}>
					<ClockCircleOutlined />
					<span>Check Later</span>
				</Menu.Item>
			)}
		</Menu>
	);
};

const AppLayout: React.FunctionComponent<Props> = (props: Props) => {
	return (
		<>
			<Layout style={{ minHeight: '100vh' }} className={props.className}>
				<Affix offsetTop={0}>
					<Sider collapsible style={{ height: '100vh' }}>
						<NavigationMenu />
					</Sider>
				</Affix>
				<Layout>
					<Content>
						{props.children}
						<Drawers />
					</Content>
				</Layout>
			</Layout>
			<Modals />
		</>
	);
};

export default AppLayout;
