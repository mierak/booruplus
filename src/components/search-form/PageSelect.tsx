import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { InputNumber } from 'antd';

import { RootState } from '@store/types';
import { actions } from '@store';

type Props = {
	mode: 'online' | 'offline';
}

const PageSelect: React.FunctionComponent<Props> = ({ mode }: Props) => {
	const dispatch = useDispatch();

	const page = useSelector((state: RootState) => (mode === 'offline' && state.downloadedSearchForm.page) || state.onlineSearchForm.page);

	const handlePageChange = (value: number | string | undefined): void => {
		let val: number;
		if (typeof value === 'string') {
			val = parseInt(value);
		} else if (typeof value === 'number') {
			val = value;
		} else {
			return;
		}
		const setPage = (mode === 'offline' && actions.downloadedSearchForm.setPage) || actions.onlineSearchForm.setPage;
		dispatch(setPage(val));
	};

	return (
		<InputNumber min={0} max={1000} defaultValue={page} style={{ width: '100%' }} onChange={handlePageChange} value={page}></InputNumber>
	);
};

export default PageSelect;
