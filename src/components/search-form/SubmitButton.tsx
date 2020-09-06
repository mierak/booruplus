import React from 'react';
import { Popconfirm, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import { actions, thunks } from '@store';
import { AppDispatch, RootState } from '@store/types';

interface Props {
	mode: 'online' | 'offline';
}

const SubmitButton: React.FunctionComponent<Props> = ({ mode }: Props) => {
	const dispatch = useDispatch<AppDispatch>();

	const state = useSelector((state: RootState) => (mode === 'online' ? state.onlineSearchForm : state.downloadedSearchForm));
	const fetchPosts = mode === 'online' ? thunks.onlineSearchForm.fetchPosts : thunks.downloadedSearchForm.fetchPosts;
	const setPage = mode === 'online' ? actions.onlineSearchForm.setPage : actions.downloadedSearchForm.setPage;
	const isDisabled = state.page === 0;
	const isSearchButtonDisabled = useSelector((state: RootState) => state.loadingStates.isSearchDisabled);

	const handleSubmit = async (): Promise<void> => {
		dispatch(actions.system.setSearchMode(mode));
		dispatch(fetchPosts());
	};

	const handleCancel = (): void => {
		dispatch(setPage(0));
		handleSubmit();
	};

	const handleConfim = (): void => {
		handleSubmit();
	};

	const submit = (): void => {
		isDisabled && handleSubmit();
	};

	const renderButton = (): JSX.Element => {
		return (
			<Button type='primary' onClick={submit} disabled={isSearchButtonDisabled}>
				Search
			</Button>
		);
	};

	const renderPopConfirm = (child: JSX.Element): JSX.Element => {
		return (
			<Popconfirm
				title={`Are you sure you want to start search from page ${state.page}?`}
				cancelText={`Start from page ${state.page}`}
				okText='Start from first page'
				onCancel={handleConfim}
				onConfirm={handleCancel}
				okType='default'
				cancelButtonProps={{
					type: 'primary',
				}}
			>
				{child}
			</Popconfirm>
		);
	};
	return isDisabled ? renderButton() : renderPopConfirm(renderButton());
};

export default React.memo(SubmitButton);
