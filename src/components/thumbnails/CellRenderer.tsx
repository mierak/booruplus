import React from 'react';
import styled from 'styled-components';

import { CardAction, ContextMenu } from 'types/components';
import Cell from './Cell';
import LoadMoreButton from '../search-form/LoadMoreButton';

interface CellRendererProps {
	columnIndex: number;
	rowIndex: number;
	style: React.CSSProperties;
	data: {
		renderLoadMore?: boolean;
		rowCount: number;
		columns: number;
		itemCount: number;
		actions: CardAction[];
		contextMenu: ContextMenu[];
	};
}

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
				columns={cellProps.data.columns}
				itemCount={cellProps.data.itemCount}
				contextMenu={cellProps.data.contextMenu}
				actions={cellProps.data.actions}
			/>
		);
	}

	if (cellProps.columnIndex === 0 && cellProps.data.renderLoadMore) {
		return (
			<div style={{ ...cellProps.style, width: '100%', height: '30px' }}>
				<StyledLoadMoreButton />
			</div>
		);
	}

	return <></>;
};

export default CellRenderer;