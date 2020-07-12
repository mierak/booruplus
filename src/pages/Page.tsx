import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState, AppDispatch } from '../store/types';
import { IpcChannels } from '../types/processDto';

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
import LoadingMask from '../components/LoadingMask';

const Page: React.FunctionComponent = () => {
	const [loaded, setLoaded] = useState(false);
	const dispatch = useDispatch<AppDispatch>();

	const activeView = useSelector((state: RootState) => state.system.activeView);
	const settings = useSelector((state: RootState) => state.settings);
	const loadingMaskVisible = useSelector((state: RootState) => state.loadingStates.isFullscreenLoadingMaskVisible);
	const loadingMaskMessage = useSelector((state: RootState) => state.loadingStates.fullscreenLoadingMaskMessage);

	useEffect(() => {
		(async (): Promise<void> => {
			await dispatch(thunks.settings.loadSettings('user'));
			await dispatch(thunks.tasks.rehydrateFromDb());
			await dispatch(thunks.favorites.fetchTreeData());
			await dispatch(thunks.favorites.fetchAllKeys());
			setLoaded(true);
		})();
	}, []);

	useEffect(() => {
		if (loaded) {
			if (settings.theme === 'dark') {
				require('../css/scrollbar.dark.css');
				require('antd/dist/antd.dark.css');
			} else {
				require('../css/scrollbar.light.css');
				require('antd/dist/antd.css');
			}
		}
	}, [loaded]);

	useEffect(() => {
		window.api.send(IpcChannels.SETTINGS_LOADED, settings);
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

	return (
		<>
			<LoadingMask visible={loadingMaskVisible} message={loadingMaskMessage} delay={0} opacity={0.9} />
			{loaded ? <AppLayout>{renderView()}</AppLayout> : ''}
		</>
	);
};

export default Page;
