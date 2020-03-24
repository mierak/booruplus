import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { actions } from '../../store';
import { RootState } from '../../store/types';

import AppLayout from '../components/Layout';
import ImageView from './ImageView';
import SearchForm from '../components/OnlineSearchForm';
import SavedSearches from './SavedSearches';
import Favorites from './Favorites';
import Tags from './Tags';
import Dashboard from './Dashboard';
import Thumbnails from './Thumbnails';

const Page: React.FunctionComponent = () => {
	const dispatch = useDispatch();
	const activeView = useSelector((state: RootState) => state.system.activeView);

	useEffect(() => {
		dispatch(actions.savedSearches.loadSavedSearchesFromDb());
	}, []);

	const renderView = (): React.ReactNode => {
		switch (activeView) {
			case 'dashboard':
				return <Dashboard />;
			case 'thumbnails':
				return <Thumbnails />;
			case 'image':
				return <ImageView />;
			case 'online-search':
				return <SearchForm />;
			case 'saved-searches':
				return <SavedSearches />;
			case 'favorites':
				return <Favorites />;
			case 'tag-list':
				return <Tags />;
			default:
				return null;
		}
	};

	return <AppLayout>{renderView()}</AppLayout>;
};

export default Page;
