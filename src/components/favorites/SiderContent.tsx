import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { EventDataNode } from 'rc-tree/lib/interface';
import { Dropdown, Menu, Tree } from 'antd';

import { actions, thunks } from '@store';
import { AppDispatch, RootState } from '@store/types';
import { ActiveModal } from '@appTypes/modalTypes';

interface PProps {
	x: number;
	y: number;
}

type Actions = 'add' | 'delete' | 'rename' | 'mark-as-default' | 'move-selected' | 'move-all' | 'export-directory';

const DummyContextMenuPositionerDiv = styled.div<PProps>`
	position: absolute;
	left: ${(props): number => props.x}px;
	top: ${(props): number => props.y}px;
`;

const StyledScrollContainer = styled.div`
	overflow: auto;
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: column;
`;

const StyledSiderContentContainer = styled.div`
	height: 100%;
	overflow: hidden;
`;

const StyledTreeEmptySpace = styled.div`
	flex: 1 1 auto;
	width: 100%;
	min-height: 30px;
`;

const StyledDirectoryTree = styled(Tree.DirectoryTree)`
	overflow: hidden;
	&& {
		flex: 0 0 auto;
		margin-top: 10px;
		min-width: 100%;
		width: max-content;
	}
`;

const SiderContent: React.FunctionComponent = () => {
	const dispatch = useDispatch<AppDispatch>();
	const rootNode = useSelector((state: RootState) => state.favorites.rootNode);
	const activeNodeKey = useSelector((state: RootState) => state.favorites.activeNodeKey);
	const isCollapsed = useSelector((state: RootState) => state.system.isFavoritesDirectoryTreeCollapsed);
	const posts = useSelector((state: RootState) => state.posts.posts.favorites);

	const [selectedNodeKey, setSelectedNodeKey] = useState(0);
	const [align, setAlign] = useState<[number, number]>([0, 0]);
	const [visible, setVisible] = useState(false);
	const [contextMenuActions, setContextMenuActions] = useState<Actions[]>([]);
	const expanedKeys = useSelector((state: RootState) => state.settings.favorites.expandedKeys);

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
					dispatch(
						actions.modals.showModal(ActiveModal.ADD_FAVORITES_DIRECTORY, {
							selectedNodeKey,
						})
					);
				}}
			>
				Add Sub-Folder
			</Menu.Item>
		);
		const deleteAction = (
			<Menu.Item
				onClick={(): void => {
					setVisible(false);
					dispatch(
						actions.modals.showModal(ActiveModal.DELETE_FAVORITES_DIRECTORY, {
							selectedNodeKey,
						})
					);
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
					dispatch(
						actions.modals.showModal(ActiveModal.RENAME_FAVORITES_DIRECTORY, {
							targetDirectoryKey: selectedNodeKey,
						})
					);
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
					dispatch(
						actions.modals.showModal(ActiveModal.MOVE_POSTS_TO_DIRECTORY_CONFIRMATION, {
							targetDirectoryKey: selectedNodeKey,
							postsToMove: posts.filter((p) => p.selected),
						})
					);
				}}
				key='4'
			>
				Move Selected Posts Here
			</Menu.Item>
		);
		const moveAllAction = (
			<Menu.Item
				onClick={async (): Promise<void> => {
					setVisible(false);
					dispatch(
						actions.modals.showModal(ActiveModal.MOVE_POSTS_TO_DIRECTORY_CONFIRMATION, {
							targetDirectoryKey: selectedNodeKey,
							postsToMove: posts,
						})
					);
				}}
				key='5'
			>
				Move All Posts Here
			</Menu.Item>
		);
		const exportAction = (
			<Menu.Item
				onClick={async (): Promise<void> => {
					setVisible(false);
					dispatch(thunks.favorites.exportDirectory({ targetDirectoryKey: selectedNodeKey }));
				}}
				key='6'
			>
				Export to Folder
			</Menu.Item>
		);
		return (
			<Menu>
				{contextMenuActions.includes('add') && addAction}
				{contextMenuActions.includes('rename') && renameAction}
				{contextMenuActions.includes('delete') && deleteAction}
				{contextMenuActions.includes('move-selected') && moveSelectedAction}
				{contextMenuActions.includes('move-all') && moveAllAction}
				{contextMenuActions.includes('export-directory') && exportAction}
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
			rootNode && setSelectedNodeKey(Number(rootNode.key));

			setTimeout(() => {
				setVisible(true);
			}, 0);
		}
	};

	const handleTreeRightClick = async (info: {
		event: React.MouseEvent<Element, MouseEvent>;
		node: EventDataNode;
	}): Promise<void> => {
		if (visible) {
			setVisible(false);
		}

		if (treeContainerRef.current) {
			const contextMenuActions: Actions[] = ['add', 'delete', 'rename', 'move-all', 'export-directory'];
			if (posts.some((p) => p.selected)) contextMenuActions.push('move-selected');
			setContextMenuActions(contextMenuActions);
			setAlign([info.event.clientX - treeContainerRef.current.getBoundingClientRect().x, info.event.clientY]);
			info.node && setSelectedNodeKey(Number(info.node.key));
		}

		setTimeout(() => {
			setVisible(true);
		}, 0);
	};

	return (
		<StyledSiderContentContainer ref={treeContainerRef}>
			<StyledScrollContainer>
				{!isCollapsed && (
					<StyledDirectoryTree
						multiple
						draggable
						blockNode
						defaultExpandAll
						selectedKeys={[activeNodeKey.toString()]}
						treeData={rootNode?.children}
						onRightClick={handleTreeRightClick}
						onExpand={(expandedKeys, _): void => {
							dispatch(actions.settings.setFavoritesExpandedKeys(expandedKeys));
						}}
						onSelect={(_, info): void => {
							info.nativeEvent.stopPropagation();
							dispatch(thunks.favorites.fetchPostsInDirectory(parseInt(info.node.key.toString())));
							dispatch(actions.favorites.setActiveNodeKey(parseInt(info.node.key.toString())));
						}}
						onClick={(): void => setVisible(false)}
						expandedKeys={expanedKeys}
						expandAction={'doubleClick'}
					/>
				)}
				<StyledTreeEmptySpace data-testid='sider-content-empty-space' onMouseDown={handleEmptySpaceClick} />
			</StyledScrollContainer>

			<Dropdown overlay={renderMenu()} visible={visible}>
				<DummyContextMenuPositionerDiv x={align[0]} y={align[1]} />
			</Dropdown>
		</StyledSiderContentContainer>
	);
};

export default SiderContent;
