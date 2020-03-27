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
import Settings from './Settings';

const Page: React.FunctionComponent = () => {
	const dispatch = useDispatch();

	const activeView = useSelector((state: RootState) => state.system.activeView);
	const settings = useSelector((state: RootState) => state.settings);

	useEffect(() => {
		dispatch(actions.savedSearches.loadSavedSearchesFromDb());
		dispatch(actions.settings.loadSettings('user'));
	}, []);

	useEffect(() => {
		window.api.send('settings-loaded', settings);
	}, [settings]);

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
			case 'settings':
				return <Settings />;
			default:
				return null;
		}
	};

	return <AppLayout>{renderView()}</AppLayout>;
};

export default Page;
