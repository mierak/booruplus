import React from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@store/types';

import AddDirectoryModal from '../favorites/modal/AddDirectoryModal';
import AddtoFavoritesModal from '../favorites/modal/AddToFavoritesModal';
import DeleteDirectoryModal from '../favorites/modal/DeleteDirectoryModal';
import MovePostsToFavoritesDirectoryModal from '../favorites/modal/MovePostsToFavoritesDirectoryModal';
import SettingsModal from '../settings/SettingsModal';
import RenameDirectoryModal from '../favorites/modal/RenameDirectoryModal';
import MovePostsToSuppliedFavoritesDirectoryModal from '../favorites/modal/MovePostsToSuppliedFavoritesDirectoryModal';
import { ActiveModal } from '@appTypes/modalTypes';
import SearchFormModal from './modals/SearchFormModal';

const Modals: React.FunctionComponent = () => {
	const activeModal = useSelector((state: RootState) => state.modals.activeModal);
	const visible = useSelector((state: RootState) => state.modals.isVisible);
	const props = useSelector((state: RootState) => state.modals.modalProps);
	const favoritesTreeData = useSelector((state: RootState) => state.favorites.rootNode);
	const favoritesTreeExpandedKeys = useSelector((state: RootState) => state.favorites.expandedKeys);

	const renderModal = (): React.ReactElement => {
		switch (activeModal) {
			case ActiveModal.NONE:
				return <></>;
			case ActiveModal.ADD_FAVORITES_DIRECTORY:
				return <AddDirectoryModal {...props[ActiveModal.ADD_FAVORITES_DIRECTORY]} />;
			case ActiveModal.ADD_POSTS_TO_FAVORITES:
				return (
					<AddtoFavoritesModal
						expandedKeys={favoritesTreeExpandedKeys}
						treeData={favoritesTreeData?.children}
						data={props[ActiveModal.ADD_POSTS_TO_FAVORITES]}
					/>
				);
			case ActiveModal.DELETE_FAVORITES_DIRECTORY:
				return <DeleteDirectoryModal {...props[ActiveModal.DELETE_FAVORITES_DIRECTORY]} />;
			case ActiveModal.RENAME_FAVORITES_DIRECTORY:
				return <RenameDirectoryModal {...props[ActiveModal.RENAME_FAVORITES_DIRECTORY]} />;
			case ActiveModal.MOVE_POSTS_TO_DIRECTORY_CONFIRMATION:
				return <MovePostsToSuppliedFavoritesDirectoryModal {...props[ActiveModal.MOVE_POSTS_TO_DIRECTORY_CONFIRMATION]} />;
			case ActiveModal.MOVE_POSTS_TO_DIRECTORY_SELECTION: {
				return (
					<MovePostsToFavoritesDirectoryModal
						expandedKeys={favoritesTreeExpandedKeys}
						treeData={favoritesTreeData?.children}
						{...props[ActiveModal.MOVE_POSTS_TO_DIRECTORY_SELECTION]}
					/>
				);
			}
			case ActiveModal.SETTINGS:
				return <SettingsModal />;
			case ActiveModal.SEARCH_FORM:
				return <SearchFormModal {...props[ActiveModal.SEARCH_FORM]} />;
		}
	};

	return visible ? renderModal() : <></>;
};

export default Modals;
