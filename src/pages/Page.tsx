/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/main';
import { loadSavedSearchesFromDb } from '../../store/savedSearches';
import AppLayout from '../components/Layout';
import ImageView from './ImageView';
import SearchForm from '../components/SearchForm';
import SavedSearches from './SavedSearches';
import Favorites from './Favorites';
import Tags from './Tags';
import Dashboard from './Dashboard';
import Thumbnails from './Thumbnails';

interface Props {
	className?: string;
}

const Page: React.FunctionComponent<Props> = (props: Props) => {
	const dispatch = useDispatch();
	const activeView = useSelector((state: RootState) => state.system.activeView);

	useEffect(() => {
		dispatch(loadSavedSearchesFromDb());
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
