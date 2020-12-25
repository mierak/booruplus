import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Modal, Tree } from 'antd';
import { EventDataNode, DataNode } from 'rc-tree/lib/interface';

import { actions, thunks } from '@store';
import { AppDispatch, RootState, TreeNode } from '@store/types';
import { openNotificationWithIcon } from '@appTypes/components';
import { AddToFavoritesModalContextProps, AddToFavoritesModalProps } from '@appTypes/modalTypes';

import ModalFooter from './common/ModalFooter';

type Info = {
	event: string;
	selected: boolean;
	node: EventDataNode;
	selectedNodes: DataNode[];
	nativeEvent: MouseEvent;
}

type Props = {
	treeData: TreeNode[] | undefined;
	expandedKeys: string[];
	data: AddToFavoritesModalProps | AddToFavoritesModalContextProps;
}

const StyledDirectoryTree = styled(Tree.DirectoryTree)`
	overflow: auto;
	max-height: calc(100vh - 300px);
`;

const AddtoFavoritesModal: React.FunctionComponent<Props> = (props) => {
	const dispatch = useDispatch<AppDispatch>();

	const [selectedNode, setSelectedNode] = useState<EventDataNode | TreeNode>();
	const postsToFavorite = useSelector((state: RootState) => {
		if ('postsToFavorite' in props.data) {
			return props.data.postsToFavorite;
		} else {
			const posts = state.posts.posts[props.data.context];
			return props.data.type === 'all' ? posts : posts.filter((p) => p.selected);
		}
	});

	const onSelect = (_: React.ReactText[], info: Info): void => {
		setSelectedNode(info.node);
	};

	const handleClose = (): void => {
		dispatch(actions.modals.setVisible(false));
	};

	const handleConfirm = async (): Promise<void> => {
		if (postsToFavorite.length === 0) {
			openNotificationWithIcon(
				'error',
				'Failed to add post to directory',
				'Could not add post to directory because no post id was supplied.',
				5
			);
			dispatch(actions.modals.setVisible(false));
			return;
		}
		await dispatch(thunks.favorites.addPostsToDirectory({ posts: postsToFavorite, key: selectedNode?.key ?? 1 }));
		openNotificationWithIcon('success', 'Success', 'Post was successfuly added to directory');
		dispatch(actions.modals.setVisible(false));
	};

	return (
		<Modal
			destroyOnClose
			centered
			title='Select directory to save favorite post to.'
			footer={<ModalFooter onConfirm={handleConfirm} onCancel={handleClose} okText='Add' cancelText='Close' />}
			visible={true}
			onCancel={handleClose}
			bodyStyle={{ maxHeight: 'calc(100vh - 200px)' }}
		>
			<div>
				<StyledDirectoryTree
					multiple
					draggable
					blockNode
					treeData={props.treeData}
					defaultExpandAll
					expandedKeys={props.expandedKeys}
					onSelect={onSelect}
				/>
			</div>
		</Modal>
	);
};

export default AddtoFavoritesModal;
