import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import { actions, postsSelector } from '@store';
import { PostsContext, RootState } from '@store/types';
import { CardAction, ContextMenu } from '@appTypes/components';
import { Post } from '@appTypes/gelbooruTypes';
import EmptyThumbnails from '@components/EmptyThumbnails';

import Grid from './Grid';
import PreviewImage from './PreviewImage';

interface Props {
	className?: string;
	context: PostsContext;
	emptyDataLogoCentered?: boolean;
	contextMenu?: ContextMenu[];
	actions?: CardAction[];
	hasHeader?: boolean;
	singleColumn?: boolean;
}

const Container = styled.div`
	height: 100%;
`;

interface StyledEmptyThumbnailsProps {
	centered?: boolean;
}

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
	const postCount = useSelector((state: RootState) => postsSelector(state, props.context).length);
	const activePostIndex = useSelector((state: RootState) => state.posts.selectedIndices[props.context]);
	const searchMode = useSelector((state: RootState) => state.system.searchMode);
	const useImageHover = useSelector((state: RootState) => state.settings.imageHover);

	useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent): void => {
			switch (event.keyCode) {
				case 39:
					dispatch(actions.posts.nextPost({ context: props.context }));
					break;
				case 37:
					dispatch(actions.posts.previousPost({ context: props.context }));
					break;
				case 8:
					dispatch(actions.system.setActiveView('search-results'));
			}
		};
		window.addEventListener('keydown', handleKeyPress, true);

		return (): void => {
			window.removeEventListener('keydown', handleKeyPress, true);
			dispatch(actions.posts.setHoveredPost({ post: undefined, visible: false }));
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
		hoverContainer.style.left = `${x + (window.innerWidth / 2 < x ? -30 - hoverContainer.getBoundingClientRect().width : 30)}px`;

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
		isMouseOver.current.timeout = setTimeout(() => {
			isMouseOver.current.value = true;
			dispatch(actions.posts.setHoveredPost({ post: post, visible: true }));
		}, 500);
	};

	const onMouseLeave = (_: React.MouseEvent<HTMLDivElement, MouseEvent>, __: Post): void => {
		isMouseOver.current.timeout && clearTimeout(isMouseOver.current.timeout);
		if (isMouseOver.current.value) {
			dispatch(actions.posts.setHoveredPost({ post: undefined, visible: false }));
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
		<StyledEmptyThumbnails centered={props.emptyDataLogoCentered} />
	) : (
		<Container ref={containerRef} onMouseMove={setMouse}>
			<PreviewImage ref={hoverImageRef} setImagePosition={positionHoverImage} />
			<Grid
				context={props.context}
				itemCount={postCount}
				activeIndex={activePostIndex}
				actions={props.actions}
				isSingleColumn={props.singleColumn}
				renderLoadMore={postCount > 0 && searchMode !== 'favorites' && searchMode !== 'open-download'}
				headerHeight={props.hasHeader ? 72 : 0}
				contextMenu={props.contextMenu}
				onCellMouseEnter={!props.singleColumn && useImageHover ? onMouseEnter : undefined}
				onCellMouseLeave={!props.singleColumn && useImageHover ? onMouseLeave : undefined}
				onCellMouseMove={!props.singleColumn && useImageHover ? onMouseMove : undefined}
			/>
		</Container>
	);
};

ThumbnailsList.propTypes = {
	emptyDataLogoCentered: PropTypes.bool,
	className: PropTypes.string,
};

export default React.memo(ThumbnailsList);
