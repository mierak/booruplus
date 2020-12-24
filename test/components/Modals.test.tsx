import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Modals from '../../src/components/Modals';
import { store } from '../../src/store/';
import { Provider } from 'react-redux';
import { actions } from '../../src/store/modals/index';
import { ActiveModal } from '@appTypes/modalTypes';

Enzyme.configure({ adapter: new Adapter() });

const setup = (): Enzyme.ReactWrapper => {
	return mount(
		<Provider store={store}>
			<Modals />
		</Provider>
	);
};

describe('components', () => {
	describe('Modals', () => {
		it('Renders AddDirectoryModal', () => {
			store.dispatch(
				actions.showModal(ActiveModal.ADD_FAVORITES_DIRECTORY, {
					selectedNodeKey: 1,
				})
			);
			store.dispatch(actions.setVisible(true));
			const wrapper = setup();

			expect(wrapper.find('AddDirectoryModal')).toHaveLength(1);
		});
		it('Renders AddToFavorites', () => {
			store.dispatch(
				actions.showModal(ActiveModal.ADD_POSTS_TO_FAVORITES, {
					postsToFavorite: [],
				})
			);
			store.dispatch(actions.setVisible(true));
			const wrapper = setup();

			expect(wrapper.find('AddtoFavoritesModal')).toHaveLength(1);
		});
		it('Renders DeleteDirectoryModal', () => {
			store.dispatch(
				actions.showModal(ActiveModal.DELETE_FAVORITES_DIRECTORY, {
					selectedNodeKey: 1,
				})
			);
			store.dispatch(actions.setVisible(true));
			const wrapper = setup();

			expect(wrapper.find('DeleteDirectoryModal')).toHaveLength(1);
		});
		it('Renders MovePostsToSuppliedFavoritesDirectoryModal', () => {
			store.dispatch(
				actions.showModal(ActiveModal.MOVE_POSTS_TO_DIRECTORY_CONFIRMATION, {
					postsToMove: [],
					targetDirectoryKey: 1,
				})
			);
			store.dispatch(actions.setVisible(true));
			const wrapper = setup();

			expect(wrapper.find('MovePostsToSuppliedFavoritesDirectoryModal')).toHaveLength(1);
		});
		it('Renders SettingsModal', () => {
			store.dispatch(actions.showModal(ActiveModal.SETTINGS));
			store.dispatch(actions.setVisible(true));
			const wrapper = setup();

			expect(wrapper.find('SettingsModal')).toHaveLength(1);
		});
		it('Renders RenameDirectoryModal', () => {
			store.dispatch(
				actions.showModal(ActiveModal.RENAME_FAVORITES_DIRECTORY, {
					targetDirectoryKey: 1,
				})
			);
			store.dispatch(actions.setVisible(true));
			const wrapper = setup();

			expect(wrapper.find('RenameDirectoryModal')).toHaveLength(1);
		});
		it('Renders MovePostsToFavoritesDirectoryModal', () => {
			store.dispatch(
				actions.showModal(ActiveModal.MOVE_POSTS_TO_DIRECTORY_SELECTION, {
					postsToMove: [],
				})
			);
			store.dispatch(actions.setVisible(true));
			const wrapper = setup();

			expect(wrapper.find('MovePostsToFavoritesDirectoryModal')).toHaveLength(1);
		});

		it('Renders nothing when activeModal is none', () => {
			store.dispatch(actions.showModal(ActiveModal.NONE));
			store.dispatch(actions.setVisible(true));
			const wrapper = setup();

			expect(wrapper.isEmptyRender()).toBe(true);
		});
		it('Renders nothing when visible is false in modal store', () => {
			store.dispatch(actions.setVisible(false));
			const wrapper = setup();

			expect(wrapper.isEmptyRender()).toBe(true);
		});
	});
});
