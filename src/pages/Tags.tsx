import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { ColumnFilterItem } from 'antd/lib/table/interface';
import { Table, Tag as AntTag } from 'antd';

import { thunks } from '../../store';
import { RootState, AppDispatch } from '../../store/types';

import { Tag, TagType } from '../../types/gelbooruTypes';
import { capitalize, getTagColor } from '../../util/utils';
import { unwrapResult } from '@reduxjs/toolkit';

const { Column } = Table;

interface Props {
	className?: string;
}

const Container = styled.div`
	height: 100vh;
	padding: 10px;
`;

const Tags: React.FunctionComponent<Props> = (props: Props) => {
	const dispatch = useDispatch<AppDispatch>();

	const tags = useSelector((state: RootState) => state.tags.tags);
	const tagsLoading = useSelector((state: RootState) => state.system.isTagTableLoading);

	const [tagsCount, setTagsCount] = useState(0);
	const tagsPerPage = 19;
	// const [searchText, setSearchText] = useState<unknown>();
	// const [searchedColumn, setSearchedColumn] = useState<string>('');

	useEffect(() => {
		// dispatch(loadAllTagsFromDb());
		dispatch(thunks.tags.getCount())
			.then(unwrapResult)
			.then((result) => setTagsCount(result));
		dispatch(thunks.tags.loadAllWithLimitAndOffset({ limit: tagsPerPage, offset: 0 }));
		console.log('hue');
	}, []);

	const handleChangePage = (page: number): void => {
		dispatch(thunks.tags.loadAllWithLimitAndOffset({ limit: tagsPerPage, offset: (page - 1) * tagsPerPage }));
	};

	// const getFilteredTags = (): void => {};

	const handleOnlineSearch = (tag: Tag): void => {
		dispatch(thunks.tags.searchTagOnline(tag));
	};

	const handleOfflineSearch = (tag: Tag): void => {
		dispatch(thunks.tags.searchTagOffline(tag));
	};

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const renderActions = (_: unknown, record: Tag): JSX.Element => {
		return (
			<div>
				<a
					onClick={(): void => {
						handleOnlineSearch(record);
					}}
				>
					Online Search
				</a>
				<span> </span>
				<a
					onClick={(): void => {
						handleOfflineSearch(record);
					}}
					style={{ float: 'right' }}
				>
					Offline Search
				</a>
			</div>
		);
	};

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const generateFilterObject = (name: string, _value?: unknown): ColumnFilterItem => {
		return {
			text: capitalize(name),
			value: name,
		};
	};

	const getTypeFilters = (): ColumnFilterItem[] => {
		return [
			generateFilterObject('artist'),
			generateFilterObject('character'),
			generateFilterObject('copyright'),
			generateFilterObject('metadata'),
			generateFilterObject('tag'),
		];
	};

	const renderTag = (_text: unknown, tag: Tag): JSX.Element => {
		return <AntTag color={getTagColor(tag.type)}>{capitalize(tag.type)}</AntTag>;
	};

	// const getAmbiguousFilters = (): ColumnFilterItem[] => {
	// 	return [generateFilterObject('true'), generateFilterObject('false')];
	// };

	return (
		<Container className={props.className}>
			<Table
				size="small"
				dataSource={tags}
				pagination={{
					pageSize: tagsPerPage,
					total: tagsCount,
					onChange: handleChangePage,
				}}
				loading={tagsLoading}
				rowKey="id"
				rowClassName={(_record, index): string => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')}
			>
				<Column title="Id" dataIndex="id" width={100} /*sorter={(a: Tag, b: Tag): number => a.id - b.id} */ />
				<Column
					title="Tag"
					dataIndex="tag"
					ellipsis
					// filterDropdownVisible={true}
					// sorter={(a: Tag, b: Tag): number => a.tag.localeCompare(b.tag)}
				/>
				<Column
					title="Type"
					dataIndex="type"
					width={100}
					onFilter={(value: TagType | string | number | boolean, record: Tag): boolean => record.type === value}
					//filters={getTypeFilters()}
					render={renderTag}
				/>
				<Column title="Count" dataIndex="count" width={100} /*sorter={(a: Tag, b: Tag): number => a.count - b.count}*/ />
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
					/*sorter={(a: Tag, b: Tag): number => {
						if (a.favoriteCount !== undefined && b.favoriteCount !== undefined) {
							return a.favoriteCount - b.favoriteCount;
						} else {
							return 0;
						}
					}}*/
				/>
				<Column
					title="Blacklisted Count"
					dataIndex="blacklistedCount"
					/*sorter={(a: Tag, b: Tag): number => {
						if (a.blacklistedCount !== undefined && b.blacklistedCount !== undefined) {
							return a.blacklistedCount - b.blacklistedCount;
						} else {
							return 0;
						}
					}}*/
				/>
				<Column
					title="Downloaded Count"
					dataIndex="downloadedCount"
					/*sorter={(a: Tag, b: Tag): number => {
						if (a.downloadedCount !== undefined && b.downloadedCount !== undefined) {
							return a.downloadedCount - b.downloadedCount;
						} else {
							return 0;
						}
					}}*/
				/>
				<Column title="Actions" dataIndex="" width={240} render={renderActions} />
			</Table>
		</Container>
	);
};

export default Tags;
