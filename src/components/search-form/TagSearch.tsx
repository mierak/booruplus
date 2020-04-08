import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { SelectValue } from 'antd/lib/select';
import { Select, Spin } from 'antd';

import { actions } from '../../../store';
import { RootState, SearchMode } from '../../../store/types';

import { Tag } from '../../../types/gelbooruTypes';
import TagSelectOption from '../TagSelectOption';
import { useDebounce } from '../../hooks/useDebounce';

interface Props {
	mode: SearchMode;
}

const StyledSpin = styled(Spin)`
	margin: 50px 100px 50px auto;
	width: 465px;
`;

const TagSearch: React.FunctionComponent<Props> = ({ mode }: Props) => {
	const dispatch = useDispatch();

	const [selectValue] = useState('');
	const [value, setValue] = useState('');
	const isLoadingTags = useSelector((state: RootState) => state.system.isTagOptionsLoading);

	const options = useSelector(
		(state: RootState): Tag[] => (mode === 'offline' && state.downloadedSearchForm.tagOptions) || state.onlineSearchForm.tagOptions
	);

	const debounced = useDebounce(value, 300);

	const handleChange = async (e: SelectValue): Promise<void> => {
		setValue(e.toString());
	};

	useEffect(() => {
		const load =
			(mode === 'offline' && actions.downloadedSearchForm.loadByPatternFromDb) || actions.onlineSearchForm.getTagsByPatternFromApi;
		debounced.length >= 2 && dispatch(load(debounced));
	}, [debounced]);

	const handleSelect = (e: SelectValue): void => {
		const tag = options.find((t: Tag) => t.tag === e.toString());
		const addTag = (mode === 'offline' && actions.downloadedSearchForm.addTag) || actions.onlineSearchForm.addTag;
		tag && dispatch(addTag(tag));
	};

	const renderSelectOptions = (): JSX.Element[] => {
		return options.map((option: Tag) => (
			<Select.Option key={option.tag} value={option.tag}>
				<TagSelectOption tag={option} />
			</Select.Option>
		));
	};

	return (
		<Select
			showArrow={false}
			showSearch
			onSearch={handleChange}
			onChange={handleSelect}
			value={selectValue}
			loading={isLoadingTags}
			notFoundContent={isLoadingTags ? <StyledSpin tip="Fetching tags..." /> : null}
		>
			{renderSelectOptions()}
		</Select>
	);
};

export default TagSearch;
