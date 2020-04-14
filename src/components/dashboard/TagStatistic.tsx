import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Table, Card, Tag as AntTag } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

import { actions } from 'store/';
import { TagHistory, AppDispatch, RootState } from 'store/types';

import { getTagColor } from 'util/utils';

interface Props {
	className?: string;
	type: 'most-searched' | 'most-favorited';
	title: string;
}

const StyledListCard = styled(Card)`
	height: 273px;

	&& > .ant-card-head {
		margin-bottom: 1px;
	}

	& > .ant-card-body {
		overflow: auto;
		max-height: 231px;
		padding-top: 0px;
		padding-bottom: 0;
	}
`;

const TagStatistic: React.FunctionComponent<Props> = ({ className, type, title }: Props) => {
	const dispatch = useDispatch<AppDispatch>();

	const dataSource = useSelector((state: RootState) =>
		type === 'most-searched' ? state.dashboard.mostSearchedTags : state.dashboard.mostFavoritedTags
	);
	const isLoading = useSelector((state: RootState) =>
		type === 'most-searched' ? state.loadingStates.isMostSearchedTagsLoading : state.loadingStates.isMostFavoritedTagsLoading
	);

	const handleReload = (): void => {
		if (type === 'most-favorited') {
			dispatch(actions.dashboard.fetchMostFavoritedTags());
		} else {
			dispatch(actions.dashboard.fetchMostSearchedTags());
		}
	};

	useEffect(() => {
		if (dataSource.length === 0) {
			if (type === 'most-favorited') {
				dispatch(actions.dashboard.fetchMostFavoritedTags());
			} else {
				dispatch(actions.dashboard.fetchMostSearchedTags());
			}
		}
	}, []);

	const renderActions = (_: unknown, record: TagHistory): React.ReactNode => {
		return (
			<div>
				<a
					onClick={(): void => {
						dispatch(actions.onlineSearchForm.setSelectedTags([record.tag]));
						dispatch(actions.onlineSearchForm.fetchPosts());
						dispatch(actions.system.setActiveView('thumbnails'));
					}}
				>
					Online
				</a>
				<span> </span>
				<a
					onClick={(): void => {
						dispatch(actions.downloadedSearchForm.setSelectedTags([record.tag]));
						dispatch(actions.downloadedSearchForm.fetchPosts());
						dispatch(actions.system.setActiveView('thumbnails'));
					}}
					style={{ float: 'right' }}
				>
					Offline
				</a>
			</div>
		);
	};

	const renderTag = (_text: unknown, mostSearchedTag: TagHistory): React.ReactNode => {
		return <AntTag color={getTagColor(mostSearchedTag.tag.type)}>{mostSearchedTag.tag.tag}</AntTag>;
	};

	return (
		<StyledListCard title={title} size="small" className={className} extra={<ReloadOutlined onClick={handleReload} title="Reload" />}>
			<Table dataSource={dataSource} size="small" pagination={false} rowKey="tag" loading={isLoading}>
				<Table.Column title="Tag" dataIndex="tag" render={renderTag} />
				<Table.Column title="Count" dataIndex="count" />
				<Table.Column title="Search" dataIndex="" render={renderActions} width={120} />
			</Table>
		</StyledListCard>
	);
};

export default TagStatistic;
