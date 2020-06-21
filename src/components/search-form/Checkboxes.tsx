import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Checkbox } from 'antd';

import { RootState } from '../../store/types';
import { actions } from '../../store';

const Checkboxes: React.FunctionComponent = () => {
	const dispatch = useDispatch();

	const showNonBlacklisted = useSelector((state: RootState) => state.downloadedSearchForm.showNonBlacklisted);
	const showBlacklisted = useSelector((state: RootState) => state.downloadedSearchForm.showBlacklisted);
	const showFavorites = useSelector((state: RootState) => state.downloadedSearchForm.showFavorites);
	const showVideos = useSelector((state: RootState) => state.downloadedSearchForm.showVideos);
	const showImages = useSelector((state: RootState) => state.downloadedSearchForm.showImages);
	const showGifs = useSelector((state: RootState) => state.downloadedSearchForm.showGifs);

	const handleCheckboxChange = (checkbox: 'non-blacklisted' | 'blacklisted' | 'favorites' | 'images' | 'gifs' | 'videos'): void => {
		switch (checkbox) {
			case 'non-blacklisted':
				dispatch(actions.downloadedSearchForm.toggleShowNonBlacklisted());
				break;
			case 'blacklisted':
				dispatch(actions.downloadedSearchForm.toggleShowBlacklisted());
				break;
			case 'favorites':
				dispatch(actions.downloadedSearchForm.toggleShowFavorites());
				break;
			case 'gifs':
				dispatch(actions.downloadedSearchForm.toggleShowGifs());
				break;
			case 'images':
				dispatch(actions.downloadedSearchForm.toggleShowImages());
				break;
			case 'videos':
				dispatch(actions.downloadedSearchForm.toggleShowVideos());
				break;
		}
	};

	return (
		<>
			<Checkbox checked={showNonBlacklisted} onChange={(): void => handleCheckboxChange('non-blacklisted')}>
				Non-Blacklisted
			</Checkbox>
			<Checkbox checked={showBlacklisted} onChange={(): void => handleCheckboxChange('blacklisted')}>
				Blacklisted
			</Checkbox>
			<Checkbox checked={showFavorites} onChange={(): void => handleCheckboxChange('favorites')}>
				Favorites
			</Checkbox>
			<Checkbox checked={showImages} onChange={(): void => handleCheckboxChange('images')}>
				Images
			</Checkbox>
			<Checkbox checked={showGifs} onChange={(): void => handleCheckboxChange('gifs')}>
				Gifs
			</Checkbox>
			<Checkbox checked={showVideos} onChange={(): void => handleCheckboxChange('videos')}>
				Videos
			</Checkbox>
		</>
	);
};

export default Checkboxes;
