import React from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { Tag as AntTag, Card } from 'antd';

import { PostsContext, RootState } from '@store/types';
import { actions } from '@store';

import { Tag } from '@appTypes/gelbooruTypes';
import { getTagColor } from '@util/utils';

const StyledCard = styled(Card)`
	border-color: ${(props): string => (props.theme === 'light' ? 'rgb(217, 217, 217);' : '#434343')};

	& > .ant-card-body {
		padding: 11px;
		min-height: 52px;
	}
`;

type Props = {
	context: PostsContext | string;
};

const ExcludedTags: React.FunctionComponent<Props> = ({ context }: Props) => {
	const dispatch = useDispatch();

	const theme = useSelector((state: RootState) => state.settings.theme);
	const excludededTags = useSelector((state: RootState) => state.searchContexts[context].excludedTags);

	const handleTagClose = (tag: Tag): void => {
		dispatch(actions.searchContexts.removeExcludedTag({ context, data: tag }));
	};

	const handleDragStart = (event: React.DragEvent, tag: Tag): void => {
		event.dataTransfer?.setData('tag', JSON.stringify(tag));
	};

	const handleDrop = (event: React.DragEvent): void => {
		const tag: Tag = JSON.parse(event.dataTransfer.getData('tag'));
		if (!excludededTags.some((t) => t.id === tag.id)) {
			dispatch(actions.searchContexts.addExcludedTag({ context, data: tag }));
		}
		dispatch(actions.searchContexts.removeTag({ context, data: tag }));
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
		<StyledCard theme={theme} onDrop={handleDrop} onDragOver={allowDrop} data-testid='excluded-tags-container'>
			{renderExcludedTags()}
		</StyledCard>
	);
};

export default ExcludedTags;
