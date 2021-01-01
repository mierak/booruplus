import React from 'react';
import { Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch, PostsContext, RootState, Sort } from '@store/types';
import { actions } from '@store';

type Props = {
	className?: string;
	context: PostsContext | string;
	open?: boolean;
};

const { Option } = Select;

const SortSelect: React.FunctionComponent<Props> = ({ context, open, className }) => {
	const dispatch = useDispatch<AppDispatch>();

	const value = useSelector((state: RootState) => state.searchContexts[context].sort);
	const mode = useSelector((state: RootState) => state.searchContexts[context].mode);

	React.useEffect(() => {
		if (mode === 'offline' && value === 'date-uploaded') {
			dispatch(actions.searchContexts.updateContext({ context, data: { sort: 'date-downloaded' } }));
		} else if (mode === 'online' && value === 'date-downloaded') {
			dispatch(actions.searchContexts.updateContext({ context, data: { sort: 'date-uploaded' } }));
		}
	}, [context, dispatch, mode, value]);

	const handleChange = (sort: Sort): void => {
		dispatch(actions.searchContexts.updateContext({ context, data: { sort } }));
	};

	const renderOptions = (): React.ReactNode => {
		const options: JSX.Element[] = [];
		if (mode === 'online') {
			options.push(
				<Option key='select-option-date-uploaded' value='date-uploaded'>
					Date Uploaded
				</Option>
			);
		}
		if (mode === 'offline') {
			options.push(
				<Option key='select-option-date-downloaded' value='date-downloaded'>
					Date Downloaded
				</Option>
			);
		}
		options.push(
			<Option key='select-option-date' value='date-updated'>
				Date Updated
			</Option>
		);
		options.push(
			<Option key='select-option-rating' value='rating'>
				Rating
			</Option>
		);
		return options;
	};

	return (
		<Select value={value} className={className} onChange={handleChange} open={open}>
			{renderOptions()}
		</Select>
	);
};

export default SortSelect;
