import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { InputNumber } from 'antd';

import { RootState, SearchMode } from '../../../store/types';
import { actions } from '../../../store';

interface Props {
	mode: SearchMode;
}

//TODO FIX - Pagination for offline search is not implemented
const PageSelect: React.FunctionComponent<Props> = ({ mode }: Props) => {
	const dispatch = useDispatch();

	const page = useSelector((state: RootState) => (mode === 'offline' && state.downloadedSearchForm.page) || state.onlineSearchForm.page);

	const handlePageChange = (value: number | undefined): void => {
		const setPage = (mode === 'offline' && actions.downloadedSearchForm.setPage) || actions.onlineSearchForm.setPage;
		value !== undefined && dispatch(setPage(value));
	};

	return (
		<InputNumber min={0} max={1000} defaultValue={page} style={{ width: '100%' }} onChange={handlePageChange} value={page}></InputNumber>
	);
};

export default PageSelect;
