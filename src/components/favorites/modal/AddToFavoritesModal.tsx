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

const AddtoFavoritesModal: React.FunctionComponent = () => {
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
			await dispatch(thunks.favorites.addPostsToDirectory({ ids: postIdsToFavorite, key: selectedNode?.key ?? 0 }));
			openNotificationWithIcon('success', 'Success', 'Post was successfuly added to directory');
		} catch (err) {
			openNotificationWithIcon('warning', 'Warning!', `Could not add post to directory: Reason: ${err}`, 5);
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
			title="Select directory to save favorite post to."
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

export default AddtoFavoritesModal;
