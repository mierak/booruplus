import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Select } from 'antd';

import { PostsContext, RootState } from '@store/types';
import { actions } from '@store';

import { Rating } from '@appTypes/gelbooruTypes';

type Props = {
	context: PostsContext | string;
	open?: boolean;
};

const RatingSelect: React.FunctionComponent<Props> = ({ open, context }: Props) => {
	const dispatch = useDispatch();
	const rating = useSelector((state: RootState) => state.onlineSearchForm[context].rating);

	const handleRatingSelect = (data: Rating): void => {
		dispatch(actions.onlineSearchForm.updateContext({ context, data: { rating: data } }));
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
