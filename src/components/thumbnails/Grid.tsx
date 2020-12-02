import React, { forwardRef, CSSProperties, useState, useEffect, useLayoutEffect } from 'react';
import debounce from 'lodash.debounce';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { FixedSizeGrid } from 'react-window';

import { ContextMenu, CardAction } from '@appTypes/components';
import { getRowColFromIndex } from '@util/utils';
import { AppDispatch, PostsContext } from '@store/types';
import { Post } from '@appTypes/gelbooruTypes';
import { actions } from '@store/';

import CellRenderer from './CellRenderer';

interface Props {
	context: PostsContext;
	itemCount: number;
	isSingleColumn?: boolean;
	activeIndex?: number;
	contextMenu?: ContextMenu[];
	actions?: CardAction[];
	renderLoadMore?: boolean;
	headerHeight?: number;
	debounceDelay?: number;
	onCellMouseEnter?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, post: Post) => void;
	onCellMouseLeave?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, post: Post) => void;
	onCellMouseMove?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, post: Post) => void;
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

	// Hack to get context out of itemData
	const children: { props: { data: { context: PostsContext } } }[] =
		(rest.children as { props: { data: { context: PostsContext } } }[]) ?? [];
	const context = children[0]?.props?.data?.context ?? 'posts';

	const onClick = (event: React.MouseEvent): void => {
		if (!event.ctrlKey && !event.shiftKey) {
			dispatch(actions.posts.unselectAllPosts({ context: context }));
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

const gridStyle: React.CSSProperties = {
	overflowX: 'hidden',
	marginLeft: '10px',
	marginTop: '10px',
	marginBottom: '10px',
	outline: 'none',
};

const Grid: React.FunctionComponent<Props> = (props) => {
	const [size, setSize] = useState({ width: 600, height: 600 });
	const [isLoaded, setLoaded] = useState(false);
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
			setLoaded(true);
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
		innerElementType: innerElementType,
	};

	const gridItemData = React.useMemo(() => {
		return {
			rowCount,
			columns,
			context: props.context,
			renderLoadMore: props.renderLoadMore,
			itemCount: props.itemCount,
			contextMenu: props.contextMenu,
			actions: props.actions,
			onMouseEnter: props.onCellMouseEnter,
			onMouseLeave: props.onCellMouseLeave,
			onMouseMove: props.onCellMouseMove,
		};
	}, [
		columns,
		props.actions,
		props.context,
		props.contextMenu,
		props.itemCount,
		props.onCellMouseEnter,
		props.onCellMouseLeave,
		props.onCellMouseMove,
		props.renderLoadMore,
		rowCount,
	]);

	return (
		<Container ref={listRef} headerHeight={props.headerHeight}>
			{isLoaded && (
				<FixedSizeGrid style={gridStyle} itemData={gridItemData} {...gridProps}>
					{CellRenderer}
				</FixedSizeGrid>
			)}
		</Container>
	);
};

export default Grid;
