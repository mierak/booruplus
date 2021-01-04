import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { unwrapResult } from '@reduxjs/toolkit';
import styled from 'styled-components';
import { Table, Tag, Row, Col, Card, Popconfirm, Tooltip, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

import { actions, thunks } from '@store';
import { RootState, AppDispatch, SearchContext } from '@store/types';
import { SavedSearch, Tag as GelbooruTag } from '@appTypes/gelbooruTypes';
import { getTagColor } from '@util/utils';
import moment from 'moment';
import { openNotificationWithIcon } from '@appTypes/components';
import { initPostsContext } from '../store/commonActions';

const { Column } = Table;

type Props = {
	className?: string;
};

const Container = styled.div`
	height: 100vh;
	padding: 10px;
	overflow-x: 'hidden';
	overflow-y: auto;
`;

const StyledTag = styled(Tag)`
	margin-top: 5px;
	margin-bottom: 5px;
`;

const StyledCard = styled(Card)`
	max-width: 170px;
	max-height: 170px;
	margin-right: 10px;

	&& > .ant-card-body {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		align-content: center;
		padding: 10px;
	}

	&& > .ant-card-actions > li {
		margin: 0;
	}
`;

const StyledPreviewImage = styled.img`
	cursor: pointer;
	max-width: 150px;
	max-height: 150px;
`;

const StyledPreviewsContainer = styled.div`
	display: grid;
	grid-row-gap: 10px;
	grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
	grid-auto-rows: 194px;
`;

const SavedSearches: React.FunctionComponent<Props> = (props: Props) => {
	const dispatch = useDispatch<AppDispatch>();
	const savedSearches = useSelector((state: RootState) => state.savedSearches.savedSearches);

	useEffect(() => {
		dispatch(thunks.savedSearches.loadSavedSearchesFromDb());
	}, [dispatch]);

	const handleOnlineSearch = (savedSearch: SavedSearch): void => {
		dispatch(thunks.savedSearches.searchOnline(savedSearch));
	};

	const handleOfflineSearch = (savedSearch: SavedSearch): void => {
		dispatch(thunks.savedSearches.searchOffline(savedSearch));
	};

	const handleDelete = async (savedSearch: SavedSearch): Promise<void> => {
		await dispatch(thunks.savedSearches.remove(savedSearch));
		openNotificationWithIcon(
			'success',
			'Saved Search deleted',
			'Saved Search was successfuly deleted from the database.'
		);
	};

	const handlePreviewDelete = (record: SavedSearch, previewId: number): void => {
		dispatch(thunks.savedSearches.removePreview({ savedSearch: record, previewId }));
	};

	const renderActions = (_: unknown, record: SavedSearch): JSX.Element => {
		return (
			<Row>
				<Col span={8}>
					<Button
						type='link'
						onClick={(): void => {
							handleOnlineSearch(record);
						}}
					>
						Online
					</Button>
				</Col>
				<Col span={8}>
					<Button
						type='link'
						onClick={(): void => {
							handleOfflineSearch(record);
						}}
					>
						Offline
					</Button>
				</Col>
				<Col span={8}>
					<Popconfirm
						title='Are you sure you want to delete this Saved Search?'
						okText='Cancel'
						cancelText='Delete'
						okType='default'
						cancelButtonProps={{ type: 'primary' }}
						onCancel={(): void => {
							handleDelete(record);
						}}
					>
						<Button type='link'>Delete</Button>
					</Popconfirm>
				</Col>
			</Row>
		);
	};

	const renderTags = (tags: GelbooruTag[]): JSX.Element => (
		<span key={`container${tags}`}>
			{tags.map((tag: GelbooruTag, index: number) => (
				<StyledTag key={tag.id + index} color={getTagColor(tag)}>
					{tag.tag}
				</StyledTag>
			))}
		</span>
	);

	const renderLastSearched = (_: unknown, savedSearch: SavedSearch): JSX.Element => {
		if (savedSearch.lastSearched) {
			return <span>{moment(savedSearch.lastSearched).format('LL HH:mm:ss')}</span>;
		} else {
			return <span>Never</span>;
		}
	};

	const renderPreviewActions = (record: SavedSearch, id: number): JSX.Element[] => {
		return [
			<Popconfirm
				data-testid='button-delete-preview'
				title='Delete preview from Saved Search?'
				okText='Delete'
				cancelText='Cancel'
				key='delete'
				onConfirm={(): void => handlePreviewDelete(record, id)}
			>
				<Tooltip title='Delete preview' destroyTooltipOnHide>
					<DeleteOutlined />
				</Tooltip>
			</Popconfirm>,
		];
	};

	const onPreviewClick = async (record: SavedSearch, postId: number): Promise<void> => {
		const postIds = record.previews.map((preview) => preview.postId);
		const index = postIds.findIndex((id) => id === postId);
		if (index >= 0) {
			const context = unwrapResult(await dispatch(thunks.searchContexts.generateSearchContext()));
			const data: Partial<SearchContext> = {
				mode: 'other',
				selectedTags: record.tags,
				excludedTags: record.excludedTags,
				rating: record.rating,
			};
			dispatch(initPostsContext({ context, data }));
			dispatch(actions.searchContexts.updateContext({ data: { selectedIndex: index }, context }));
			dispatch(thunks.posts.fetchPostsByIds({ context, ids: postIds }));
		}
	};

	const renderPreviews = (record: SavedSearch): JSX.Element => {
		return (
			<StyledPreviewsContainer>
				{record.previews.map((preview) => {
					return (
						<StyledCard key={preview.id} actions={renderPreviewActions(record, preview.id)}>
							<StyledPreviewImage
								src={preview.objectUrl}
								data-testid='preview-image'
								onClick={(): Promise<void> => onPreviewClick(record, preview.postId)}
							/>
						</StyledCard>
					);
				})}
			</StyledPreviewsContainer>
		);
	};

	const renderTable = (): JSX.Element => {
		return (
			<Table
				dataSource={savedSearches}
				rowKey='id'
				pagination={false}
				bordered
				sortDirections={['ascend', 'descend']}
				size='small'
				rowClassName={(_, index): string => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')}
				expandable={{
					rowExpandable: (record: SavedSearch): boolean => record.previews.length > 0,
					expandedRowRender: renderPreviews,
				}}
				style={{ overflowX: 'hidden' }}
			>
				<Column title='Tags' dataIndex='tags' key='tagsCol' render={renderTags} filterDropdownVisible={true} />
				<Column
					title='Excluded Tags'
					dataIndex='excludedTags'
					key='excludedTagsCol'
					render={renderTags}
					filterDropdownVisible={true}
				/>
				<Column title='Rating' dataIndex='rating' key='ratingCol' />
				<Column title='Last Searched' dataIndex='lastSearched' key='lastSearchedCol' render={renderLastSearched} />
				<Column title='Actions' dataIndex='' key='action' width={220} render={renderActions} />
			</Table>
		);
	};

	return <Container className={props.className}>{renderTable()}</Container>;
};

export default SavedSearches;
