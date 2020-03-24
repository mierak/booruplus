import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { InputNumber } from 'antd';

import { RootState } from '../../../store/types';
import { actions } from '../../../store';

const PageSelect: React.FunctionComponent = () => {
	const dispatch = useDispatch();

	const page = useSelector((state: RootState) => state.downloadedSearchForm.page);

	const handlePageChange = (value: number | undefined): void => {
		value !== undefined && dispatch(actions.downloadedSearchForm.setPage(value));
	};

	return (
		<InputNumber min={0} max={1000} defaultValue={page} style={{ width: '100%' }} onChange={handlePageChange} value={page}></InputNumber>
	);
};

export default PageSelect;
