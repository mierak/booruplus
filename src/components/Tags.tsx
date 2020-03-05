import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import styled from 'styled-components';
import { Table, Col } from 'antd';
import { loadTags } from '../../db/database';
import { Tag } from '../../types/gelbooruTypes';
import { State } from '../../store/main';

const { Column } = Table;

interface Props extends PropsFromRedux {
	className?: string;
}

const Container = styled.div`
	height: 100vh;
	padding: 10px;
`;

const Tags: React.FunctionComponent<Props> = (props: Props) => {
	const [tags, setTags] = useState<Tag[]>();

	useEffect(() => {
		const loadTagsFromDb = async (): Promise<void> => {
			const tagsFromDb = await loadTags();
			tagsFromDb && setTags(tagsFromDb);
		};
		loadTagsFromDb();
	}, []);

	const renderActions = (_: unknown, record: Tag): JSX.Element => {
		return (
			<div>
				<a>Online Search</a>
				<span> </span>
				<a style={{ float: 'right' }}>Offline Search</a>
			</div>
		);
	};

	return (
		<Container className={props.className}>
			<Table
				size="small"
				dataSource={tags}
				pagination={false}
				rowKey="id"
				rowClassName={(record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')}
			>
				<Column title="Id" dataIndex="id" width={100} />
				<Column title="Tag" dataIndex="tag" ellipsis filterDropdownVisible={true} />
				<Column title="Type" dataIndex="type" width={100} />
				<Column title="Count" dataIndex="count" width={100} />
				<Column
					title="Ambiguous"
					dataIndex="ambiguous"
					width={100}
					render={(text, record: Tag) => (record.ambiguous == 0 ? 'false' : 'true')}
				/>
				<Column title="Actions" dataIndex="" width={240} render={renderActions} />
			</Table>
		</Container>
	);
};

interface StateFromProps {}

const mapState = (state: State): StateFromProps => ({});

const mapDispatch = {};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Tags);
