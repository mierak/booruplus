import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'antd';

import { AppDispatch, RootState, ThunkApi } from 'store/types';
import { actions, thunks } from 'store/';
import { AsyncThunkAction } from '@reduxjs/toolkit';
import { Post } from 'types/gelbooruTypes';

interface Props {
	className?: string;
}

const LoadMoreButton: React.FunctionComponent<Props> = ({ className }: Props) => {
	const dispatch = useDispatch<AppDispatch>();
	const isSearchDisabled = useSelector((state: RootState) => state.system.isSearchDisabled);
	const searchMode = useSelector((state: RootState) => state.system.searchMode);

	const getLoadMore = (): (() => AsyncThunkAction<Post[], void, ThunkApi>) | undefined => {
		switch (searchMode) {
			case 'online':
			case 'saved-search-online':
				return thunks.onlineSearchForm.fetchMorePosts;
			case 'offline':
			case 'saved-search-offline':
				return thunks.downloadedSearchForm.fetchMorePosts;
			case 'favorites':
				break;
			//return thunks.posts.fetchFavorites;
			case 'most-viewed':
				break;
			//return thunks.posts.fetchMostViewedPosts; // CONSIDER not needed?
		}
	};

	const handleLoadMore = async (): Promise<void> => {
		const loadMore = getLoadMore();

		loadMore && (await dispatch(loadMore()));
	};

	return (
		<Button className={className} key="thumbnails-list-load-more-button" disabled={isSearchDisabled} onClick={handleLoadMore}>
			Load More
		</Button>
	);
};

export default LoadMoreButton;
