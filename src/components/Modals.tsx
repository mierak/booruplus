import React from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../store/types';

import AddDirectoryModal from './favorites/modal/AddDirectoryModal';
import AddtoFavoritesModal from './favorites/modal/AddToFavoritesModal';
import DeleteDirectoryModal from './favorites/modal/DeleteDirectoryModal';
import MoveDirectoryModal from './favorites/modal/MoveDirectoryModal';
import SettingsModal from './settings/SettingsModal';
import RenameDirectoryModal from './favorites/modal/RenameDirectoryModal';

const Modals: React.FunctionComponent = () => {
	const activeModal = useSelector((state: RootState) => state.modals.common.activeModal);
	const visible = useSelector((state: RootState) => state.modals.common.isVisible);

	const renderModal = (): React.ReactElement => {
		switch (activeModal) {
			case 'none':
				return <></>;
			case 'add-favorites-directory':
				return <AddDirectoryModal />;
			case 'add-to-favorites':
				return <AddtoFavoritesModal />;
			case 'delete-favorites-directory':
				return <DeleteDirectoryModal />;
			case 'move-to-directory':
				return <MoveDirectoryModal />;
			case 'settings':
				return <SettingsModal />;
			case 'rename-favorites-directory':
				return <RenameDirectoryModal />;
		}
	};

	return visible ? renderModal() : <></>;
};

export default Modals;
