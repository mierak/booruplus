import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import { actions } from '../../store';
import { RootState } from '../../store/types';

import EmptyThumbnails from '../EmptyThumbnails';
import { CardAction, ContextMenu } from '../../types/components';
import Grid from './Grid';
import { Post } from '../../types/gelbooruTypes';
import PreviewImage from './PreviewImage';

interface Props {
	className?: string;
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

	const postCount = useSelector((state: RootState) => state.posts.posts.length);
	const activePostIndex = useSelector((state: RootState) => state.posts.activePostIndex);
	const searchMode = useSelector((state: RootState) => state.system.searchMode);
	const useImageHover = useSelector((state: RootState) => state.settings.imageHover);

	useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent): void => {
			switch (event.keyCode) {
				case 39:
					dispatch(actions.posts.nextPost());
					break;
				case 37:
					dispatch(actions.posts.previousPost());
					break;
				case 8:
					dispatch(actions.system.setActiveView('thumbnails'));
			}
		};
		window.addEventListener('keydown', handleKeyPress, true);

		return (): void => {
			window.removeEventListener('keydown', handleKeyPress, true);
		};
	}, [dispatch]);

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
		dispatch(actions.posts.setHoveredPost({ post: post, visible: true }));
	};

	const onMouseLeave = (_: React.MouseEvent<HTMLDivElement, MouseEvent>, __: Post): void => {
		dispatch(actions.posts.setHoveredPost({ post: undefined, visible: false }));
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
