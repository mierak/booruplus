/* eslint-disable react/prop-types */
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { State } from '../../store/main';
import styled from 'styled-components';
import { SavedSearch, Tag as GelbooruTag } from '../../types/gelbooruTypes';
import { Table, Tag, Row, Col, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { getTagColor } from '../../util/utils';
import { getPostsForTags } from '../../service/apiService';
import { setActiveView } from '../../store/system';
import { setActivePostIndex, setPosts } from '../../store/posts';
import { removeSavedSearch } from '../../store/savedSearches';
import { setLoading, setSelectedTags } from '../../store/searchForm';
import { deleteSavedSearch, saveSearch } from '../../db/database';

const { Column } = Table;

interface Props extends PropsFromRedux {
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

const SavedSearches: React.FunctionComponent<Props> = (props: Props) => {
	const handleOnlineSearch = async (savedSearch: SavedSearch): Promise<void> => {
		props.setLoading(true);
		const searchString = savedSearch.tags.map((tag: GelbooruTag) => tag.tag);
		props.setSelectedTags(savedSearch.tags);
		const posts = await getPostsForTags(searchString, { rating: savedSearch.rating });
		props.setActivePostIndex(undefined);
		props.setPosts(posts);
		savedSearch.lastSearched = new Date();
		saveSearch(savedSearch);
		props.setLoading(false);
		props.setActiveView('thumbnails');
	};

	const handleDelete = (savedSearch: SavedSearch): void => {
		props.removeSavedSearch(savedSearch);
		deleteSavedSearch(savedSearch);
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
					<a>Offline</a>
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
				dataSource={props.savedSearches}
				rowKey="id"
				pagination={false}
				bordered
				sortDirections={['ascend', 'descend']}
				size="small"
				rowClassName={(record, index): string => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')}
				expandable={{
					rowExpandable: (record: SavedSearch) => record.lastSearched !== undefined
				}}
				expandedRowRender={(record: SavedSearch): JSX.Element => <span>EXPANDED {record.id}</span>}
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

	return <Container className={props.className}>{props.isLoading ? renderSpinner() : renderTable()}</Container>;
};

interface StateFromProps {
	savedSearches: SavedSearch[];
	isLoading: boolean;
}

const mapState = (state: State): StateFromProps => ({
	savedSearches: state.savedSearches.savedSearches,
	isLoading: state.searchForm.loading
});

const mapDispatch = {
	setActivePostIndex,
	setActiveView,
	setPosts,
	removeSavedSearch,
	setLoading,
	setSelectedTags
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(SavedSearches);
