import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from 'antd';

import { RootState, SearchMode } from '../../../store/types';
import { actions } from '../../../store';

import { SavedSearch } from '../../../types/gelbooruTypes';

interface Props {
	mode: SearchMode;
}

const SaveSearchButton: React.FunctionComponent<Props> = ({ mode }: Props) => {
	const dispatch = useDispatch();

	const selectedTags = useSelector(
		(state: RootState) => (mode === 'offline' && state.downloadedSearchForm.selectedTags) || state.onlineSearchForm.selectedTags
	);
	const rating = useSelector(
		(state: RootState) => (mode === 'offline' && state.downloadedSearchForm.rating) || state.onlineSearchForm.rating
	);

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