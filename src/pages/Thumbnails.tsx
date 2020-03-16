import React from 'react';
import styled from 'styled-components';
import ThumbnailsList from '../components/ThumbnailsList';
import { PageHeader, Button } from 'antd';
import { useDispatch } from 'react-redux';
import {
	downloadSelectedPosts,
	addSelectedPostsToFavorites,
	addAllPostsToFavorites,
	blacklistSelectedPosts,
	blackListAllPosts,
	downloadAllPosts
} from '../../store/posts';
import { saveCurrentSearch } from '../../store/savedSearches';

interface Props {
	className?: string;
}

const Container = styled.div`
	/* overflow-y: auto; */
	height: 100vh;
`;

const StyledThumbnailsList = styled(ThumbnailsList)`
	overflow: hidden;
	height: auto;
`;

const Thumbnails: React.FunctionComponent<Props> = (props: Props) => {
	const dispatch = useDispatch();
	return (
		<Container className={props.className}>
			<PageHeader
				ghost={false}
				// onBack={() => window.history.back()}
				title="Image List"
				// subTitle="This is a subtitle"
				extra={[
					<Button key="9">Download Search</Button>,
					<Button
						key="8"
						onClick={(): void => {
							dispatch(saveCurrentSearch());
						}}
					>
						Save Search
					</Button>,
					<Button
						key="7"
						onClick={(): void => {
							dispatch(blackListAllPosts());
						}}
					>
						Blacklist All
					</Button>,
					<Button
						key="6"
						onClick={(): void => {
							dispatch(blacklistSelectedPosts());
						}}
					>
						Blacklist Selected
					</Button>,
					<Button
						key="5"
						onClick={(): void => {
							dispatch(addAllPostsToFavorites());
						}}
					>
						Add All To Favorites
					</Button>,
					<Button
						key="4"
						onClick={(): void => {
							dispatch(addSelectedPostsToFavorites());
						}}
					>
						Add Selected To Favorites
					</Button>,
					<Button
						key="3"
						onClick={(): void => {
							dispatch(downloadAllPosts());
						}}
					>
						Download All
					</Button>,
					<Button
						key="2"
						onClick={(): void => {
							dispatch(downloadSelectedPosts());
						}}
					>
						Download Selected
					</Button>
				]}
			></PageHeader>
			<StyledThumbnailsList emptyDataLogoCentered={true} />
		</Container>
	);
};

export default Thumbnails;
