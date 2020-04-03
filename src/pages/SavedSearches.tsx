import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Table, Tag, Row, Col, Spin, Card } from 'antd';

import { actions } from '../../store';
import { RootState } from '../../store/types';

import { SavedSearch, Tag as GelbooruTag } from '../../types/gelbooruTypes';
import { LoadingOutlined } from '@ant-design/icons';
import { getTagColor } from '../../util/utils';

const { Column } = Table;

interface Props {
	className?: string;
}

const Container = styled.div`
	height: 100vh;
	padding: 10px;
`;

const StyledTag = styled(Tag)`
	margin-top: 5px;
	margin-bottom: 5px;
`;

const StyledSpin = styled(Spin)`
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(0, -50%);
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
`;

const StyledThumbnailImage = styled.img`
	max-width: 150px;
	max-height: 150px;
`;

const SavedSearches: React.FunctionComponent<Props> = (props: Props) => {
	const dispatch = useDispatch();
	const savedSearches = useSelector((state: RootState) => state.savedSearches.savedSearches);
	const isLoading = useSelector((state: RootState) => state.onlineSearchForm.loading);

	const handleOnlineSearch = (savedSearch: SavedSearch): void => {
		dispatch(actions.savedSearches.searchSavedTagSearchOnline(savedSearch));
	};

	const handleOfflineSearch = (savedSearch: SavedSearch): void => {
		dispatch(actions.savedSearches.searchSavedTagSearchOffline(savedSearch));
	};

	const handleDelete = (savedSearch: SavedSearch): void => {
		dispatch(actions.savedSearches.removeSavedSearch(savedSearch));
	};

	const renderActions = (_: unknown, record: SavedSearch): JSX.Element => {
		return (
			<Row>
				<Col span={8}>
					<a
						onClick={(): void => {
							handleOnlineSearch(record);
						}}
					>
						Online
					</a>
				</Col>
				<Col span={8}>
					<a
						onClick={(): void => {
							handleOfflineSearch(record);
						}}
					>
						Offline
					</a>
				</Col>
				<Col span={8}>
					<a onClick={(): void => handleDelete(record)}>Delete</a>
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
			return <span>{savedSearch.lastSearched.toLocaleString()}</span>;
		} else {
			return <span>Never</span>;
		}
	};

	const renderTable = (): JSX.Element => {
		return (
			<Table
				dataSource={savedSearches}
				rowKey="id"
				pagination={false}
				bordered
				sortDirections={['ascend', 'descend']}
				size="small"
				rowClassName={(record, index): string => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')}
				expandable={{
					rowExpandable: (record: SavedSearch): boolean => record.lastSearched !== undefined
				}}
				expandedRowRender={(record: SavedSearch): JSX.Element => (
					<div style={{ display: 'flex' }}>
						{record.previews.map((objectUrl, index) => {
							return (
								<StyledCard key={index}>
									<StyledThumbnailImage src={objectUrl} />
								</StyledCard>
							);
						})}
					</div>
				)}
			>
				<Column title="Tags" dataIndex="tags" key="tagsCol" render={renderTags} filterDropdownVisible={true} />
				<Column title="Rating" dataIndex="rating" key="ratingCol" />
				<Column title="Last Searched" dataIndex="lastSearched" key="lastSearchedCol" render={renderLastSearched} />
				<Column title="Actions" dataIndex="" key="action" width={220} render={renderActions} />
			</Table>
		);
	};

	const renderSpinner = (): JSX.Element => {
		return <StyledSpin size="large" indicator={<LoadingOutlined style={{ fontSize: '150px' }} />} />;
	};

	return <Container className={props.className}>{isLoading ? renderSpinner() : renderTable()}</Container>;
};

export default SavedSearches;
