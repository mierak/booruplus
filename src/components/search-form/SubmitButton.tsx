import React from 'react';
import { Popconfirm, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import { actions } from 'store/';
import { AppDispatch, RootState, SearchMode } from 'store/types';

interface Props {
	mode: SearchMode;
}

const SubmitButton: React.FunctionComponent<Props> = ({ mode }: Props) => {
	const dispatch = useDispatch<AppDispatch>();

	const state = useSelector((state: RootState) => (mode === 'online' ? state.onlineSearchForm : state.downloadedSearchForm));
	const fetchPosts = mode === 'online' ? actions.onlineSearchForm.fetchPosts : actions.downloadedSearchForm.fetchPosts;
	const setPage = mode === 'online' ? actions.onlineSearchForm.setPage : actions.downloadedSearchForm.setPage;
	const setFormVisible =
		mode === 'online' ? actions.system.setSearchFormDrawerVisible : actions.system.setDownloadedSearchFormDrawerVisible;
	const isDisabled = state.page === 0;

	const handleSubmit = async (): Promise<void> => {
		dispatch(setFormVisible(false));
		dispatch(actions.system.setActiveView('thumbnails'));
		dispatch(actions.system.setSearchMode('offline'));
		dispatch(actions.posts.setActivePostIndex(undefined));
		dispatch(fetchPosts());
	};

	const handleCancel = (): void => {
		dispatch(setPage(0));
		handleSubmit();
	};

	const handleConfim = (): void => {
		handleSubmit();
	};

	const renderButton = (): JSX.Element => {
		const submit = (): void => {
			isDisabled && handleSubmit();
		};

		return (
			<Button type="primary" onClick={submit}>
				Search
			</Button>
		);
	};

	const renderPopConfirm = (child: JSX.Element): JSX.Element => {
		return (
			<Popconfirm
				title={`Are you sure you want to start search from page ${state.page}?`}
				cancelText={`Start from page ${state.page}`}
				okText="Start from first page"
				onCancel={handleConfim}
				onConfirm={handleCancel}
				okType="default"
				cancelButtonProps={{
					type: 'primary'
				}}
			>
				{child}
			</Popconfirm>
		);
	};
	return isDisabled ? renderButton() : renderPopConfirm(renderButton());
};

export default React.memo(SubmitButton);
