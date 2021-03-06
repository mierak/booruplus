import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';

import { actions } from '@store';
import { PostsContext, RootState, View } from '@store/types';
import { CardAction, ContextMenu } from '@appTypes/components';
import { Post } from '@appTypes/gelbooruTypes';
import EmptyThumbnails from '@components/thumbnails/EmptyThumbnails';

import Grid from './Grid';
import PreviewImage from './PreviewImage';

type Props = {
	className?: string;
	context: PostsContext | string;
	shouldShowLoadMoreButton?: boolean;
	emptyDataLogoCentered?: boolean;
	contextMenu?: ContextMenu[];
	actions?: CardAction[];
	hasHeader?: boolean;
	singleColumn?: boolean;
};

const Container = styled.div`
	height: 100%;
`;

type StyledEmptyThumbnailsProps = {
	centered?: boolean;
};

const StyledEmptyThumbnails = styled(EmptyThumbnails)`
	position: absolute;
	top: 50%;
	left: ${(props: StyledEmptyThumbnailsProps): string => (props.centered ? '50%' : '0')};
	transform: translateY(-50%);
`;

const ThumbnailsList: React.FunctionComponent<Props> = (props: Props) => {
	const dispatch = useDispatch();
	const hoverImageRef = React.useRef<HTMLImageElement>(null);
	const containerRef = React.useRef<HTMLDivElement>(null);
	const mousePosition = React.useRef({ x: 0, y: 0 });
	const isMouseOver = React.useRef<{ value: boolean; timeout?: number }>({ value: false });
	const postCount = useSelector((state: RootState) => state.searchContexts[props.context].posts?.length ?? 0);
	const activePostIndex = useSelector((state: RootState) => state.searchContexts[props.context].selectedIndex);
	const useImageHover = useSelector((state: RootState) => state.settings.imageHover);
	const contextMode = useSelector((state: RootState) => state.searchContexts[props.context].mode);

	useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent): void => {
			switch (event.keyCode) {
				case 39:
					dispatch(actions.searchContexts.nextPost({ context: props.context }));
					break;
				case 37:
					dispatch(actions.searchContexts.previousPost({ context: props.context }));
					break;
				case 8: {
					let view: View;
					if (props.context === 'favorites') view = 'favorites';
					else if (props.context === 'checkLaterQueue') view = 'check-later';
					else if (props.context === 'mostViewed') view = 'dashboard';
					else view = 'searches';
					dispatch(actions.system.setActiveView(view));
					break;
				}
			}
		};
		window.addEventListener('keydown', handleKeyPress, true);

		return (): void => {
			window.removeEventListener('keydown', handleKeyPress, true);
			dispatch(actions.system.setHoveredPost({ post: undefined, visible: false }));
		};
	}, [dispatch, props.context]);

	const positionHoverImage = (): void => {
		const hoverContainer = hoverImageRef.current;
		if (!hoverContainer) {
			return;
		}

		const x = mousePosition.current.x;
		const y = mousePosition.current.y;
		hoverContainer.style.top = y - hoverContainer.clientHeight / 2 + 'px';
		hoverContainer.style.left = `${
			x + (window.innerWidth / 2 < x ? -30 - hoverContainer.getBoundingClientRect().width : 30)
		}px`;

		const windowRect = {
			left: 0,
			top: 0,
			right: window.innerWidth,
			bottom: window.innerHeight,
		};
		const hoverRect = hoverContainer.getBoundingClientRect();

		if (hoverRect.right > windowRect.right) {
			hoverContainer.style.left = windowRect.right - hoverRect.width + 'px';
		}
		if (hoverRect.bottom > windowRect.bottom) {
			hoverContainer.style.top = windowRect.bottom - hoverRect.height + 'px';
		}
		if (hoverRect.left < 0) {
			hoverContainer.style.left = '0px';
		}
		if (hoverRect.top < 0) {
			hoverContainer.style.top = '0px';
		}
	};

	const onMouseEnter = (_: React.MouseEvent<HTMLDivElement, MouseEvent>, post: Post): void => {
		isMouseOver.current.timeout = window.setTimeout(() => {
			isMouseOver.current.value = true;
			dispatch(actions.system.setHoveredPost({ post: post, visible: true }));
		}, 500);
	};

	const onMouseLeave = (_: React.MouseEvent<HTMLDivElement, MouseEvent>, __: Post): void => {
		isMouseOver.current.timeout && window.clearTimeout(isMouseOver.current.timeout);
		if (isMouseOver.current.value) {
			dispatch(actions.system.setHoveredPost({ post: undefined, visible: false }));
			isMouseOver.current.value = false;
		}
	};

	const onMouseMove = (_: React.MouseEvent<HTMLDivElement, MouseEvent>, __: Post): void => {
		positionHoverImage();
	};

	const setMouse = (event: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
		mousePosition.current.x = event.clientX;
		mousePosition.current.y = event.clientY;
	};

	return postCount <= 0 ? (
		<StyledEmptyThumbnails centered={props.emptyDataLogoCentered} context={props.context} />
	) : (
		<Container ref={containerRef} onMouseMove={setMouse}>
			<PreviewImage ref={hoverImageRef} setImagePosition={positionHoverImage} />
			<Grid
				context={props.context}
				itemCount={postCount}
				activeIndex={activePostIndex}
				actions={props.actions}
				isSingleColumn={props.singleColumn}
				renderLoadMore={contextMode !== 'system' && contextMode !== 'other'}
				headerHeight={props.hasHeader ? 72 : 0}
				contextMenu={props.contextMenu}
				onCellMouseEnter={!props.singleColumn && useImageHover ? onMouseEnter : undefined}
				onCellMouseLeave={!props.singleColumn && useImageHover ? onMouseLeave : undefined}
				onCellMouseMove={!props.singleColumn && useImageHover ? onMouseMove : undefined}
			/>
		</Container>
	);
};

export default React.memo(ThumbnailsList);
