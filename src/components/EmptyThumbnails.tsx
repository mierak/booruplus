import React from 'react';
import { Empty, Button } from 'antd';
import { useDispatch } from 'react-redux';

import { actions } from '@store';
import { PostsContext } from '@store/types';
import { ActiveModal } from '@appTypes/modalTypes';

type Props = {
	className?: string;
	context: PostsContext | string;
};

const EmptyThumbnails: React.FunctionComponent<Props> = ({ className, context }) => {
	const dispatch = useDispatch();
	//! TODO previous tab
	return (
		<Empty className={className} description='No Posts To Show'>
			<Button
				onClick={(): void => {
					dispatch(actions.modals.showModal(ActiveModal.SEARCH_FORM, { context, previousTab: '' }));
				}}
			>
				Open Search Form
			</Button>
		</Empty>
	);
};

export default EmptyThumbnails;
