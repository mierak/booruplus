import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from 'antd';

import { RootState } from '../../../store/types';
import { actions } from '../../../store';

import { SavedSearch } from '../../../types/gelbooruTypes';

const SaveSearchButton: React.FunctionComponent = () => {
	const dispatch = useDispatch();

	const selectedTags = useSelector((state: RootState) => state.downloadedSearchForm.selectedTags);
	const rating = useSelector((state: RootState) => state.downloadedSearchForm.rating);

	const handleSaveSearch = async (): Promise<void> => {
		const savedSearch: SavedSearch = {
			tags: selectedTags,
			rating: rating
		};
		dispatch(actions.savedSearches.addSavedSearch(savedSearch));
	};

	return (
		<Button htmlType="submit" type="primary" onClick={handleSaveSearch} style={{ marginLeft: '8px' }}>
			Save Search
		</Button>
	);
};

export default SaveSearchButton;
