import React from 'react';
import styled from 'styled-components';

import { CardAction, ContextMenu } from '@appTypes/components';
import LoadMoreButton from '@components/search-form/LoadMoreButton';
import { Post } from '@appTypes/gelbooruTypes';
import { PostsContext } from '@store/types';

import Cell from './Cell';

type CellRendererProps = {
	columnIndex: number;
	rowIndex: number;
	style: React.CSSProperties;
	data: {
		context: PostsContext | string;
		renderLoadMore?: boolean;
		rowCount: number;
		columns: number;
		itemCount: number;
		actions: CardAction[];
		contextMenu: ContextMenu[];
		onMouseEnter?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, post: Post) => void;
		onMouseLeave?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, post: Post) => void;
		onMouseMove?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, post: Post) => void;
	};
};

const StyledLoadMoreButton = styled(LoadMoreButton)`
	width: calc(100% - 10px);
	margin: 0px 10px 10px 0px;
`;

const CellRenderer = (cellProps: CellRendererProps): React.ReactElement => {
	const isLastRow = cellProps.rowIndex === cellProps.data.rowCount;

	if (!isLastRow) {
		return (
			<Cell
				{...cellProps}
				context={cellProps.data.context}
				columns={cellProps.data.columns}
				itemCount={cellProps.data.itemCount}
				contextMenu={cellProps.data.contextMenu}
				actions={cellProps.data.actions}
				onMouseEnter={cellProps.data.onMouseEnter}
				onMouseLeave={cellProps.data.onMouseLeave}
				onMouseMove={cellProps.data.onMouseMove}
			/>
		);
	}

	if (cellProps.columnIndex === 0 && cellProps.data.renderLoadMore) {
		return (
			<div style={{ ...cellProps.style, width: '100%', height: '30px', top: Number(cellProps.style.top) + 10 }}>
				<StyledLoadMoreButton context={cellProps.data.context} />
			</div>
		);
	}

	return <></>;
};

export default CellRenderer;
