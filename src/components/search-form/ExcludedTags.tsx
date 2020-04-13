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
		min-height: 52px;
	}
`;

interface Props {
	mode: SearchMode;
}

const ExcludedTags: React.FunctionComponent<Props> = ({ mode }: Props) => {
	const dispatch = useDispatch();

	const theme = useSelector((state: RootState) => state.settings.theme);
	const excludededTags = useSelector(
		(state: RootState) => (mode === 'offline' && state.downloadedSearchForm.excludededTags) || state.onlineSearchForm.excludededTags
	);

	const handleTagClose = (tag: Tag): void => {
		const removeTag = (mode === 'offline' && actions.downloadedSearchForm.removeExcludedTag) || actions.onlineSearchForm.removeExcludedTag;
		dispatch(removeTag(tag));
	};

	const handleDragStart = (event: React.DragEvent, tag: Tag): void => {
		event.dataTransfer?.setData('tag', JSON.stringify(tag));
	};

	const handleDrop = (event: React.DragEvent): void => {
		const tag: Tag = JSON.parse(event.dataTransfer.getData('tag'));
		const removeTag = (mode === 'offline' && actions.downloadedSearchForm.removeTag) || actions.onlineSearchForm.removeTag;
		const addExcludedTag = (mode === 'offline' && actions.downloadedSearchForm.addExcludedTag) || actions.onlineSearchForm.addExcludedTag;
		dispatch(addExcludedTag(tag));
		dispatch(removeTag(tag));
	};

	const allowDrop = (event: React.DragEvent): void => {
		event.preventDefault();
	};

	const renderExcludedTags = (): JSX.Element[] => {
		return excludededTags.map((tag: Tag) => (
			<AntTag
				key={tag.id}
				color={getTagColor(tag)}
				closable
				onClose={(): void => handleTagClose(tag)}
				style={{ marginTop: '4px', marginBottom: '4px' }}
				draggable={true}
				onDragStart={(event: React.DragEvent): void => handleDragStart(event, tag)}
			>
				{tag.tag}
			</AntTag>
		));
	};

	return (
		<StyledCard theme={theme} onDrop={handleDrop} onDragOver={allowDrop}>
			{renderExcludedTags()}
		</StyledCard>
	);
};

export default ExcludedTags;