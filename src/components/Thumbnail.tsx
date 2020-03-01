import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import styled from 'styled-components';
import { State } from '../../store/main';
import { setActiveView } from '../../store/system';
import { setActivePostIndex } from '../../store/posts';
import { Card } from 'antd';
import { Post } from '../../types/gelbooruTypes';

interface Props extends PropsFromRedux {
	post: Post;
	index: number;
}

interface CardProps {
	readonly postindex: number;
	readonly activepostindex: number | undefined;
}

const StyledCard = styled.div<CardProps>`
	border: ${(props): false | 0 | 'dashed 1px black' | undefined =>
		props.activepostindex !== undefined && props.postindex === props.activepostindex && 'dashed 1px black'};
`;

const Thumbnail = (props: Props): React.ReactElement => {
	const handleThumbnailClick = (): void => {
		props.setActivePostIndex(props.posts.findIndex((post: Post): boolean => post.id === props.post.id));
		props.setActiveView('image');
	};

	return (
		<div style={{ display: 'flex', justifyContent: 'center' }}>
			<StyledCard
				as={Card}
				style={{ width: '170px', height: '170px', display: 'flex', justifyContent: 'center', alignItems: 'center', alignContent: 'center' }}
				bodyStyle={{ padding: '10px' }}
				postindex={props.index}
				activepostindex={props.activePostIndex}
			>
				<img
					src={`https://gelbooru.com/thumbnails/${props.post.directory}/thumbnail_${props.post.hash}.jpg`}
					style={{ maxWidth: '150px', maxHeight: '150px' }}
					onClick={(): void => handleThumbnailClick()}
				></img>
			</StyledCard>
		</div>
	);
};

interface StateFromProps {
	activeView: string;
	activePostIndex: number | undefined;
	posts: Post[];
}

const mapState = (state: State): StateFromProps => ({
	activeView: state.system.activeView,
	activePostIndex: state.posts.activePostIndex,
	posts: state.posts.posts
});

const mapDispatch = {
	setActiveView,
	setActivePostIndex
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Thumbnail);
