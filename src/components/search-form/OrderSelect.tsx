import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RadioChangeEvent } from 'antd/lib/radio';
import { Radio } from 'antd';

import { actions } from '@store';
import { RootState, AppDispatch, SortOrder, PostsContext } from '@store/types';
type Props = {
	className?: string;
	context: PostsContext | string;
};

const OrderSelect: React.FunctionComponent<Props> = ({ context, className }) => {
	const dispatch = useDispatch<AppDispatch>();

	const onChange = actions.onlineSearchForm.setSortOrder;

	const value = useSelector((state: RootState) => state.onlineSearchForm[context].sortOrder);

	const handleChange = (event: RadioChangeEvent): void => {
		const data = event.target.value as SortOrder;
		dispatch(onChange({ context, data }));
	};

	return (
		<Radio.Group value={value} className={className} onChange={handleChange}>
			<Radio value='desc'>Desc</Radio>
			<Radio value='asc'>Asc</Radio>
		</Radio.Group>
	);
};

export default OrderSelect;
