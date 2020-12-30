import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Modal, Tabs } from 'antd';

import type { AppDispatch, RootState } from '@store/types';
import type { SearchFormModalProps } from '@appTypes/modalTypes';

import { actions, thunks } from '@store';

import SubmitButton from '@components/search-form/SubmitButton';
import { deletePostsContext } from '../../../store/commonActions';
import SearchForm from '@components/search-form/SearchForm';

const SearchFormModal: React.FunctionComponent<SearchFormModalProps> = (props) => {
	const dispatch = useDispatch<AppDispatch>();
	const activeTab = useSelector((state: RootState) => state.onlineSearchForm[props.context].mode);
	const fetchPosts =
		activeTab === 'online' ? thunks.onlineSearchForm.fetchPosts : thunks.downloadedSearchForm.fetchPosts;

	const handleClear = (): void => {
		dispatch(actions.onlineSearchForm.clear({ context: props.context }));
	};

	const handleClose = (): void => {
		dispatch(actions.system.setActiveSearchTab(props.previousTab));
		dispatch(deletePostsContext({ context: props.context }));
		dispatch(actions.modals.setVisible(false));
	};

	const footer = (
		<>
			<SubmitButton
				context={props.context}
				onSubmit={(): void => {
					dispatch(actions.modals.setVisible(false));
					dispatch(fetchPosts({ context: props.context }));
				}}
			/>
			<Button type='dashed' onClick={handleClear} style={{ marginLeft: '8px' }}>
				Clear
			</Button>
			<Button onClick={handleClose} style={{ marginLeft: '8px' }}>
				Close
			</Button>
		</>
	);
	return (
		<Modal centered visible={true} footer={footer} width={700} onCancel={handleClose}>
			<Tabs
				size='small'
				activeKey={activeTab}
				onChange={(key): void => {
					dispatch(
						actions.onlineSearchForm.updateContext({ context: props.context, data: { mode: key as 'online' | 'offline' } })
					);
				}}
			>
				<Tabs.TabPane tab='Online Search' key='online'>
					<SearchForm {...props} />
				</Tabs.TabPane>
				<Tabs.TabPane tab='Offline Search' key='offline'>
					<SearchForm {...props} />
				</Tabs.TabPane>
			</Tabs>
		</Modal>
	);
};

export default SearchFormModal;
