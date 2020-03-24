import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { InputNumber } from 'antd';

import { RootState } from '../../../store/types';
import { actions } from '../../../store';

const PostCountSelect: React.FunctionComponent = () => {
	const dispatch = useDispatch();

	const postLimit = useSelector((state: RootState) => state.downloadedSearchForm.postLimit);

	const handlePostCountChange = (value: number | undefined): void => {
		value && dispatch(actions.downloadedSearchForm.setPostLimit(value));
	};

	return (
		<InputNumber
			min={1}
			max={100}
			defaultValue={postLimit}
			style={{ width: '100%' }}
			onChange={handlePostCountChange}
			value={postLimit}
		></InputNumber>
	);
};

export default PostCountSelect;
