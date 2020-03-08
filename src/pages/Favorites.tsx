import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { State } from '../../store/main';
import styled from 'styled-components';
import ThumbnailsList from './ThumbnailsList';
import { getFavoritePosts } from '../../db/database';
import { Post } from '../../types/gelbooruTypes';
import { setPosts, setActivePostIndex } from '../../store/posts';

interface Props extends PropsFromRedux {
	className?: string;
}

const Container = styled.div``;

const Favorites: React.FunctionComponent<Props> = (props: Props) => {
	useEffect(() => {
		const renderThumbnailList = async (): Promise<void> => {
			const posts = await getFavoritePosts();
			props.setPosts(posts);
			props.setActivePostIndex(undefined);
		};
		renderThumbnailList();
	}, []);

	return (
		<Container className={props.className}>
			<ThumbnailsList emptyDataLogoCentered={true} />
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
	setActivePostIndex
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Favorites);
