import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { Modal, Tree } from 'antd';
import { EventDataNode, DataNode } from 'rc-tree/lib/interface';

import { actions, thunks } from '@store';
import { AppDispatch, TreeNode } from '@store/types';
import { openNotificationWithIcon } from '@appTypes/components';

import ModalFooter from './common/ModalFooter';
import { MovePostsToFavoritesDirectoryModalProps } from '@appTypes/modalTypes';

type Info = {
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

const MovePostsToFavoritesDirectoryModal: React.FunctionComponent<
	MovePostsToFavoritesDirectoryModalProps & { treeData: TreeNode[] | undefined; expandedKeys: string[] }
> = ({ treeData, expandedKeys, postsToMove }) => {
	const dispatch = useDispatch<AppDispatch>();

	const [selectedNodeKey, setSelectedNodeKey] = useState(1);

	const onSelect = (_: React.ReactText[], info: Info): void => {
		setSelectedNodeKey(Number(info.node.key));
	};

	const handleClose = (): void => {
		dispatch(actions.modals.setVisible(false));
	};

	const handleConfirm = async (): Promise<void> => {
		if (postsToMove.length === 0) {
			openNotificationWithIcon(
				'error',
				'Failed to add post to directory',
				'Could not add post to directory because no post id was supplied.',
				5
			);
			dispatch(actions.modals.setVisible(false));
			return;
		}
		await dispatch(thunks.favorites.removePostsFromActiveDirectory(postsToMove));
		await dispatch(thunks.favorites.addPostsToDirectory({ posts: postsToMove, key: selectedNodeKey }));
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

export default MovePostsToFavoritesDirectoryModal;
