import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from 'antd';

import { RootState } from '@store/types';
import { thunks } from '@store';

interface Props {
	mode: 'online' | 'offline';
}

const SaveSearchButton: React.FunctionComponent<Props> = ({ mode }: Props) => {
	const dispatch = useDispatch();

	const selectedTags = useSelector(
		(state: RootState) => (mode === 'offline' && state.downloadedSearchForm.selectedTags) || state.onlineSearchForm.selectedTags
	);
	const excludedTags = useSelector(
		(state: RootState) => (mode === 'offline' && state.downloadedSearchForm.excludedTags) || state.onlineSearchForm.excludedTags
	);
	const rating = useSelector(
		(state: RootState) => (mode === 'offline' && state.downloadedSearchForm.rating) || state.onlineSearchForm.rating
	);

	const handleSaveSearch = async (): Promise<void> => {
		dispatch(thunks.savedSearches.saveSearch({ tags: selectedTags, excludedTags: excludedTags, rating }));
	};

	return (
		<Button htmlType='submit' type='primary' onClick={handleSaveSearch} style={{ marginLeft: '8px' }}>
			Save Search
		</Button>
	);
};

export default SaveSearchButton;
