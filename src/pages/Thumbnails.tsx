import React from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { PageHeader, Button, Spin, Affix } from 'antd';
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
	const mode = useSelector((state: RootState) => state.system.searchMode);

	const selectedTags = useSelector(
		(state: RootState) => (mode === 'offline' && state.downloadedSearchForm.selectedTags) || state.onlineSearchForm.selectedTags
	);
	const excludedTags = useSelector(
		(state: RootState) => (mode === 'offline' && state.downloadedSearchForm.excludededTags) || state.onlineSearchForm.excludededTags
	);
	const rating = useSelector(
		(state: RootState) => (mode === 'offline' && state.downloadedSearchForm.rating) || state.onlineSearchForm.rating
	);

	const renderThumbnailList = (): JSX.Element => {
		if (isFetchingPosts) {
			return <StyledSpin indicator={<LoadingOutlined style={{ fontSize: '64px' }} />} />;
		} else {
			return <StyledThumbnailsList emptyDataLogoCentered={true} />;
		}
	};

	const handleDownloadWholeSearch = (): void => {
		dispatch(actions.system.withProgressBar(async id => dispatch(actions.posts.downloadWholeSearch(id))));
	};

	const handleBlacklistAll = (): void => {
		dispatch(actions.posts.blackListAllPosts());
	};

	const handleBlacklistSelected = (): void => {
		dispatch(actions.posts.blacklistSelectedPosts());
	};

	const handleAddAllToFavorites = (): void => {
		dispatch(actions.posts.addAllPostsToFavorites());
	};

	const handleAddSelectedToFavorites = (): void => {
		dispatch(actions.posts.addSelectedPostsToFavorites());
	};

	const handleDownloadAll = (): void => {
		dispatch(actions.system.withProgressBar(async id => dispatch(actions.posts.downloadAllPosts(id))));
	};

	const handleDownloadSelected = (): void => {
		dispatch(actions.system.withProgressBar(async id => dispatch(actions.posts.downloadSelectedPosts(id))));
	};

	const handleSaveSearch = async (): Promise<void> => {
		dispatch(actions.savedSearches.saveSearch(selectedTags, excludedTags, rating));
	};

	const renderButtons = (): JSX.Element[] => {
		return [
			<Button key="9" onClick={handleDownloadWholeSearch}>
				Download Search
			</Button>,
			<Button key="8" onClick={handleSaveSearch}>
				Save Search
			</Button>,
			<Button key="7" onClick={handleBlacklistAll}>
				Blacklist All
			</Button>,
			<Button key="6" onClick={handleBlacklistSelected}>
				Blacklist Selected
			</Button>,
			<Button key="5" onClick={handleAddAllToFavorites}>
				Add All To Favorites
			</Button>,
			<Button key="4" onClick={handleAddSelectedToFavorites}>
				Add Selected To Favorites
			</Button>,
			<Button key="3" onClick={handleDownloadAll}>
				Download All
			</Button>,
			<Button key="2" onClick={handleDownloadSelected}>
				Download Selected
			</Button>
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
