import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Layout, Menu, Affix, Drawer } from 'antd';
import { Post } from '../../types/gelbooruTypes';
import { State } from '../../store/main';
import { setPosts } from '../../store/posts';
import { View, setActiveView, setSearchFormDrawerVisible } from '../../store/system';
import SearchForm from './SearchForm';

const { Content, Sider } = Layout;

interface Props extends PropsFromRedux {
	children?: React.ReactNode;
}

const AppLayout: React.FunctionComponent<Props> = (props: Props) => {
	const setActiveView = (view: View): void => {
		props.setActiveView(view);
	};

	const handleSearchFormDrawerClose = (): void => {
		props.setSearchFormDrawerVisible(false);
	};

	const handleSearchFormDrawerOpen = (): void => {
		props.setSearchFormDrawerVisible(true);
	};

	return (
		<Layout style={{ minHeight: '100vh' }}>
			<Affix offsetTop={0}>
				<Sider collapsible style={{ height: '100vh' }}>
					<div className="logo" />
					<Menu theme="dark" defaultSelectedKeys={['thumbnails']} mode="inline" selectedKeys={[props.activeView]}>
						<Menu.Item key="dashboard" onClick={(): void => setActiveView('dashboard')}>
							{/* <Icon type="dashboard" /> */}
							<span>Dashboard</span>
						</Menu.Item>
						<Menu.Item key="thumbnails" onClick={(): void => setActiveView('thumbnails')}>
							{/* <Icon type="unordered-list" /> */}
							<span>Thumbnails</span>
						</Menu.Item>
						<Menu.Item key="image" onClick={(): void => setActiveView('image')}>
							{/* <Icon type="file-image" /> */}
							<span>Image View</span>
						</Menu.Item>
						<Menu.Item key="saved-searches" onClick={(): void => setActiveView('saved-searches')}>
							{/* <Icon type="file-image" /> */}
							<span>Saved Searches</span>
						</Menu.Item>
						<Menu.Item key="favorites" onClick={(): void => setActiveView('favorites')}>
							{/* <Icon type="file-image" /> */}
							<span>Favorites</span>
						</Menu.Item>
						<Menu.Item key="tag-list" onClick={(): void => setActiveView('tag-list')}>
							{/* <Icon type="file-image" /> */}
							<span>Tag List</span>
						</Menu.Item>
						<Menu.Item key="online-search-drawer" onClick={handleSearchFormDrawerOpen}>
							{/* <Icon type="file-image" /> */}
							<span>Online Search</span>
						</Menu.Item>
					</Menu>
				</Sider>
			</Affix>
			<Layout>
				<Content>
					<Drawer
						title="New Online Search"
						placement="right"
						width={700}
						closable={true}
						visible={props.searchFormDrawerVisible}
						onClose={handleSearchFormDrawerClose}
					>
						<SearchForm />
					</Drawer>
					{props.children}
				</Content>
			</Layout>
		</Layout>
	);
};

interface StateFromProps {
	posts: Post[];
	activeView: View;
	searchFormDrawerVisible: boolean;
}

const mapState = (state: State): StateFromProps => ({
	posts: state.posts.posts,
	activeView: state.system.activeView,
	searchFormDrawerVisible: state.system.searchFormDrawerVsibile
});

const mapDispatch = {
	setPosts,
	setActiveView,
	setSearchFormDrawerVisible
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(AppLayout);
