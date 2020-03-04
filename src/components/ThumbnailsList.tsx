/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';
import { State } from '../../store/main';
import styled from 'styled-components';
import Thumbnail from './Thumbnail';
import { Post, Tag, Rating } from '../../types/gelbooruTypes';
import { connect, ConnectedProps } from 'react-redux';
import { View, setSearchFormDrawerVisible } from '../../store/system';
import { setPage, setLoading } from '../../store/searchForm';
import { addPosts } from '../../store/posts';
import { Button } from 'antd';
import { getPostsForTags } from '../../service/apiService';
import EmptyThumbnails from './EmptyThumbnails';

interface Props extends PropsFromRedux {
	className?: string;
	posts: Post[];
	emptyDataLogoCentered?: boolean;
}

const Container = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
	grid-template-rows: repeat(auto-fit, 220px);
	grid-gap: 10px;
	margin: 10px 0 0 10px;
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
	width: 100%;
	grid-column: 1/-1;
	margin-bottom: 10px;
`;

const ThumbnailsList: React.FunctionComponent<Props> = (props: Props) => {
	useEffect(() => {
		if (props.activeView === 'image') {
			const list = document.getElementById('thumbnails-list');
			props.activePostIndex && list?.scrollTo(0, 232 * props.activePostIndex - list.clientHeight / 2 + 116);
		}
	});

	const handleLoadMore = async (): Promise<void> => {
		props.setLoading(true);
		const searchString = props.selectedTags.map((tag) => tag.tag);
		const posts = await getPostsForTags(searchString, { rating: props.rating, limit: props.postCount, page: props.page + 1 });
		props.setPage(props.page + 1);
		props.addPosts(posts);
		props.setLoading(false);
	};

	const renderThumbnails = (): JSX.Element[] => {
		const arr = props.posts.map((post, index) => {
			return <Thumbnail key={post.id} post={post} index={index}></Thumbnail>;
		});
		arr.push(
			<StyledLoadMoreButton onClick={handleLoadMore} disabled={props.loading} key="thumbnails-list-load-more-button">
				Load More
			</StyledLoadMoreButton>
		);
		return arr;
	};

	const renderNoData = (): JSX.Element => {
		return <StyledEmptyThumbnails centered={props.emptyDataLogoCentered} />;
	};

	return (
		<Container className={props.className} id="thumbnails-list">
			{props.posts.length === 0 ? renderNoData() : renderThumbnails()}
		</Container>
	);
};

interface StateFromProps {
	activePostIndex: number | undefined;
	activeView: View;
	page: number;
	selectedTags: Tag[];
	rating: Rating;
	postCount: number;
	loading: boolean;
}

const mapState = (state: State): StateFromProps => ({
	activePostIndex: state.posts.activePostIndex,
	activeView: state.system.activeView,
	page: state.searchForm.page,
	selectedTags: state.searchForm.selectedTags,
	rating: state.searchForm.rating,
	postCount: state.searchForm.postCount,
	loading: state.searchForm.loading
});

const mapDispatch = {
	setPage,
	addPosts,
	setLoading,
	setSearchFormDrawerVisible
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(ThumbnailsList);
