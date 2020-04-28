import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';

// import { RootState, AppDispatch } from '../../store/types';

// import AppLayout from '../components/Layout';
// import ImageView from './ImageView';
// import SearchForm from '../components/OnlineSearchForm';
// import SavedSearches from './SavedSearches';
// import Favorites from './Favorites';
// import Tags from './Tags';
// import Dashboard from './Dashboard';
// import Thumbnails from './Thumbnails';
// import Settings from './Settings';

import 'ant-design-pro/dist/ant-design-pro.css';
import '../css/index.css';
// import { thunks } from 'store';

const Page: React.FunctionComponent = () => {
	// const [loaded, setLoaded] = useState(false);
	// const dispatch = useDispatch<AppDispatch>();

	// const activeView = useSelector((state: RootState) => state.system.activeView);
	// const settings = useSelector((state: RootState) => state.settings);

	// useEffect(() => {
	// 	(async (): Promise<void> => {
	// 		await dispatch(thunks.settings.loadSettings('user'));

	// 		if (settings.theme === 'dark') {
	// 			require('../css/scrollbar.dark.css');
	// 			require('antd/dist/antd.dark.css');
	// 		} else {
	// 			require('../css/scrollbar.light.css');
	// 			require('antd/dist/antd.css');
	// 		}
	// 		setLoaded(true);
	// 		dispatch(thunks.favorites.fetchTreeData());
	// 	})();
	// }, []);

	// useEffect(() => {
	// 	window.api.send('settings-loaded', settings);
	// }, [settings]);

	// const renderView = (): React.ReactNode => {
	// 	switch (activeView) {
	// 		case 'dashboard':
	// 			return <Dashboard />;
	// 		case 'thumbnails':
	// 			return <Thumbnails />;
	// 		case 'image':
	// 			return <ImageView />;
	// 		case 'online-search':
	// 			return <SearchForm />;
	// 		case 'saved-searches':
	// 			return <SavedSearches />;
	// 		case 'favorites':
	// 			return <Favorites />;
	// 		case 'tag-list':
	// 			return <Tags />;
	// 		case 'settings':
	// 			return <Settings />;
	// 		default:
	// 			return null;
	// 	}
	// };

	// return <>{loaded ? <AppLayout>{<div></div>}</AppLayout> : ''}</>;
	return <div></div>;
};

export default Page;
