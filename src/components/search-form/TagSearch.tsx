import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { SelectValue } from 'antd/lib/select';
import { Select, Spin } from 'antd';

import { actions, thunks } from '@store';
import { PostsContext, RootState } from '@store/types';

import { Tag } from '@appTypes/gelbooruTypes';
import { useDebounce } from '@hooks/useDebounce';
import TagSelectOption from '@components/search-form/TagSelectOption';

type Props = {
	context: PostsContext | string;
	open?: boolean;
};

const StyledSpin = styled(Spin)`
	margin: 50px 100px 50px auto;
	width: 465px;
`;

const TagSearch: React.FunctionComponent<Props> = ({ open, context }: Props) => {
	const dispatch = useDispatch();

	const [selectValue] = useState('');
	const [value, setValue] = useState('');
	const isLoadingTags = useSelector((state: RootState) => state.system.isTagOptionsLoading);

	const options = useSelector((state: RootState): Tag[] => state.searchContexts[context].tagOptions);

	const load = useSelector((state: RootState) => {
		const mode = state.searchContexts[context].mode;
		if (mode === 'online') {
			return thunks.onlineSearches.getTagsByPatternFromApi;
		} else {
			return thunks.offlineSearches.loadTagsByPattern;
		}
	});
	const clear = actions.searchContexts.clearTagOptions;
	const addTag = actions.searchContexts.addTag;

	const debounced = useDebounce(value, 300);

	const handleChange = async (e: SelectValue): Promise<void> => {
		setValue(e.toString());
	};

	useEffect(() => {
		debounced.length >= 2 && dispatch(load({ context, pattern: debounced }));
		debounced.length < 2 && dispatch(clear({ context }));
	}, [clear, context, debounced, dispatch, load]);

	const handleSelect = (e: SelectValue): void => {
		const tag = options.find((t: Tag) => t.tag === e.toString());
		tag && dispatch(addTag({ context, data: tag }));
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
			autoFocus
		>
			{renderSelectOptions()}
		</Select>
	);
};

export default TagSearch;
