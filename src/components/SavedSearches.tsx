import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { State } from '../../store/main';
import styled from 'styled-components';
import { SavedSearch, Tag as GelbooruTag } from '../../types/gelbooruTypes';
import { Table, Tag } from 'antd';
import { getTagColor } from '../../util/utils';
import { getPostsForTags } from '../../service/apiService';
import { setActiveView } from '../../store/system';
import { setActivePost, setPosts } from '../../store/posts';
import { removeSavedSearch } from '../../store/savedSearches';
import { deleteSavedSearch } from '../../db/database';

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

const SavedSearches: React.FunctionComponent<Props> = (props: Props) => {
	const handleSubmit = async (savedSearch: SavedSearch): Promise<void> => {
		const searchString = savedSearch.tags.map((tag: GelbooruTag) => tag.tag);
		const posts = await getPostsForTags(searchString);
		props.setActiveView('thumbnails');
		props.setActivePost(undefined);
		props.setPosts(posts);
	};

	const handleDelete = (savedSearch: SavedSearch): void => {
		props.removeSavedSearch(savedSearch);
		deleteSavedSearch(savedSearch);
	};

	const renderActions = (_: unknown, record: SavedSearch): JSX.Element => {
		return (
			<div>
				<a
					onClick={(): void => {
						handleSubmit(record);
					}}
				>
					Online Search
				</a>
				<br />
				<a>Offline Search</a>
				<br />
				<a onClick={(): void => handleDelete(record)}>Delete</a>
			</div>
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

	return (
		<Container className={props.className}>
			<Table dataSource={props.savedSearches} rowKey="id" pagination={false} bordered sortDirections={['ascend', 'descend']} size="small">
				<Column title="Tags" dataIndex="tags" key="tagsCol" render={renderTags} />
				<Column title="Actions" dataIndex="" key="action" width={120} render={renderActions} />
			</Table>
		</Container>
	);
};

interface StateFromProps {
	savedSearches: SavedSearch[];
}

const mapState = (state: State): StateFromProps => ({
	savedSearches: state.savedSearches.savedSearches
});

const mapDispatch = {
	setActivePost,
	setActiveView,
	setPosts,
	removeSavedSearch
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(SavedSearches);
