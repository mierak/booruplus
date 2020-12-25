import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RadioChangeEvent } from 'antd/lib/radio';
import { Radio } from 'antd';

import { actions } from '@store';
import { RootState, AppDispatch, SortOrder } from '@store/types';
type Props = {
	className?: string;
	mode: 'online' | 'offline';
}

const OrderSelect: React.FunctionComponent<Props> = (props: Props) => {
	const dispatch = useDispatch<AppDispatch>();

	const onChange = props.mode === 'online' ? actions.onlineSearchForm.setSortOrder : actions.downloadedSearchForm.setSortOrder;

	const value = useSelector((state: RootState) =>
		props.mode === 'online' ? state.onlineSearchForm.sortOrder : state.downloadedSearchForm.sortOrder
	);

	const handleChange = (event: RadioChangeEvent): void => {
		const val = event.target.value as SortOrder;
		dispatch(onChange(val));
	};

	return (
		<Radio.Group value={value} className={props.className} onChange={handleChange}>
			<Radio value='desc'>Desc</Radio>
			<Radio value='asc'>Asc</Radio>
		</Radio.Group>
	);
};

export default OrderSelect;
