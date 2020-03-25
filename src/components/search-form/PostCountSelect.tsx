import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { InputNumber } from 'antd';

import { RootState, SearchMode } from '../../../store/types';
import { actions } from '../../../store';

interface Props {
	mode: SearchMode;
}

//TODO FIX - Post limit for offline search is not implemented
const PostCountSelect: React.FunctionComponent<Props> = ({ mode }: Props) => {
	const dispatch = useDispatch();

	const postLimit = useSelector(
		(state: RootState) => (mode === 'offline' && state.downloadedSearchForm.postLimit) || state.onlineSearchForm.limit
	);

	const handlePostCountChange = (value: number | undefined): void => {
		const setPostLimit = (mode === 'offline' && actions.downloadedSearchForm.setPostLimit) || actions.onlineSearchForm.setLimit;
		value && dispatch(setPostLimit(value));
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
