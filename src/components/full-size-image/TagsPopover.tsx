import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Table, Tag as AntTag, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { AppDispatch, RootState } from 'store/types';
import { Tag } from 'types/gelbooruTypes';
import { actions, thunks } from 'store/';
import { getTagColor, sortTagsByType } from 'util/utils';

interface Props {
	tags: string[];
}

const Container = styled.div`
	margin: -16px;
	overflow-y: auto;
	max-height: calc(100vh / 2);
`;

const TagsPopover: React.FunctionComponent<Props> = ({ tags }: Props) => {
	const dispatch = useDispatch<AppDispatch>();
	const containerRef = useRef<HTMLDivElement>(null);
	const visible = useSelector((state: RootState) => state.system.isTagsPopoverVisible);
	const [fetchedTags, setFetchedTags] = useState<Tag[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (visible) {
			setLoading(true);
			const fetchTags = async (): Promise<void> => {
				containerRef.current && containerRef.current.scrollTo(0, 0);
				const response = await dispatch(thunks.tags.fetchTags(tags));
				setFetchedTags(sortTagsByType(response));
				setLoading(false);
			};
			fetchTags();
		}
	}, [tags, visible]);

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

		const handleAddOnline = (): void => {
			dispatch(actions.onlineSearchForm.addTag(record));
		};

		const handleAddOffline = (): void => {
			dispatch(actions.downloadedSearchForm.addTag(record));
		};

		return [
			<Button
				type="link"
				key="btn-online-add-tag"
				icon={<PlusOutlined style={{ fontSize: '12px' }} />}
				onClick={handleAddOnline}
				title="Add tag to online search"
			/>,
			<Button key="btn-search-online" type="link" onClick={handleOnlineSearch}>
				Online
			</Button>,
			<Button
				type="link"
				key="btn-offline-add-tag"
				icon={<PlusOutlined style={{ fontSize: '12px' }} />}
				onClick={handleAddOffline}
				title="Add tag to offline search"
			/>,
			<Button key="btn-search-offline" type="link" onClick={handleOfflineSearch}>
				Offline
			</Button>,
		];
	};

	return (
		<Container ref={containerRef}>
			<Table dataSource={fetchedTags} rowKey="id" size="small" pagination={false} bordered loading={loading}>
				<Table.Column title="Tag" dataIndex="tag" render={renderTag} />
				<Table.Column title="Search" dataIndex="" render={renderActions} />
			</Table>
		</Container>
	);
};

export default TagsPopover;
