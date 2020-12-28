import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'antd';

import { AppDispatch, PostsContext, RootState } from '@store/types';
import { thunks } from '@store';

type Props = {
	className?: string;
	context: PostsContext | string;
};

type LoadMoreType = typeof thunks.onlineSearchForm.fetchMorePosts | typeof thunks.downloadedSearchForm.fetchMorePosts;

const LoadMoreButton: React.FunctionComponent<Props> = ({ className, context }: Props) => {
	const dispatch = useDispatch<AppDispatch>();
	const isSearchDisabled = useSelector((state: RootState) => state.loadingStates.isSearchDisabled);
	const searchMode = useSelector((state: RootState) => state.onlineSearchForm[context].mode);

	const getLoadMore = (): LoadMoreType => {
		switch (searchMode) {
			case 'online':
				return thunks.onlineSearchForm.fetchMorePosts;
			case 'offline':
				return thunks.downloadedSearchForm.fetchMorePosts;
		}
	};

	const handleLoadMore = async (): Promise<void> => {
		const loadMore = getLoadMore();

		loadMore && (await dispatch(loadMore({ context })));
	};

	return (
		<Button
			className={className}
			key='thumbnails-list-load-more-button'
			disabled={isSearchDisabled}
			onClick={handleLoadMore}
		>
			Load More
		</Button>
	);
};

export default LoadMoreButton;
