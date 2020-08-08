import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { EventDataNode } from 'rc-tree/lib/interface';
import { Dropdown, Menu, Tree } from 'antd';

import { actions, thunks } from '../../store';
import { AppDispatch, RootState } from '../../store/types';

interface PProps {
	x: number;
	y: number;
}

type Actions = 'add' | 'delete' | 'rename' | 'mark-as-default' | 'move-selected';

const DummyContextMenuPositionerDiv = styled.div<PProps>`
	position: absolute;
	left: ${(props): number => props.x}px;
	top: ${(props): number => props.y}px;
`;

const StyledSiderContentContainer = styled.div`
	height: 100%;
	overflow-x: hidden;
	padding-top: 10px;
	padding-bottom: 10px;
`;

const StyledTreeEmptySpace = styled.div`
	width: 100%;
	height: 100vh;
`;

const StyledDirectoryTree = styled(Tree.DirectoryTree)`
	overflow-y: auto;
	overflow-x: hidden;
	max-height: 100vh;

	&& .ant-tree-switcher {
		width: 5px;
	}
`;

const SiderContent: React.FunctionComponent = () => {
	const dispatch = useDispatch<AppDispatch>();
	const rootNode = useSelector((state: RootState) => state.favorites.rootNode);
	const isCollapsed = useSelector((state: RootState) => state.system.isFavoritesDirectoryTreeCollapsed);
	const selectedPostIds = useSelector((state: RootState) => state.posts.posts.filter((post) => post.selected).map((post) => post.id));

	const [align, setAlign] = useState<[number, number]>([0, 0]);
	const [visible, setVisible] = useState(false);
	const [contextMenuActions, setContextMenuActions] = useState<Actions[]>([]);
	const expanedKeys = useSelector((state: RootState) => state.favorites.expandedKeys);

	const treeContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		(async (): Promise<void> => {
			dispatch(thunks.favorites.fetchAllKeys());
			dispatch(thunks.favorites.fetchTreeData());
		})();
	}, [dispatch]);

	const renderMenu = (): JSX.Element => {
		const addAction = (
			<Menu.Item
				key='1'
				onClick={(): void => {
					setVisible(false);
					dispatch(actions.modals.showModal('add-favorites-directory'));
				}}
			>
				Add Sub-Folder
			</Menu.Item>
		);
		const deleteAction = (
			<Menu.Item
				onClick={(): void => {
					setVisible(false);
					dispatch(actions.modals.showModal('delete-favorites-directory'));
				}}
				key='2'
			>
				Delete
			</Menu.Item>
		);
		const renameAction = (
			<Menu.Item
				onClick={(): void => {
					setVisible(false);
					dispatch(actions.modals.showModal('rename-favorites-directory'));
				}}
				key='3'
			>
				Rename
			</Menu.Item>
		);
		const moveSelectedAction = (
			<Menu.Item
				onClick={async (): Promise<void> => {
					setVisible(false);
					dispatch(actions.modals.addToFavoritesModal.setPostIdsToFavorite('selected'));
					dispatch(actions.modals.showModal('move-selected-to-directory-confirmation'));
				}}
				key='4'
			>
				Move Selected Posts Here
			</Menu.Item>
		);
		return (
			<Menu>
				{contextMenuActions.includes('add') && addAction}
				{contextMenuActions.includes('rename') && renameAction}
				{contextMenuActions.includes('delete') && deleteAction}
				{contextMenuActions.includes('move-selected') && moveSelectedAction}
			</Menu>
		);
	};

	const handleEmptySpaceClick = (event: React.MouseEvent<HTMLDivElement>): void => {
		if (visible) {
			setVisible(false);
		}

		if (treeContainerRef.current && event.button === 2) {
			setContextMenuActions(['add']);
			setAlign([event.clientX - treeContainerRef.current.getBoundingClientRect().x, event.clientY]);
			rootNode && dispatch(actions.favorites.setSelectedNodeKey(parseInt(rootNode.key)));

			setTimeout(() => {
				setVisible(true);
			}, 0);
		}
	};

	const handleTreeRightClick = async (info: { event: React.MouseEvent<Element, MouseEvent>; node: EventDataNode }): Promise<void> => {
		if (visible) {
			setVisible(false);
		}

		if (treeContainerRef.current) {
			const contextMenuActions: Actions[] = ['add', 'delete', 'rename'];
			if (selectedPostIds.length > 0) contextMenuActions.push('move-selected');
			setContextMenuActions(contextMenuActions);
			setAlign([info.event.clientX - treeContainerRef.current.getBoundingClientRect().x, info.event.clientY]);
			info.node && dispatch(actions.favorites.setSelectedNodeKey(parseInt(info.node.key.toString())));
		}

		setTimeout(() => {
			setVisible(true);
		}, 0);
	};

	return (
		<StyledSiderContentContainer ref={treeContainerRef}>
			{!isCollapsed && (
				<StyledDirectoryTree
					multiple
					draggable
					blockNode
					defaultExpandAll
					defaultSelectedKeys={['1']}
					treeData={rootNode?.children}
					onRightClick={handleTreeRightClick}
					onExpand={(_, node): void => {
						node.node.expanded = true;
					}}
					onSelect={(_, info): void => {
						dispatch(thunks.favorites.fetchPostsInDirectory(parseInt(info.node.key.toString())));
						dispatch(actions.favorites.setActiveNodeKey(parseInt(info.node.key.toString())));
					}}
					onClick={(): void => setVisible(false)}
					expandedKeys={expanedKeys}
					switcherIcon={<></>}
				/>
			)}

			<Dropdown overlay={renderMenu()} visible={visible}>
				<DummyContextMenuPositionerDiv x={align[0]} y={align[1]} />
			</Dropdown>
			{<StyledTreeEmptySpace data-testid='sider-content-empty-space' onMouseDown={handleEmptySpaceClick} />}
		</StyledSiderContentContainer>
	);
};

export default SiderContent;
