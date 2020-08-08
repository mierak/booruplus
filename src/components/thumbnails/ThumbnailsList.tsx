import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import { actions } from '../../store';
import { RootState } from '../../store/types';

import EmptyThumbnails from '../EmptyThumbnails';
import { CardAction, ContextMenu } from '../../types/components';
import Grid from './Grid';

interface Props {
	className?: string;
	emptyDataLogoCentered?: boolean;
	contextMenu?: ContextMenu[];
	actions?: CardAction[];
	hasHeader?: boolean;
	singleColumn?: boolean;
}

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
	const postCount = useSelector((state: RootState) => state.posts.posts.length);
	const activePostIndex = useSelector((state: RootState) => state.posts.activePostIndex);
	const searchMode = useSelector((state: RootState) => state.system.searchMode);

	useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent): void => {
			switch (event.keyCode) {
				case 39:
					dispatch(actions.posts.nextPost());
					break;
				case 37:
					dispatch(actions.posts.previousPost());
					break;
			}
		};
		window.addEventListener('keydown', handleKeyPress, true);

		return (): void => {
			window.removeEventListener('keydown', handleKeyPress, true);
		};
	}, [dispatch]);

	return postCount <= 0 ? (
		<StyledEmptyThumbnails centered={props.emptyDataLogoCentered} />
	) : (
		<Grid
			itemCount={postCount}
			activeIndex={activePostIndex}
			actions={props.actions}
			isSingleColumn={props.singleColumn}
			renderLoadMore={postCount > 0 && searchMode !== 'favorites' && searchMode !== 'open-download'}
			headerHeight={props.hasHeader ? 72 : 0}
		/>
	);
};

ThumbnailsList.propTypes = {
	emptyDataLogoCentered: PropTypes.bool,
	className: PropTypes.string,
};

export default React.memo(ThumbnailsList);
