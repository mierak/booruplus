import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Table, Card, Tag as AntTag } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

import { actions, thunks } from '@store';
import { TagHistory, AppDispatch, RootState } from '@store/types';

import { getTagColor } from '@util/utils';

type Props = {
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

const maxTagLength = 25;

const TagStatistic: React.FunctionComponent<Props> = ({ className, type, title }: Props) => {
	const dispatch = useDispatch<AppDispatch>();

	const settings = useSelector((state: RootState) => state.settings.dashboard);
	const dataSource = useSelector((state: RootState) =>
		type === 'most-searched' ? state.dashboard.mostSearchedTags : state.dashboard.mostFavoritedTags
	);
	const isLoading = useSelector((state: RootState) =>
		type === 'most-searched' ? state.loadingStates.isMostSearchedTagsLoading : state.loadingStates.isMostFavoritedTagsLoading
	);

	const handleReload = (): void => {
		if (type === 'most-favorited') {
			dispatch(thunks.dashboard.fetchMostFavoritedTags(100));
		} else {
			dispatch(thunks.dashboard.fetchMostSearchedTags());
		}
	};

	useEffect(() => {
		if (dataSource.length === 0) {
			if (type === 'most-favorited') {
				settings.loadMostFavoritedTags && dispatch(thunks.dashboard.fetchMostFavoritedTags());
			} else {
				settings.loadMostSearchedTags && dispatch(thunks.dashboard.fetchMostSearchedTags());
			}
		}
	}, [dataSource.length, dispatch, settings.loadMostFavoritedTags, settings.loadMostSearchedTags, type]);

	const renderActions = (_: unknown, record: TagHistory): React.ReactNode => {
		return (
			<div>
				<a
					onClick={(): void => {
						dispatch(actions.onlineSearchForm.setSelectedTags([record.tag]));
						dispatch(thunks.onlineSearchForm.fetchPosts());
						dispatch(actions.system.setActiveView('search-results'));
					}}
				>
					Online
				</a>
				<span> </span>
				<a
					onClick={(): void => {
						dispatch(actions.downloadedSearchForm.setSelectedTags([record.tag]));
						dispatch(thunks.downloadedSearchForm.fetchPosts());
						dispatch(actions.system.setActiveView('search-results'));
					}}
					style={{ float: 'right' }}
				>
					Offline
				</a>
			</div>
		);
	};

	const renderTag = (_text: unknown, record: TagHistory): React.ReactNode => {
		const tagName = record.tag.tag.length <= maxTagLength ? record.tag.tag : `${record.tag.tag.substr(0, maxTagLength)}...`;
		return <AntTag color={getTagColor(record.tag.type)}>{tagName}</AntTag>;
	};

	return (
		<StyledListCard title={title} size='small' className={className} extra={<ReloadOutlined onClick={handleReload} title='Reload' />}>
			<Table
				dataSource={!isLoading ? dataSource : undefined}
				size='small'
				pagination={false}
				rowKey={(el): string => el.tag?.id.toString() ?? ''}
				loading={isLoading}
			>
				<Table.Column title='Tag' dataIndex='tag' render={renderTag} />
				<Table.Column title='Count' dataIndex='count' />
				<Table.Column title='Search' dataIndex='' render={renderActions} width={120} />
			</Table>
		</StyledListCard>
	);
};

export default TagStatistic;
