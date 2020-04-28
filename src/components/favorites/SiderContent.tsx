import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { EventDataNode } from 'rc-tree/lib/interface';
import { Dropdown, Menu, Tree } from 'antd';

import { actions, thunks } from 'store';
import { AppDispatch, RootState } from 'store/types';

interface PProps {
	x: number;
	y: number;
}

type Actions = 'add' | 'delete' | 'rename' | 'mark-as-default';

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
	}, []);

	// TODO reread and refactor this whole section
	const renderMenu = (): JSX.Element => {
		const addAction = (
			<Menu.Item
				key="1"
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
				key="2"
			>
				Delete
			</Menu.Item>
		);
		return (
			<Menu>
				{contextMenuActions.includes('add') && addAction}
				{contextMenuActions.includes('delete') && deleteAction}
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
			rootNode && dispatch(actions.favorites.setSelectedNodeKey(rootNode.key));

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
			setContextMenuActions(['add', 'delete']);
			setAlign([info.event.clientX - treeContainerRef.current.getBoundingClientRect().x, info.event.clientY]);
			info.node && dispatch(actions.favorites.setSelectedNodeKey(info.node.key.toString()));
		}

		setTimeout(() => {
			setVisible(true);
		}, 0);
	};

	return (
		<StyledSiderContentContainer ref={treeContainerRef}>
			<StyledDirectoryTree
				multiple
				draggable
				blockNode
				treeData={rootNode?.children}
				onRightClick={handleTreeRightClick}
				onExpand={(_, { expanded, node }): void => {
					node.expanded = true;
				}}
				onSelect={(selectedKeys, info): void => {
					dispatch(thunks.favorites.fetchPostsInDirectory(info.node.key.toString()));
					dispatch(actions.favorites.setActiveNodeKey(info.node.key.toString()));
				}}
				onClick={(): void => setVisible(false)}
				defaultExpandAll
				expandedKeys={expanedKeys}
				switcherIcon={<></>}
			/>
			<Dropdown overlay={renderMenu()} visible={visible}>
				<DummyContextMenuPositionerDiv x={align[0]} y={align[1]} />
			</Dropdown>
			{<StyledTreeEmptySpace onMouseDown={handleEmptySpaceClick} />}
		</StyledSiderContentContainer>
	);
};

export default SiderContent;
