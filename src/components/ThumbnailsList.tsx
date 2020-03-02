import React, { useEffect } from 'react';
import { State } from '../../store/main';
import styled from 'styled-components';
import Thumbnail from './Thumbnail';
import { Post, Tag, Rating } from '../../types/gelbooruTypes';
import { connect, ConnectedProps } from 'react-redux';
import { View } from '../../store/system';
import { setPage, setLoading } from '../../store/searchForm';
import { addPosts } from '../../store/posts';
import { Button } from 'antd';
import { getPostsForTags } from '../../service/apiService';

interface Props extends PropsFromRedux {
	className?: string;
	posts: Post[];
}

const Container = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
	grid-template-rows: repeat(auto-fit, 170px);
	grid-gap: 10px;
	margin: 10px 0 0 10px;
	overflow-y: auto;
	overflow-x: hidden;
	height: calc(100vh - 15px);
`;

const ThumbnailsList: React.FunctionComponent<Props> = (props: Props) => {
	useEffect(() => {
		if (props.activeView === 'image') {
			const list = document.getElementById('thumbnails-list');
			props.activePostIndex && list?.scrollTo(0, 180 * props.activePostIndex - list.clientHeight / 2 + 90);
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

	return (
		<Container className={props.className} id="thumbnails-list">
			{props.posts.map((post, index) => {
				return <Thumbnail key={post.id} post={post} index={index}></Thumbnail>;
			})}
			{props.posts.length > 0 && (
				<Button style={{ width: '100%', gridColumn: '1/-1', marginBottom: '10px' }} onClick={handleLoadMore} disabled={props.loading}>
					Load More
				</Button>
			)}
		</Container>
	);
};

interface StateFromProps {
	posts: Post[];
	activePostIndex: number | undefined;
	activeView: View;
	page: number;
	selectedTags: Tag[];
	rating: Rating;
	postCount: number;
	loading: boolean;
}

const mapState = (state: State): StateFromProps => ({
	posts: state.posts.posts,
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
	setLoading
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(ThumbnailsList);
