import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { InputNumber } from 'antd';

import { PostsContext, RootState } from '@store/types';
import { actions } from '@store';

type Props = {
	context: PostsContext | string;
};

const PostCountSelect: React.FunctionComponent<Props> = ({ context }: Props) => {
	const dispatch = useDispatch();

	const postLimit = useSelector((state: RootState) => state.onlineSearchForm[context].limit);

	const handlePostCountChange = (value: number | string | undefined): void => {
		let data: number;
		if (typeof value === 'string') {
			data = parseInt(value);
		} else if (typeof value === 'number') {
			data = value;
		} else {
			return;
		}
		dispatch(actions.onlineSearchForm.updateContext({ context, data: { limit: data } }));
	};

	return (
		<>
			<InputNumber
				min={1}
				max={100}
				defaultValue={postLimit}
				style={{ width: '100%' }}
				onChange={handlePostCountChange}
				value={postLimit}
			></InputNumber>
		</>
	);
};

export default PostCountSelect;
