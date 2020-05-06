import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { Modal, Tree, Button } from 'antd';
import { EventDataNode, DataNode } from 'rc-tree/lib/interface';

import { actions, thunks } from 'store/';
import { RootState, AppDispatch, TreeNode } from 'store/types';

import { openNotificationWithIcon } from 'types/components';

interface Info {
	event: string;
	selected: boolean;
	node: EventDataNode;
	selectedNodes: DataNode[];
	nativeEvent: MouseEvent;
}

const StyledDirectoryTree = styled(Tree.DirectoryTree)`
	overflow: auto;
	max-height: 100vh;
`;

const MoveDirectoryModal: React.FunctionComponent = () => {
	const dispatch = useDispatch<AppDispatch>();

	const treeData = useSelector((state: RootState) => state.favorites.treeData);
	const expandedKeys = useSelector((state: RootState) => state.favorites.expandedKeys);
	const postIdsToFavorite = useSelector((state: RootState) => state.modals.addToFavoritesModal.postIdsToFavorite);

	const [selectedNode, setSelectedNode] = useState<EventDataNode | TreeNode>();

	const onSelect = (_: React.ReactText[], info: Info): void => {
		setSelectedNode(info.node);
	};

	const handleClose = (): void => {
		dispatch(actions.modals.setVisible(false));
	};

	const handleConfirm = async (): Promise<void> => {
		if (postIdsToFavorite.length === 0) {
			openNotificationWithIcon(
				'error',
				'Failed to add post to directory',
				'Could not add post to directory because no post id was supplied.'
			);
			return;
		}
		try {
			dispatch(actions.favorites.setSelectedNodeKey(selectedNode ? parseInt(selectedNode.key.toString()) : 0));
			for (const id of postIdsToFavorite) {
				await dispatch(thunks.favorites.removePostFromActiveDirectory(id));
				await dispatch(thunks.favorites.addPostsToDirectory({ ids: [id], key: !selectedNode ? 'root' : selectedNode.key }));
			}
			await dispatch(thunks.favorites.fetchPostsInDirectory());
			openNotificationWithIcon('success', 'Success', 'Successfuly moved post to folder');
		} catch (err) {
			openNotificationWithIcon('error', 'Error!', `Reason: '${err}`, 5);
		}
		dispatch(actions.modals.setVisible(false));
	};

	const renderModalFooter = (): React.ReactNode => {
		return [
			<Button type="primary" key="add" onClick={handleConfirm}>
				Add
			</Button>,
			<Button key="cancel" onClick={handleClose}>
				Cancel
			</Button>,
		];
	};

	return (
		<Modal
			destroyOnClose
			centered
			title="Select directory to move post to."
			footer={renderModalFooter()}
			visible={true}
			onCancel={handleClose}
		>
			<StyledDirectoryTree
				multiple
				draggable
				blockNode
				treeData={treeData}
				defaultExpandAll
				expandedKeys={expandedKeys}
				onSelect={onSelect}
			/>
		</Modal>
	);
};

export default MoveDirectoryModal;
