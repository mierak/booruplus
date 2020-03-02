import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import styled from 'styled-components';
import { State } from '../../store/main';
import { setActivePostIndex } from '../../store/posts';
import { Post } from '../../types/gelbooruTypes';
import ThumbnailsList from './ThumbnailsList';

interface Props extends PropsFromRedux {
	className?: string;
}

const Container = styled.div`
	width: 100%;
	align-items: center;
`;

const Image = styled.img`
	max-width: 100%;
	max-height: 100vh;
	display: block;
	margin-left: auto;
	margin-right: auto;
`;

const ImageContainer = styled.div`
	width: calc(100% - 200px);
	display: block;
	float: left;
	min-height: 1px;
`;

const StyledThumbnailsList = styled(ThumbnailsList)`
	max-width: 200px;
	margin: 0px;
`;

const ImageView: React.FunctionComponent<Props> = (props: Props) => {
	return (
		<Container>
			<ImageContainer>
				{props.activePostIndex !== undefined && props.posts[props.activePostIndex] && (
					<Image src={props.posts[props.activePostIndex].file_url} />
				)}
			</ImageContainer>
			<StyledThumbnailsList />
		</Container>
	);
};

interface StateFromProps {
	activePostIndex: number | undefined;
	posts: Post[];
}

const mapState = (state: State): StateFromProps => ({
	activePostIndex: state.posts.activePostIndex,
	posts: state.posts.posts
});

const mapDispatch = {
	setActivePostIndex
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(ImageView);
