import React, { useEffect } from 'react';
import { RootState } from '../../store/main';
import styled from 'styled-components';
import Thumbnail from './Thumbnail';
import { useSelector, useDispatch } from 'react-redux';
import { nextPost, previousPost } from '../../store/posts';
import { loadMorePosts } from '../../store/searchForm';
import { Button } from 'antd';
import EmptyThumbnails from './EmptyThumbnails';
import PropTypes from 'prop-types';

interface Props {
	className?: string;
	emptyDataLogoCentered?: boolean;
}

const Container = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
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

const StyledLoadMoreButton = styled(Button)`
	width: calc(100% - 20px);
	grid-column: 1/-1;
	margin-bottom: 15px;
	/* position: absolute; */
	/* bottom: 10px; */
`;

const ThumbnailsList: React.FunctionComponent<Props> = (props: Props) => {
	const dispatch = useDispatch();
	const postCount = useSelector((state: RootState) => state.posts.posts.length);
	const loading = useSelector((state: RootState) => state.searchForm.loading);
	// useEffect(() => {
	// 	if (props.activeView === 'image') {
	// 		const list = document.getElementById('thumbnails-list');
	// 		props.activePostIndex && list?.scrollTo(0, 232 * props.activePostIndex - list.clientHeight / 2 + 116);
	// 	}
	// });
	// const [postsLength, setPostsLength] = useState(0);

	const handleLoadMore = async (): Promise<void> => {
		dispatch(loadMorePosts());
		// props.setLoading(true);
		// const searchString = props.selectedTags.map((tag) => tag.tag);
		// const posts = await getPostsForTags(searchString, { rating: props.rating, limit: props.postCount, page: props.page + 1 });
		// props.setPage(props.page + 1);
		// props.addPosts(posts);
		// props.setLoading(false);
	};

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
				dispatch(nextPost());
				break;
			case 37:
				dispatch(previousPost());
				break;
		}
	};

	useEffect(() => {
		window.addEventListener('keydown', handleKeyPress, true);

		return (): void => {
			window.removeEventListener('keydown', handleKeyPress, true);
		};
	}, []);

	useEffect(() => {
		// console.log('mounted');
		// setPostsLength(props.postsLength);
		// console.log('set');
	}, []);

	return (
		<>
			<Container className={props.className} id="thumbnails-list">
				{postCount === 0 ? renderNoData() : renderThumbnails()}
				{postCount > 0 && (
					<StyledLoadMoreButton onClick={handleLoadMore} disabled={loading} key="thumbnails-list-load-more-button">
						Load More
					</StyledLoadMoreButton>
				)}
			</Container>
		</>
	);
};

ThumbnailsList.propTypes = {
	emptyDataLogoCentered: PropTypes.bool,
	className: PropTypes.string
};

export default React.memo(ThumbnailsList);
