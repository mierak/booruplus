import React from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { PageHeader, Button, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import { actions } from '../../store';
import { RootState, AppDispatch } from '../../store/types';

import ThumbnailsList from '../components/ThumbnailsList';

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

const StyledSpin = styled(Spin)`
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(0, -50%);
`;

const Thumbnails: React.FunctionComponent<Props> = (props: Props) => {
	const dispatch = useDispatch<AppDispatch>();

	const isFetchingPosts = useSelector((state: RootState) => state.system.isFetchingPosts);

	const renderThumbnailList = (): JSX.Element => {
		if (isFetchingPosts) {
			return <StyledSpin indicator={<LoadingOutlined style={{ fontSize: '64px' }} />} />;
		} else {
			return <StyledThumbnailsList emptyDataLogoCentered={true} />;
		}
	};

	const renderButtons = (): JSX.Element[] => {
		return [
			<Button key="9">Download Search</Button>,
			<Button
				key="8"
				onClick={(): void => {
					//dispatch(actions.savedSearches.saveCurrentSearch()); TODO
				}}
			>
				Save Search
			</Button>,
			<Button
				key="7"
				onClick={(): void => {
					dispatch(actions.posts.blackListAllPosts());
				}}
			>
				Blacklist All
			</Button>,
			<Button
				key="6"
				onClick={(): void => {
					dispatch(actions.posts.blacklistSelectedPosts());
				}}
			>
				Blacklist Selected
			</Button>,
			<Button
				key="5"
				onClick={(): void => {
					dispatch(actions.posts.addAllPostsToFavorites());
				}}
			>
				Add All To Favorites
			</Button>,
			<Button
				key="4"
				onClick={(): void => {
					dispatch(actions.posts.addSelectedPostsToFavorites());
				}}
			>
				Add Selected To Favorites
			</Button>,
			<Button
				key="3"
				onClick={async (): Promise<void> => {
					dispatch(actions.system.withProgressBar(async (id) => dispatch(actions.posts.downloadAllPosts(id))));
				}}
			>
				Download All
			</Button>,
			<Button
				key="2"
				onClick={(): void => {
					dispatch(actions.system.withProgressBar(async (id) => dispatch(actions.posts.downloadSelectedPosts(id))));
				}}
			>
				Download Selected
			</Button>,
		];
	};

	return (
		<Container className={props.className}>
			<PageHeader
				ghost={false}
				// onBack={() => window.history.back()}
				title="Image List"
				// subTitle="This is a subtitle"
				extra={renderButtons()}
			></PageHeader>
			{renderThumbnailList()}
		</Container>
	);
};

export default Thumbnails;
