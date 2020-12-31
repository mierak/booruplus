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

	const value = useSelector((state: RootState) => state.searchContexts[context].sortOrder);

	const handleChange = (event: RadioChangeEvent): void => {
		dispatch(actions.searchContexts.updateContext({ context, data: { sortOrder: event.target.value as SortOrder } }));
	};

	return (
		<Radio.Group value={value} className={className} onChange={handleChange}>
			<Radio value='desc'>Desc</Radio>
			<Radio value='asc'>Asc</Radio>
		</Radio.Group>
	);
};

export default OrderSelect;
