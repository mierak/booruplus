import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { State } from '../../store/main';
import styled from 'styled-components';
import ThumbnailsList from './ThumbnailsList';
import { getFavoritePosts } from '../../db/database';
import { Post } from '../../types/gelbooruTypes';
import { setPosts, setActivePost } from '../../store/posts';

interface Props extends PropsFromRedux {
	className?: string;
}

const Container = styled.div``;

const Favorites: React.FunctionComponent<Props> = (props: Props) => {
	useEffect(() => {
		const renderThumbnailList = async (): Promise<void> => {
			const posts = await getFavoritePosts();
			props.setPosts(posts);
			props.setActivePost(undefined);
		};
		renderThumbnailList();
	}, []);

	return (
		<Container className={props.className}>
			<ThumbnailsList posts={props.posts} />
		</Container>
	);
};

interface StateFromProps {
	posts: Post[];
}

const mapState = (state: State): StateFromProps => ({
	posts: state.posts.posts
});

const mapDispatch = {
	setPosts,
	setActivePost
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Favorites);
