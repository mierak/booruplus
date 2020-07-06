import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState, AppDispatch } from '../store/types';

import AppLayout from '../components/layout/Layout';
import ImageView from './ImageView';
import SavedSearches from './SavedSearches';
import Favorites from './Favorites';
import Tags from './Tags';
import Dashboard from './Dashboard';
import Thumbnails from './Thumbnails';

import 'ant-design-pro/dist/ant-design-pro.css';
import '../css/index.css';
import { thunks } from '../store';

const Page: React.FunctionComponent = () => {
	const [loaded, setLoaded] = useState(false);
	const dispatch = useDispatch<AppDispatch>();

	const activeView = useSelector((state: RootState) => state.system.activeView);
	const settings = useSelector((state: RootState) => state.settings);
	useEffect(() => {
		(async (): Promise<void> => {
			await dispatch(thunks.settings.loadSettings('user'));
			await dispatch(thunks.tasks.rehydrateFromDb());
			await dispatch(thunks.favorites.fetchTreeData());
			await dispatch(thunks.favorites.fetchAllKeys());

			if (settings.theme === 'dark') {
				require('../css/scrollbar.dark.css');
				require('antd/dist/antd.dark.css');
			} else {
				require('../css/scrollbar.light.css');
				require('antd/dist/antd.css');
			}
			setLoaded(true);
		})();
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
			case 'saved-searches':
				return <SavedSearches />;
			case 'favorites':
				return <Favorites />;
			case 'tag-list':
				return <Tags />;
		}
	};

	return <>{loaded ? <AppLayout>{renderView()}</AppLayout> : ''}</>;
};

export default Page;
