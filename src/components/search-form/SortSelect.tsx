import React from 'react';
import { Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState, Sort } from '../../store/types';
import { actions } from '../../store';

interface Props {
	className?: string;
	mode: 'online' | 'offline';
	open?: boolean;
}

const { Option } = Select;

const SortSelect: React.FunctionComponent<Props> = (props: Props) => {
	const dispatch = useDispatch<AppDispatch>();

	const value = useSelector((state: RootState) =>
		props.mode === 'online' ? state.onlineSearchForm.sort : state.downloadedSearchForm.sort
	);

	const onChange = props.mode === 'online' ? actions.onlineSearchForm.setSort : actions.downloadedSearchForm.setSort;

	const handleChange = (val: Sort): void => {
		dispatch(onChange(val));
	};

	const renderOptions = (): React.ReactNode => {
		const options: JSX.Element[] = [];
		if (props.mode === 'online') {
			options.push(
				<Option key='select-option-date-uploaded' value='date-uploaded'>
					Date Uploaded
				</Option>
			);
		}
		if (props.mode === 'offline') {
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
		<Select defaultValue={value} className={props.className} onChange={handleChange} open={props.open}>
			{renderOptions()}
		</Select>
	);
};

export default SortSelect;
