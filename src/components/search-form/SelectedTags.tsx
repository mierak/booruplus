import React from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { Tag as AntTag, Card } from 'antd';

import { RootState } from '../../../store/types';
import { actions } from '../../../store';

import { Tag } from '../../../types/gelbooruTypes';
import { getTagColor } from '../../../util/utils';

const StyledCard = styled(Card)`
	border-color: rgb(217, 217, 217);
`;

const SelectedTags: React.FunctionComponent = () => {
	const dispatch = useDispatch();
	const selectedTags = useSelector((state: RootState) => state.downloadedSearchForm.selectedTags);

	const handleTagClose = (tag: Tag): void => {
		dispatch(actions.downloadedSearchForm.removeTag(tag));
	};

	const renderSelectedTags = (): JSX.Element[] => {
		return selectedTags.map((tag: Tag) => (
			<AntTag
				key={tag.id}
				color={getTagColor(tag)}
				closable
				onClose={(): void => handleTagClose(tag)}
				style={{ marginTop: '4px', marginBottom: '4px' }}
			>
				{tag.tag}
			</AntTag>
		));
	};

	return <StyledCard bodyStyle={{ padding: '11px', minHeight: '48px' }}>{renderSelectedTags()}</StyledCard>;
};

export default SelectedTags;
