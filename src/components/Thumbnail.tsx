import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import styled from 'styled-components';
import { State } from '../../store/main';
import { setActiveView } from '../../store/system';
import { setActivePostIndex, setActivePost, setPostFavorite } from '../../store/posts';
import { Card } from 'antd';
import { Post } from '../../types/gelbooruTypes';
import { EditOutlined, EllipsisOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import { updatePost } from '../../db/database';

interface Props extends PropsFromRedux {
	post: Post;
	index: number;
}

interface CardProps {
	readonly postindex: number;
	readonly activepostindex: number | undefined;
}

const StyledCard = styled(Card)<CardProps>`
	border: ${(props): false | 0 | 'dashed 1px black' | undefined =>
		props.activepostindex !== undefined && props.postindex === props.activepostindex && 'dashed 1px black'};
`;

const Thumbnail = (props: Props): React.ReactElement => {
	const [favorite, setFavoriteState] = useState(props.post.favorite); //TODO replace this thumbnails action hack

	const handleThumbnailClick = (): void => {
		props.setActivePost(props.post);
		props.setActiveView('image');
	};

	const setFavorite = (favorite: 0 | 1): void => {
		props.setPostFavorite(props.post, favorite);
		updatePost(props.post);
		setFavoriteState(favorite);
	};

	const renderActions = (): JSX.Element[] => {
		const arr: JSX.Element[] = [];
		if (props.post.favorite === 1) {
			arr.push(
				<HeartFilled
					key="heart-filled"
					onClick={(): void => {
						setFavorite(0);
					}}
				/>
			);
		} else {
			arr.push(
				<HeartOutlined
					key="heart-outlined"
					onClick={(): void => {
						setFavorite(1);
					}}
				/>
			);
		}
		arr.push(<EditOutlined key="edit" />, <EditOutlined key="edit" />, <EditOutlined key="edit" />);
		return arr;
	};

	return (
		<StyledCard
			style={{ width: '170px', height: '222px' }}
			bodyStyle={{
				height: '172px',
				padding: '10px',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				alignContent: 'center'
			}}
			postindex={props.index}
			activepostindex={props.activePostIndex}
			actions={renderActions()}
		>
			<img
				src={`https://gelbooru.com/thumbnails/${props.post.directory}/thumbnail_${props.post.hash}.jpg`}
				style={{ maxWidth: '150px', maxHeight: '150px' }}
				onClick={(): void => handleThumbnailClick()}
			></img>
		</StyledCard>
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
	setPostFavorite,
	setActivePost
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Thumbnail);
