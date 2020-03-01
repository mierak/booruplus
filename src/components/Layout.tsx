import React, { useState, useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Layout, Menu, Icon, Input, Affix } from 'antd';
import { Post } from '../../types/gelbooruTypes';
import { getPostsForTags } from '../apiService';
import { State } from '../../store/main';
import { setPosts } from '../../store/posts';
import { View, setActiveView } from '../../store/system';

const { Content, Footer, Sider } = Layout;

interface Props extends PropsFromRedux {
	children?: React.ReactNode;
}

const AppLayout: React.FunctionComponent<Props> = (props: Props) => {
	const [searchTag, setSearchTag] = useState('kawakami_rokkaku holo');

	async function fetchData(): Promise<void> {
		const posts = await getPostsForTags(searchTag);
		props.setPosts(posts);
	}

	useEffect(() => {
		fetchData();
	}, []);

	const setActiveView = (view: View): void => {
		props.setActiveView(view);
	};

	return (
		<Layout style={{ minHeight: '100vh' }}>
			<Affix offsetTop={0}>
				<Sider collapsible style={{ height: '100vh' }}>
					<div className="logo" />
					<Menu theme="dark" defaultSelectedKeys={['thumbnails']} mode="inline" selectedKeys={[props.activeView]}>
						<Menu.Item key="dashboard" onClick={(): void => setActiveView('dashboard')}>
							<Icon type="dashboard" />
							<span>Dashboard</span>
						</Menu.Item>
						<Menu.Item key="thumbnails" onClick={(): void => setActiveView('thumbnails')}>
							<Icon type="unordered-list" />
							<span>Thumbnails</span>
						</Menu.Item>
						<Menu.Item key="image" onClick={(): void => setActiveView('image')}>
							<Icon type="file-image" />
							<span>Image View</span>
						</Menu.Item>
					</Menu>
				</Sider>
			</Affix>
			<Layout>
				<Layout.Header style={{ display: 'flex', alignItems: 'center' }}>
					<Input.Search
						placeholder="input search text"
						onSearch={(value): void => {
							setSearchTag(value);
							fetchData();
						}}
						enterButton
					/>
				</Layout.Header>
				<Content>{props.children}</Content>
				<Footer style={{ textAlign: 'center' }}>Ant Design ©2018 Created by Ant UED</Footer>
			</Layout>
		</Layout>
	);
};

interface StateFromProps {
	posts: Post[];
	activeView: View;
}

const mapState = (state: State): StateFromProps => ({
	posts: state.posts.posts,
	activeView: state.system.activeView
});

const mapDispatch = {
	setPosts,
	setActiveView
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(AppLayout);
