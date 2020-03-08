/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import styled from 'styled-components';
import { Table, Col, Input, Button } from 'antd';
import { loadTags } from '../../db/database';
import { Tag, TagType } from '../../types/gelbooruTypes';
import { SearchOutlined } from '@ant-design/icons';
import { State } from '../../store/main';
import { ColumnFilterItem, FilterDropdownProps } from 'antd/lib/table/interface';
import { capitalize } from '../../util/utils';

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
	const [searchText, setSearchText] = useState<unknown>();
	const [searchedColumn, setSearchedColumn] = useState<string>('');

	useEffect(() => {
		const loadTagsFromDb = async (): Promise<void> => {
			const tagsFromDb = await loadTags();
			tagsFromDb && setTags(tagsFromDb);
		};
		loadTagsFromDb();
	}, []);

	const getFilteredTags = (): void => {};

	const renderActions = (_: unknown, record: Tag): JSX.Element => {
		return (
			<div>
				<a>Online Search</a>
				<span> </span>
				<a style={{ float: 'right' }}>Offline Search</a>
			</div>
		);
	};

	const generateFilterObject = (name: string, value?: unknown): ColumnFilterItem => {
		return {
			text: capitalize(name),
			value: name
		};
	};

	const getTypeFilters = (): ColumnFilterItem[] => {
		return [
			generateFilterObject('artist'),
			generateFilterObject('character'),
			generateFilterObject('copyright'),
			generateFilterObject('metadata'),
			generateFilterObject('tag')
		];
	};

	// const getAmbiguousFilters = (): ColumnFilterItem[] => {
	// 	return [generateFilterObject('true'), generateFilterObject('false')];
	// };

	return (
		<Container className={props.className}>
			<Table
				size="small"
				dataSource={tags}
				pagination={false}
				rowKey="id"
				rowClassName={(record, index): string => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')}
			>
				<Column title="Id" dataIndex="id" width={100} sorter={(a: Tag, b: Tag): number => a.id - b.id} />
				<Column
					title="Tag"
					dataIndex="tag"
					ellipsis
					filterDropdownVisible={true}
					sorter={(a: Tag, b: Tag): number => a.tag.localeCompare(b.tag)}
				/>
				<Column
					title="Type"
					dataIndex="type"
					width={100}
					onFilter={(value: TagType, record: Tag): boolean => record.type === value}
					filters={getTypeFilters()}
				/>
				<Column title="Count" dataIndex="count" width={100} sorter={(a: Tag, b: Tag): number => a.count - b.count} />
				<Column
					title="Ambiguous"
					dataIndex="ambiguous"
					width={100}
					render={(text, record: Tag): string => (record.ambiguous == 0 ? 'false' : 'true')}
					// onFilter={(value: string, record: Tag): boolean => {
					// 	const numericValue = value === 'true' ? 1 : 0;
					// 	console.log(`${record.ambiguous} === ${numericValue} | ${record.ambiguous == numericValue}`);
					// 	return record.ambiguous === numericValue;
					// }}
					// filters={getAmbiguousFilters()}
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
