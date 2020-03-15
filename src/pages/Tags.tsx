import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Table } from 'antd';
import { loadTags, getFavoritePostCountForTag, getBlacklistedPostCountForTag, getDownloadedPostCountForTag } from '../../db';
import { Tag, TagType } from '../../types/gelbooruTypes';
import { ColumnFilterItem } from 'antd/lib/table/interface';
import { capitalize } from '../../util/utils';

const { Column } = Table;

interface Props {
	className?: string;
}

const Container = styled.div`
	height: 100vh;
	padding: 10px;
`;

const Tags: React.FunctionComponent<Props> = (props: Props) => {
	const [tags, setTags] = useState<Tag[]>();
	// const [searchText, setSearchText] = useState<unknown>();
	// const [searchedColumn, setSearchedColumn] = useState<string>('');

	useEffect(() => {
		//TODO Thunk it
		const loadTagsFromDb = async (): Promise<void> => {
			const tagsFromDb = await loadTags();
			if (tagsFromDb) {
				console.time('fetch');
				const tags = await Promise.all(
					tagsFromDb.map(async (tag) => {
						const favoriteCount = await getFavoritePostCountForTag(tag.tag);
						const blacklistedCount = await getBlacklistedPostCountForTag(tag.tag);
						const downloadedCount = await getDownloadedPostCountForTag(tag.tag);
						tag.favoriteCount = favoriteCount;
						tag.blacklistedCount = blacklistedCount;
						tag.downloadedCount = downloadedCount;
						return tag;
					})
				);
				console.timeEnd('fetch');
				setTags(tags);
			}
		};
		loadTagsFromDb();
	}, []);

	// const getFilteredTags = (): void => {};

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const renderActions = (_: unknown, _record: Tag): JSX.Element => {
		return (
			<div>
				<a>Online Search</a>
				<span> </span>
				<a style={{ float: 'right' }}>Offline Search</a>
			</div>
		);
	};

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const generateFilterObject = (name: string, _value?: unknown): ColumnFilterItem => {
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
				// pagination={false}
				rowKey="id"
				rowClassName={(_record, index): string => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')}
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
					render={(_text, record: Tag): string => (record.ambiguous == 0 ? 'false' : 'true')}
					// onFilter={(value: string, record: Tag): boolean => {
					// 	const numericValue = value === 'true' ? 1 : 0;
					// 	console.log(`${record.ambiguous} === ${numericValue} | ${record.ambiguous == numericValue}`);
					// 	return record.ambiguous === numericValue;
					// }}
					// filters={getAmbiguousFilters()}
				/>
				<Column
					title="Favorites Count"
					dataIndex="favoriteCount"
					sorter={(a: Tag, b: Tag): number => {
						if (a.favoriteCount !== undefined && b.favoriteCount !== undefined) {
							return a.favoriteCount - b.favoriteCount;
						} else {
							return 0;
						}
					}}
				/>
				<Column
					title="Blacklisted Count"
					dataIndex="blacklistedCount"
					sorter={(a: Tag, b: Tag): number => {
						if (a.blacklistedCount !== undefined && b.blacklistedCount !== undefined) {
							return a.blacklistedCount - b.blacklistedCount;
						} else {
							return 0;
						}
					}}
				/>
				<Column
					title="Downloaded Count"
					dataIndex="downloadedCount"
					sorter={(a: Tag, b: Tag): number => {
						if (a.downloadedCount !== undefined && b.downloadedCount !== undefined) {
							return a.downloadedCount - b.downloadedCount;
						} else {
							return 0;
						}
					}}
				/>
				<Column title="Actions" dataIndex="" width={240} render={renderActions} />
			</Table>
		</Container>
	);
};

export default Tags;
