import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { InputNumber } from 'antd';

import { PostsContext, RootState } from '@store/types';
import { actions } from '@store';

type Props = {
	context: PostsContext | string;
};

const PageSelect: React.FunctionComponent<Props> = ({ context }: Props) => {
	const dispatch = useDispatch();

	const page = useSelector((state: RootState) => state.searchContexts[context].page);

	const handlePageChange = (value: number | string | undefined): void => {
		let data: number;
		if (typeof value === 'string') {
			data = parseInt(value);
		} else if (typeof value === 'number') {
			data = value;
		} else {
			return;
		}
		dispatch(actions.searchContexts.updateContext({ context, data: { page: data } }));
	};

	return (
		<InputNumber
			min={0}
			max={1000}
			defaultValue={page}
			style={{ width: '100%' }}
			onChange={handlePageChange}
			value={page}
		></InputNumber>
	);
};

export default PageSelect;
