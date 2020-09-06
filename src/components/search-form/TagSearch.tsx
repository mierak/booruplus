import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { SelectValue } from 'antd/lib/select';
import { Select, Spin } from 'antd';

import { actions, thunks } from '@store';
import { RootState } from '@store/types';

import { Tag } from '@appTypes/gelbooruTypes';
import { useDebounce } from '@hooks/useDebounce';
import TagSelectOption from '@components/TagSelectOption';

interface Props {
	mode: 'online' | 'offline';
	open?: boolean;
}

const StyledSpin = styled(Spin)`
	margin: 50px 100px 50px auto;
	width: 465px;
`;

const TagSearch: React.FunctionComponent<Props> = ({ mode, open }: Props) => {
	const dispatch = useDispatch();

	const [selectValue] = useState('');
	const [value, setValue] = useState('');
	const isLoadingTags = useSelector((state: RootState) => state.system.isTagOptionsLoading);

	const options = useSelector(
		(state: RootState): Tag[] => (mode === 'offline' && state.downloadedSearchForm.tagOptions) || state.onlineSearchForm.tagOptions
	);

	const load = (mode === 'offline' && thunks.downloadedSearchForm.loadTagsByPattern) || thunks.onlineSearchForm.getTagsByPatternFromApi;
	const clear = (mode === 'offline' && actions.downloadedSearchForm.clearTagOptions) || actions.onlineSearchForm.clearTagOptions;
	const addTag = (mode === 'offline' && actions.downloadedSearchForm.addTag) || actions.onlineSearchForm.addTag;

	const debounced = useDebounce(value, 300);

	const handleChange = async (e: SelectValue): Promise<void> => {
		setValue(e.toString());
	};

	useEffect(() => {
		debounced.length >= 2 && dispatch(load(debounced));
		debounced.length < 2 && dispatch(clear());
	}, [clear, debounced, dispatch, load]);

	const handleSelect = (e: SelectValue): void => {
		const tag = options.find((t: Tag) => t.tag === e.toString());
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
			notFoundContent={isLoadingTags ? <StyledSpin tip='Fetching tags...' /> : null}
			open={open}
		>
			{renderSelectOptions()}
		</Select>
	);
};

export default TagSearch;
