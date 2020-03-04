import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { State } from '../../store/main';
import styled from 'styled-components';
import { SavedSearch, Tag as GelbooruTag } from '../../types/gelbooruTypes';
import { Table, Tag } from 'antd';
import { getTagColor } from '../../util/utils';

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
	return (
		<Container className={props.className}>
			<Table
				dataSource={props.savedSearches}
				rowKey="id"
				pagination={false}
				bordered
				sortDirections={['ascend', 'descend']}
				// scroll={{ y: 0 }}
				size="small"
				// style={{ height: '100vh' }}
			>
				{/* <Column title="ID" dataIndex="id" key="idCol" /> */}
				{/* <Column title="Type" dataIndex="type" key="typeCol" /> */}
				<Column
					title="Tags"
					dataIndex="tags"
					key="tagsCol"
					render={(tags: GelbooruTag[]): JSX.Element => (
						<span key={`container${tags}`}>
							{tags.map((tag: GelbooruTag, index: number) => (
								<StyledTag key={tag.id + index} color={getTagColor(tag)}>
									{tag.tag}
								</StyledTag>
							))}
						</span>
					)}
				/>
				<Column
					title="Actions"
					dataIndex=""
					key="action"
					width={120}
					render={(): JSX.Element => (
						<div>
							<a>Online Search</a>
							<br />
							<a>Offline Search</a>
							<br />
							<a>Delete</a>
						</div>
					)}
				/>
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

const mapDispatch = {};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(SavedSearches);
