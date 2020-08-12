import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Modals from '../../src/components/Modals';
import { store } from '../../src/store/';
import { Provider } from 'react-redux';
import { actions } from '../../src/store/modals/index';

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
			store.dispatch(actions.showModal('add-favorites-directory'));
			store.dispatch(actions.setVisible(true));
			const wrapper = setup();

			expect(wrapper.find('AddDirectoryModal')).toHaveLength(1);
		});
		it('Renders AddToFavorites', () => {
			store.dispatch(actions.showModal('add-to-favorites'));
			store.dispatch(actions.setVisible(true));
			const wrapper = setup();

			expect(wrapper.find('AddtoFavoritesModal')).toHaveLength(1);
		});
		it('Renders DeleteDirectoryModal', () => {
			store.dispatch(actions.showModal('delete-favorites-directory'));
			store.dispatch(actions.setVisible(true));
			const wrapper = setup();

			expect(wrapper.find('DeleteDirectoryModal')).toHaveLength(1);
		});
		it('Renders DeleteDirectoryModal', () => {
			store.dispatch(actions.showModal('move-to-directory'));
			store.dispatch(actions.setVisible(true));
			const wrapper = setup();

			expect(wrapper.find('MoveDirectoryModal')).toHaveLength(1);
		});
		it('Renders DeleteDirectoryModal', () => {
			store.dispatch(actions.showModal('settings'));
			store.dispatch(actions.setVisible(true));
			const wrapper = setup();

			expect(wrapper.find('SettingsModal')).toHaveLength(1);
		});
		it('Renders RenameDirectoryModal', () => {
			store.dispatch(actions.showModal('rename-favorites-directory'));
			store.dispatch(actions.setVisible(true));
			const wrapper = setup();

			expect(wrapper.find('RenameDirectoryModal')).toHaveLength(1);
		});
		it('Renders MoveSelectedToDirectoryModal', () => {
			store.dispatch(actions.showModal('move-selected-to-directory-confirmation'));
			store.dispatch(actions.setVisible(true));
			const wrapper = setup();

			expect(wrapper.find('MoveSelectedToDirectoryModal')).toHaveLength(1);
		});

		it('Renders nothing when activeModal is none', () => {
			store.dispatch(actions.showModal('none'));
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
