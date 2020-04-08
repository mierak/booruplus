import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import { actions } from 'store';
import { RootState } from 'store/types';

import Thumbnail from './Thumbnail';
import EmptyThumbnails from './EmptyThumbnails';
import LoadMoreButton from './search-form/LoadMoreButton';

interface Props {
	className?: string;
	emptyDataLogoCentered?: boolean;
}

const Container = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
	grid-template-rows: repeat(auto-fit, 220px);
	grid-gap: 10px;
	margin: 10px 0 0 10px;
	padding: 10 10px 10px 10;
	overflow-y: auto;
	overflow-x: hidden;
	height: calc(100vh - 15px);
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

const StyledLoadMoreButton = styled(LoadMoreButton)`
	width: calc(100% - 20px);
	grid-column: 1/-1;
	margin-bottom: 15px;
	/* position: absolute; */
	/* bottom: 10px; */
`;

const ThumbnailsList: React.FunctionComponent<Props> = (props: Props) => {
	const dispatch = useDispatch();
	const postCount = useSelector((state: RootState) => state.posts.posts.length);
	const activeView = useSelector((state: RootState) => state.system.activeView);
	const activePostIndex = useSelector((state: RootState) => state.posts.activePostIndex);

	useEffect(() => {
		if (activeView === 'image') {
			const list = document.getElementById('thumbnails-list');
			if (list && activePostIndex) {
				list.scrollTo(0, 232 * activePostIndex - list.clientHeight / 2 + 116);
			}
		}
	});

	const renderThumbnails = (): JSX.Element[] => {
		const arr: JSX.Element[] = [];
		for (let i = 0; i < postCount; i++) {
			arr.push(<Thumbnail key={i} index={i}></Thumbnail>);
		}

		return arr;
	};

	const renderNoData = (): JSX.Element => {
		return <StyledEmptyThumbnails centered={props.emptyDataLogoCentered} />;
	};

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

	useEffect(() => {
		window.addEventListener('keydown', handleKeyPress, true);

		return (): void => {
			window.removeEventListener('keydown', handleKeyPress, true);
		};
	}, []);

	return (
		<>
			<Container className={props.className} id="thumbnails-list">
				{postCount === 0 ? renderNoData() : renderThumbnails()}
				{postCount > 0 && <StyledLoadMoreButton />}
			</Container>
		</>
	);
};

ThumbnailsList.propTypes = {
	emptyDataLogoCentered: PropTypes.bool,
	className: PropTypes.string
};

export default React.memo(ThumbnailsList);
