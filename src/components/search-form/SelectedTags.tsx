import React from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { Tag as AntTag, Card } from 'antd';

import { RootState, SearchMode } from '../../../store/types';
import { actions } from '../../../store';

import { Tag } from '../../../types/gelbooruTypes';
import { getTagColor } from '../../../util/utils';

const StyledCard = styled(Card)`
	border-color: rgb(217, 217, 217);
`;

interface Props {
	mode: SearchMode;
}

const SelectedTags: React.FunctionComponent<Props> = ({ mode }: Props) => {
	const dispatch = useDispatch();

	const selectedTags = useSelector(
		(state: RootState) => (mode === 'offline' && state.downloadedSearchForm.selectedTags) || state.onlineSearchForm.selectedTags
	);

	const handleTagClose = (tag: Tag): void => {
		const removeTag = (mode === 'offline' && actions.downloadedSearchForm.removeTag) || actions.onlineSearchForm.removeTag;
		dispatch(removeTag(tag));
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
