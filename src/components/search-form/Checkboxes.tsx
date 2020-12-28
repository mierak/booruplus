import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Checkbox } from 'antd';

import { PostsContext, RootState } from '@store/types';
import { actions } from '@store';

type Props = {
	context: PostsContext | string;
};

const Checkboxes: React.FunctionComponent<Props> = ({ context }) => {
	const dispatch = useDispatch();

	const checkboxes = useSelector((state: RootState) => {
		const slice = state.onlineSearchForm[context];
		if ('showImages' in slice) {
			return {
				showNonBlacklisted: slice.showNonBlacklisted,
				showBlacklisted: slice.showBlacklisted,
				showFavorites: slice.showFavorites,
				showVideos: slice.showVideos,
				showImages: slice.showImages,
				showGifs: slice.showGifs,
			};
		}
	});

	if (!checkboxes) return null;
	const { showBlacklisted, showFavorites, showGifs, showImages, showNonBlacklisted, showVideos } = checkboxes;

	const handleCheckboxChange = (
		checkbox: 'non-blacklisted' | 'blacklisted' | 'favorites' | 'images' | 'gifs' | 'videos'
	): void => {
		switch (checkbox) {
			case 'non-blacklisted':
				dispatch(actions.onlineSearchForm.toggleShowNonBlacklisted({ context }));
				break;
			case 'blacklisted':
				dispatch(actions.onlineSearchForm.toggleShowBlacklisted({ context }));
				break;
			case 'favorites':
				dispatch(actions.onlineSearchForm.toggleShowFavorites({ context }));
				break;
			case 'gifs':
				dispatch(actions.onlineSearchForm.toggleShowGifs({ context }));
				break;
			case 'images':
				dispatch(actions.onlineSearchForm.toggleShowImages({ context }));
				break;
			case 'videos':
				dispatch(actions.onlineSearchForm.toggleShowVideos({ context }));
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
