import React, { forwardRef, CSSProperties, useState, useEffect, useLayoutEffect } from 'react';
import debounce from 'lodash.debounce';
import styled from 'styled-components';
import { FixedSizeGrid } from 'react-window';

import { ContextMenu, CardAction } from 'types/components';
import CellRenderer from './CellRenderer';
import { getRowColFromIndex } from '../../util/utils';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/types';
import { actions } from '../../store/';

interface Props {
	itemCount: number;
	isSingleColumn?: boolean;
	activeIndex?: number;
	contextMenu?: ContextMenu[];
	actions?: CardAction[];
	renderLoadMore?: boolean;
	headerHeight?: number;
	debounceDelay?: number;
}

interface ContainerProps {
	headerHeight?: number;
}

const Container = styled.div<ContainerProps>`
	width: 100%;
	overflow: hidden;
	height: ${(props): string => `calc(100% - ${props.headerHeight ?? 0}px)`};
`;

const innerElementType = forwardRef<HTMLDivElement, { style: CSSProperties; rest: unknown }>(({ style, ...rest }, ref) => {
	const dispatch = useDispatch<AppDispatch>();
	const onClick = (event: React.MouseEvent): void => {
		if (!event.ctrlKey && !event.shiftKey) {
			dispatch(actions.posts.unselectAllPosts());
		}
	};
	return (
		<div
			ref={ref}
			style={{
				...style,
				height: `${parseFloat(style.height?.toString() ?? '') - 170}px`,
				width: isNaN(parseInt(style.height?.toString() ?? '0')) ? '0px' : style.height,
			}}
			{...rest}
			onClick={onClick}
		/>
	);
});
innerElementType.displayName = 'innerElementType';
const outerElementType = forwardRef<HTMLDivElement, { style: CSSProperties; rest: unknown }>(({ style, ...rest }, ref) => {
	return <div ref={ref} style={style} {...rest} />;
});
outerElementType.displayName = 'outerElementType';

const Grid: React.FunctionComponent<Props> = (props) => {
	const [size, setSize] = useState({ width: 600, height: 600 });
	const listRef = React.useRef<HTMLDivElement>(null);
	const gridRef = React.useRef<FixedSizeGrid>(null);

	useLayoutEffect(() => {
		const ref = listRef.current;
		if (ref) {
			let width = ref.clientWidth;
			let height = ref.clientHeight;
			ref.clientWidth === 0 && (width = 600);
			ref.clientHeight === 0 && (height = 600);
			setSize({ width, height });
		}
	}, []);

	useEffect(() => {
		const ref = listRef.current;
		let ro: ResizeObserver;
		if (ref) {
			const db = debounce(() => {
				setSize({ width: ref.clientWidth, height: ref.clientHeight });
			}, props.debounceDelay ?? 30);
			ro = new ResizeObserver(() => {
				db();
			});
			ro.observe(ref);
		}
		return (): void => {
			ref && ro && ro.unobserve(ref);
		};
	}, [props.debounceDelay]);

	useEffect(() => {
		const grid = gridRef.current;
		if (props.activeIndex && grid) {
			const columns = props.isSingleColumn ? 1 : Math.floor(size.width / 210);
			const { rowIndex, columnIndex } = getRowColFromIndex({
				index: props.activeIndex,
				columns,
			});
			grid.scrollToItem({
				rowIndex,
				columnIndex,
				align: 'center',
			});
		}
	}, [props.activeIndex, props.isSingleColumn, size.width]);

	const height = size.height;
	const width = size.width;

	const columns = props.isSingleColumn ? 1 : Math.floor(width / 210);
	const columnWidth = (width - 10) / columns;
	const rowCount = Math.ceil(props.itemCount / columns);

	const gridProps = {
		ref: gridRef,
		width: width - 10,
		height: height - 20,
		columnWidth: columnWidth,
		columnCount: columns,
		rowHeight: props.actions !== undefined ? 235 : 207,
		rowCount: rowCount + 1,
		overscanRowCount: 1,
		useIsScrolling: true,
		overscanColumnCount: 1,
		style: { overflowX: 'hidden', marginLeft: '10px', marginTop: '10px', marginBottom: '10px', outline: 'none' } as React.CSSProperties,
		innerElementType: innerElementType,
		outerElementType: outerElementType,
		itemData: {
			rowCount,
			columns,
			renderLoadMore: props.renderLoadMore,
			itemCount: props.itemCount,
			contextMenu: props.contextMenu,
			actions: props.actions,
		},
	};

	return (
		<Container ref={listRef} headerHeight={props.headerHeight}>
			<FixedSizeGrid {...gridProps}>{CellRenderer}</FixedSizeGrid>
		</Container>
	);
};

export default Grid;
