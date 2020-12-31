import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Table, Tag as AntTag, Button } from 'antd';

import { AppDispatch, PostsContext, RootState } from '@store/types';
import { Tag } from '@appTypes/gelbooruTypes';
import { actions, thunks } from '@store';
import { getTagColor, sortTagsByType } from '@util/utils';

type Props = {
	tags: string[];
	context: PostsContext | string;
};

const Container = styled.div`
	margin: -16px;
	overflow-y: auto;
	max-height: calc(100vh / 2);
`;

const TagsPopover: React.FunctionComponent<Props> = ({ tags, context }: Props) => {
	const dispatch = useDispatch<AppDispatch>();
	const containerRef = useRef<HTMLDivElement>(null);
	const visible = useSelector((state: RootState) => state.system.isTagsPopoverVisible);
	const [fetchedTags, setFetchedTags] = useState<Tag[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setFetchedTags([]);
	}, [tags]);

	useEffect(() => {
		if (visible && !fetchedTags.length) {
			setLoading(true);
			const fetchTags = async (): Promise<void> => {
				containerRef.current && containerRef.current.scrollTo(0, 0);
				const response = await dispatch(thunks.tags.fetchTags(tags));
				setFetchedTags(sortTagsByType(response));
				setLoading(false);
			};
			fetchTags();
		}
	}, [dispatch, fetchedTags.length, tags, visible]);

	const renderTag = (_text: unknown, tag: Tag): React.ReactNode => {
		return <AntTag color={getTagColor(tag.type)}>{tag.tag}</AntTag>;
	};

	const renderActions = (_: unknown, record: Tag): React.ReactNode => {
		const handleOnlineSearch = async (): Promise<void> => {
			await dispatch(thunks.tags.searchTagOnline(record));
		};

		const handleOfflineSearch = async (): Promise<void> => {
			await dispatch(thunks.tags.searchTagOffline(record));
		};

		const handleAddToCurrent = (): void => {
			dispatch(actions.searchContexts.addTag({ context, data: record }));
		};

		return [
			<Button key='btn-add-tag' type='link' onClick={handleAddToCurrent}>
				Add
			</Button>,
			<Button key='btn-search-tag-online' type='link' onClick={handleOnlineSearch}>
				Online
			</Button>,
			<Button key='btn-search-tag-offline' type='link' onClick={handleOfflineSearch}>
				Offline
			</Button>,
		];
	};

	return (
		<Container ref={containerRef}>
			<Table
				dataSource={loading ? undefined : fetchedTags}
				rowKey='id'
				size='small'
				pagination={false}
				bordered
				loading={loading}
			>
				<Table.Column title='Tag' dataIndex='tag' render={renderTag} />
				<Table.Column title='Search' dataIndex='' render={renderActions} />
			</Table>
		</Container>
	);
};

export default TagsPopover;
