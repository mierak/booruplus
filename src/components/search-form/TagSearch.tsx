import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { SelectValue } from 'antd/lib/select';
import { Select } from 'antd';

import { actions } from '../../../store';
import { RootState } from '../../../store/types';

import { Tag } from '../../../types/gelbooruTypes';
import TagSelectOption from '../TagSelectOption';
import { useDebounce } from '../../hooks/useDebounce';

const TagSearch: React.FunctionComponent = () => {
	const [selectValue] = useState('');
	const [value, setValue] = useState('');
	const dispatch = useDispatch();

	const options = useSelector((state: RootState): Tag[] => state.downloadedSearchForm.tagOptions);

	const debounced = useDebounce(value, 300);

	const handleChange = async (e: SelectValue): Promise<void> => {
		setValue(e.toString());
	};

	useEffect(() => {
		debounced.length >= 3 && dispatch(actions.downloadedSearchForm.loadByPatternFromDb(debounced));
	}, [debounced]);

	const handleSelect = (e: SelectValue): void => {
		const tag = options.find((t: Tag) => t.tag === e.toString());
		tag && dispatch(actions.downloadedSearchForm.addTag(tag));
	};

	const renderSelectOptions = (): JSX.Element[] => {
		return options.map((option: Tag) => (
			<Select.Option key={option.tag} value={option.tag}>
				<TagSelectOption tag={option} />
			</Select.Option>
		));
	};

	return (
		<Select showArrow={false} showSearch onSearch={handleChange} onChange={handleSelect} value={selectValue}>
			{renderSelectOptions()}
		</Select>
	);
};

export default TagSearch;
