import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal } from 'antd';

import { RootState, AppDispatch } from '@store/types';
import { globals } from '@/globals';
import { thunks } from '@store';
import LoadingMask from '@components/LoadingMask';
import AppLayout from '@components/layout/Layout';

import ImageView from './ImageView';
import SavedSearches from './SavedSearches';
import Favorites from './Favorites';
import Tags from './Tags';
import Dashboard from './Dashboard';
import Searches from './Searches';

import 'ant-design-pro/dist/ant-design-pro.css';
import '../css/index.css';
import CheckLaterQueue from './CheckLaterQueue';
import { parseVersion } from '@util/utils';
import { getLatestAppVersion } from '@service/apiService';
import NewVersionNotificationModalBody from '@components/NewVersionNotificationModalBody';

const Page: React.FunctionComponent = () => {
	const [hydrated, setHydrated] = useState(false);
	const [stylesLoaded, setStylesLoaded] = useState(false);
	const dispatch = useDispatch<AppDispatch>();

	const activeView = useSelector((state: RootState) => state.system.activeView);
	const theme = useSelector((state: RootState) => state.settings.theme);
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
			if (theme === 'dark') {
				require('../css/scrollbar.dark.css');
				require('antd/dist/antd.dark.css');
			} else {
				require('../css/scrollbar.light.css');
				require('antd/dist/antd.css');
			}
			setStylesLoaded(true);
		}
	}, [hydrated, theme]);

	useEffect(() => {
		if (!hydrated) return;
		(async (): Promise<void> => {
			const response = await getLatestAppVersion();
			if (!response) return;

			const newestVersion = parseVersion(response.tag_name);
			const currentVersion = parseVersion(globals.VERSION);

			if (newestVersion.isNewerThan(currentVersion)) {
				Modal.info({
					width: 600,
					title: 'New version available',
					content: <NewVersionNotificationModalBody data={response} />,
					icon: undefined
				});
			}
		})();
	}, [hydrated]);

	const renderView = (): React.ReactNode => {
		switch (activeView) {
			case 'dashboard':
				return <Dashboard />;
			case 'searches':
				return <Searches />;
			case 'image':
				return <ImageView />;
			case 'saved-searches':
				return <SavedSearches />;
			case 'favorites':
				return <Favorites />;
			case 'tag-list':
				return <Tags />;
			case 'check-later':
				return <CheckLaterQueue />;
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
