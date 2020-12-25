import React from 'react';

import { CardAction, ContextMenu } from '@appTypes/components';
import { getIndexFromRowCol } from '@util/utils';
import { Post } from '@appTypes/gelbooruTypes';

import Thumbnail from './thumbnail/Thumbnail';
import { PostsContext } from '@store/types';

type CellProps = {
	context: PostsContext;
	columnIndex: number;
	rowIndex: number;
	style: React.CSSProperties;
	columns: number;
	isScrolling?: boolean;
	itemCount: number;
	contextMenu?: ContextMenu[];
	actions?: CardAction[];
	onMouseEnter?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, post: Post) => void;
	onMouseLeave?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, post: Post) => void;
	onMouseMove?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, post: Post) => void;
}

const Cell: React.FunctionComponent<CellProps> = (props) => {
	const index = getIndexFromRowCol(props);
	if (index >= props.itemCount) {
		return null;
	}
	return (
		<div style={{ ...props.style, width: '100%' }}>
			<Thumbnail
				context={props.context}
				isScrolling={props.isScrolling}
				index={index}
				contextMenu={props.contextMenu}
				actions={props.actions}
				onMouseEnter={props.onMouseEnter}
				onMouseLeave={props.onMouseLeave}
				onMouseMove={props.onMouseMove}
			/>
		</div>
	);
};

export default Cell;
