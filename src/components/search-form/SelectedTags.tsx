import React from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { Tag as AntTag, Card } from 'antd';

import { RootState, SearchMode } from '../../../store/types';
import { actions } from '../../../store';

import { Tag } from '../../../types/gelbooruTypes';
import { getTagColor } from '../../../util/utils';

const StyledCard = styled(Card)`
	border-color: ${(props): string => (props.theme === 'light' ? 'rgb(217, 217, 217);' : '#434343')};

	& > .ant-card-body {
		padding: 11px;
		min-height: 48px;
	}
`;

interface Props {
	mode: SearchMode;
}

const SelectedTags: React.FunctionComponent<Props> = ({ mode }: Props) => {
	const dispatch = useDispatch();

	const theme = useSelector((state: RootState) => state.settings.theme);
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

	return <StyledCard theme={theme}>{renderSelectedTags()}</StyledCard>;
};

export default SelectedTags;
