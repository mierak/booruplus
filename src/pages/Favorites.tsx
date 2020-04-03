import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';

import { actions } from '../../store';
import ThumbnailsList from '../components/ThumbnailsList';

interface Props {
	className?: string;
}

const Container = styled.div``;

const Favorites: React.FunctionComponent<Props> = (props: Props) => {
	const dispatch = useDispatch();
	useEffect(() => {
		const renderThumbnailList = async (): Promise<void> => {
			dispatch(actions.posts.fetchFavorites());
		};
		renderThumbnailList();
	}, []);

	return (
		<Container className={props.className}>
			<ThumbnailsList emptyDataLogoCentered={true} />
		</Container>
	);
};

export default Favorites;
