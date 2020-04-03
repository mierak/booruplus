import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'antd';

import { AppDispatch, RootState, AppThunk } from 'store/types';
import { actions } from 'store/';

interface Props {
	className?: string;
}

const LoadMoreButton: React.FunctionComponent<Props> = ({ className }: Props) => {
	const dispatch = useDispatch<AppDispatch>();
	const isLoadingMore = useSelector((state: RootState) => state.system.isLoadingMore);
	const searchMode = useSelector((state: RootState) => state.system.searchMode);

	const getLoadMore = (): (() => AppThunk) => {
		switch (searchMode) {
			case 'online':
				return actions.onlineSearchForm.fetchMorePosts;
			case 'offline':
			case 'saved-search':
				return actions.downloadedSearchForm.fetchMorePosts;
			case 'favorites':
				return actions.posts.fetchFavorites;
			case 'most-viewed':
				return actions.posts.fetchMostViewedPosts; // CONSIDER not needed?
		}
	};

	const handleLoadMore = async (): Promise<void> => {
		const loadMore = getLoadMore();

		dispatch(actions.system.setLoadingMore(true));
		await dispatch(loadMore());
		dispatch(actions.system.setLoadingMore(false));
	};

	return (
		<Button className={className} key="thumbnails-list-load-more-button" disabled={isLoadingMore} onClick={handleLoadMore}>
			Load More
		</Button>
	);
};

export default LoadMoreButton;
