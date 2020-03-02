import React, { useEffect } from 'react';
import { State } from '../../store/main';
import styled from 'styled-components';
import Thumbnail from './Thumbnail';
import { Post } from '../../types/gelbooruTypes';
import { connect, ConnectedProps } from 'react-redux';
import { View } from '../../store/system';

interface Props extends PropsFromRedux {
	className?: string;
	posts: Post[];
}

const Container = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
	grid-gap: 10px;
	margin: 10px;
	overflow-y: auto;
	overflow-x: hidden;
	height: 100vh;
`;

const ThumbnailsList: React.FunctionComponent<Props> = (props: Props) => {
	useEffect(() => {
		if (props.activeView === 'image') {
			const list = document.getElementById('thumbnails-list');
			props.activePostIndex && list?.scrollTo(0, 180 * props.activePostIndex - list.clientHeight / 2 + 90);
		}
	});
	return (
		<Container className={props.className} id="thumbnails-list">
			{props.posts.map((post, index) => {
				return <Thumbnail key={post.id} post={post} index={index}></Thumbnail>;
			})}
		</Container>
	);
};

interface StateFromProps {
	posts: Post[];
	activePostIndex: number | undefined;
	activeView: View;
}

const mapState = (state: State): StateFromProps => ({
	posts: state.posts.posts,
	activePostIndex: state.posts.activePostIndex,
	activeView: state.system.activeView
});

const mapDispatch = {};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(ThumbnailsList);
