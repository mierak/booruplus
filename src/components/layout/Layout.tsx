import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Layout, Menu, Affix } from 'antd';
import {
	DashboardOutlined,
	UnorderedListOutlined,
	FileImageOutlined,
	HeartOutlined,
	TagsOutlined,
	FormOutlined,
	SaveOutlined,
	SettingOutlined,
	DownloadOutlined,
} from '@ant-design/icons';

import { actions } from '../../store';
import { RootState, View } from '../../store/types';

import Modals from '../Modals';
import Drawers from './Drawers';

const { Content, Sider } = Layout;

interface Props {
	children?: React.ReactNode;
	className?: string;
}

const AppLayout: React.FunctionComponent<Props> = (props: Props) => {
	const dispatch = useDispatch();
	const activeView = useSelector((state: RootState) => state.system.activeView);

	const handleMenuClick = (view: View): void => {
		dispatch(actions.system.setActiveView(view));
	};

	const handleSearchFormDrawerOpen = (): void => {
		dispatch(actions.system.setSearchFormDrawerVisible(true));
	};

	const handleDownloadedSearchFormDrawerOpen = (): void => {
		dispatch(actions.system.setDownloadedSearchFormDrawerVisible(true));
	};

	const handleTasksDrawerOpen = (): void => {
		dispatch(actions.system.setTasksDrawerVisible(true));
	};

	return (
		<>
			<Layout style={{ minHeight: '100vh' }} className={props.className}>
				<Affix offsetTop={0}>
					<Sider collapsible style={{ height: '100vh' }}>
						<div className="logo" />
						<Menu theme="dark" defaultSelectedKeys={['thumbnails']} mode="inline" selectedKeys={[activeView]}>
							<Menu.Item key="dashboard" onClick={(): void => handleMenuClick('dashboard')}>
								<DashboardOutlined />
								<span>Dashboard</span>
							</Menu.Item>
							<Menu.Item key="thumbnails" onClick={(): void => handleMenuClick('thumbnails')}>
								<UnorderedListOutlined />
								<span>Thumbnails</span>
							</Menu.Item>
							<Menu.Item key="image" onClick={(): void => handleMenuClick('image')}>
								<FileImageOutlined />
								<span>Image View</span>
							</Menu.Item>
							<Menu.Item key="saved-searches" onClick={(): void => handleMenuClick('saved-searches')}>
								<SaveOutlined />
								<span>Saved Searches</span>
							</Menu.Item>
							<Menu.Item key="favorites" onClick={(): void => handleMenuClick('favorites')}>
								<HeartOutlined />
								<span>Favorites</span>
							</Menu.Item>
							<Menu.Item key="tag-list" onClick={(): void => handleMenuClick('tag-list')}>
								<TagsOutlined />
								<span>Tag List</span>
							</Menu.Item>
							<Menu.Item key="online-search-drawer" onClick={handleSearchFormDrawerOpen}>
								<FormOutlined />
								<span>Online Search</span>
							</Menu.Item>
							<Menu.Item key="offline-search-drawer" onClick={handleDownloadedSearchFormDrawerOpen}>
								<FormOutlined />
								<span>Offline Search</span>
							</Menu.Item>
							<Menu.Item key="tasks" onClick={handleTasksDrawerOpen}>
								<DownloadOutlined />
								<span>Downloads</span>
							</Menu.Item>
							<Menu.Item
								key="settings"
								onClick={(): void => {
									dispatch(actions.modals.showModal('settings'));
								}}
							>
								<SettingOutlined />
								<span>Settings</span>
							</Menu.Item>
						</Menu>
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
