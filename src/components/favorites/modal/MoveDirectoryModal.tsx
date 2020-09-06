import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { Modal, Tree } from 'antd';
import { EventDataNode, DataNode } from 'rc-tree/lib/interface';

import { actions, thunks } from '@store';
import { RootState, AppDispatch, TreeNode } from '@store/types';
import { openNotificationWithIcon } from '@appTypes/components';

import ModalFooter from './common/ModalFooter';

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

	const treeData = useSelector((state: RootState) => state.favorites.rootNode?.children);
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
				'Could not add post to directory because no post id was supplied.',
				5
			);
			dispatch(actions.modals.setVisible(false));
			return;
		}
		dispatch(actions.favorites.setSelectedNodeKey(selectedNode ? parseInt(selectedNode.key.toString()) : 1));
		await dispatch(thunks.favorites.removePostsFromActiveDirectory(postIdsToFavorite));
		await dispatch(thunks.favorites.addPostsToDirectory({ ids: postIdsToFavorite, key: !selectedNode ? 1 : selectedNode.key }));
		await dispatch(thunks.favorites.fetchPostsInDirectory());
		openNotificationWithIcon('success', 'Success', 'Successfuly moved post to folder');
		dispatch(actions.modals.setVisible(false));
	};

	return (
		<Modal
			destroyOnClose
			centered
			title='Select directory to move post to.'
			footer={<ModalFooter onConfirm={handleConfirm} onCancel={handleClose} cancelText='Cancel' okText='Move' />}
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
