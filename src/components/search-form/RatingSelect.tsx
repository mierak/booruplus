import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Select } from 'antd';

import { RootState } from '../../../store/types';
import { actions } from '../../../store';

import { Rating } from '../../../types/gelbooruTypes';

const RatingSelect: React.FunctionComponent = () => {
	const dispatch = useDispatch();
	const rating = useSelector((state: RootState) => state.downloadedSearchForm.rating);

	const handleRatingSelect = (val: Rating): void => {
		dispatch(actions.downloadedSearchForm.setRating(val));
	};

	return (
		<Select defaultValue={rating} value={rating} onChange={handleRatingSelect}>
			<Select.Option key="any" value="any">
				Any
			</Select.Option>
			<Select.Option key="safe" value="safe">
				Safe
			</Select.Option>
			<Select.Option key="questionable" value="questionable">
				Questionable
			</Select.Option>
			<Select.Option key="explicit" value="explicit">
				Explicit
			</Select.Option>
		</Select>
	);
};

export default RatingSelect;
