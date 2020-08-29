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
	const [hydrated, setHydrated] = useState(false);
	const [stylesLoaded, setStylesLoaded] = useState(false);
	const dispatch = useDispatch<AppDispatch>();

	const activeView = useSelector((state: RootState) => state.system.activeView);
	const settings = useSelector((state: RootState) => state.settings);
	const loadingMaskVisible = useSelector((state: RootState) => state.loadingStates.isFullscreenLoadingMaskVisible);

	useEffect(() => {
		(async (): Promise<void> => {
			await dispatch(thunks.settings.loadSettings('user'));
			await dispatch(thunks.tasks.rehydrateFromDb());
			await dispatch(thunks.favorites.fetchTreeData());
			await dispatch(thunks.favorites.fetchAllKeys());
			setHydrated(true);
		})();
	}, [dispatch]);

	useEffect(() => {
		if (hydrated) {
			if (settings.theme === 'dark') {
				require('../css/scrollbar.dark.css');
				require('antd/dist/antd.dark.css');
			} else {
				require('../css/scrollbar.light.css');
				require('antd/dist/antd.css');
			}
			setStylesLoaded(true);
		}
	}, [hydrated, settings.theme]);

	useEffect(() => {
		hydrated && window.api.send(IpcChannels.SETTINGS_LOADED, settings);
	}, [hydrated, settings]);

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
			<LoadingMask delay={0} opacity={0.9} visible={loadingMaskVisible} />
			{stylesLoaded ? <AppLayout>{renderView()}</AppLayout> : ''}
		</>
	);
};

export default Page;
