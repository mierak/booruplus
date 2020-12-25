import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Select } from 'antd';

import { RootState } from '@store/types';
import { actions } from '@store';

import { Rating } from '@appTypes/gelbooruTypes';

type Props = {
	mode: 'online' | 'offline';
	open?: boolean;
}

const RatingSelect: React.FunctionComponent<Props> = ({ mode, open }: Props) => {
	const dispatch = useDispatch();
	const rating = useSelector(
		(state: RootState) => (mode === 'offline' && state.downloadedSearchForm.rating) || state.onlineSearchForm.rating
	);

	const handleRatingSelect = (val: Rating): void => {
		const setRating = (mode === 'offline' && actions.downloadedSearchForm.setRating) || actions.onlineSearchForm.setRating;
		dispatch(setRating(val));
	};

	return (
		<Select defaultValue={rating} value={rating} onChange={handleRatingSelect} open={open} virtual={false}>
			<Select.Option key='any' value='any'>
				Any
			</Select.Option>
			<Select.Option key='safe' value='safe'>
				Safe
			</Select.Option>
			<Select.Option key='questionable' value='questionable'>
				Questionable
			</Select.Option>
			<Select.Option key='explicit' value='explicit'>
				Explicit
			</Select.Option>
		</Select>
	);
};

export default RatingSelect;
