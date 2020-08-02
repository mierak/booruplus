import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { FilterDropdownProps, TablePaginationConfig } from 'antd/lib/table/interface';
import { SearchOutlined } from '@ant-design/icons';
import { Table, Tag as AntTag, Space, Button } from 'antd';

import { thunks } from '../store';
import { RootState, AppDispatch } from '../store/types';

import { Tag, TagType } from '../types/gelbooruTypes';
import { capitalize, getTagColor } from '../util/utils';
import { unwrapResult } from '@reduxjs/toolkit';
import TagSearchFilter from '../components/tags/TagSearchFilter';
import TypeSearchFilter from '../components/tags/TypeSearchFilter';

const { Column } = Table;

interface Props {
	className?: string;
	tagsPerPage?: number;
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
	const [pattern, setPattern] = useState('');
	const [selectedTypes, setSelectedTypes] = useState<TagType[]>(['artist', 'character', 'copyright', 'metadata', 'tag']);
	const [page, setPage] = useState<number>(1);
	const tagsPerPage = props.tagsPerPage ?? 16;

	useEffect(() => {
		dispatch(thunks.tags.getCount())
			.then(unwrapResult)
			.then((result) => setTagsCount(result));
		dispatch(thunks.tags.loadAllWithLimitAndOffset({ limit: tagsPerPage, offset: 0 }));
	}, [dispatch, tagsPerPage]);

	useEffect(() => {
		setPage(1);
		dispatch(thunks.tags.getCount({ pattern, types: selectedTypes }))
			.then(unwrapResult)
			.then((result) => setTagsCount(result));
		dispatch(thunks.tags.loadAllWithLimitAndOffset({ limit: tagsPerPage, offset: 0, pattern, types: selectedTypes }));
	}, [dispatch, pattern, selectedTypes, tagsPerPage]);

	const handleChangePage = (p: number): void => {
		setPage(p);
		dispatch(thunks.tags.loadAllWithLimitAndOffset({ limit: tagsPerPage, offset: (p - 1) * tagsPerPage, pattern, types: selectedTypes }));
	};

	const handleOnlineSearch = (tag: Tag): void => {
		dispatch(thunks.tags.searchTagOnline(tag));
	};

	const handleOfflineSearch = (tag: Tag): void => {
		dispatch(thunks.tags.searchTagOffline(tag));
	};

	const tagSearchFilterOnSearch = (pattern: string): void => {
		setPattern(pattern);
	};

	const renderTagSearchFilterDropdown = (dropdownProps: FilterDropdownProps): React.ReactNode => {
		return <TagSearchFilter onSearch={tagSearchFilterOnSearch} confirm={dropdownProps.confirm} visible={dropdownProps.visible} />;
	};

	const typeSearchFilterOnSearch = (types: TagType[]): void => {
		setSelectedTypes(types);
	};

	const renderTypeSearchFilterDropdown = (dropdownProps: FilterDropdownProps): React.ReactNode => {
		return <TypeSearchFilter onSearch={typeSearchFilterOnSearch} confirm={dropdownProps.confirm} visible={true} />;
	};

	const getPaginationProps = (): TablePaginationConfig => {
		return {
			pageSize: tagsPerPage,
			total: tagsCount,
			onChange: handleChangePage,
			current: page,
			showSizeChanger: false,
		};
	};

	const renderActions = (_: unknown, record: Tag): JSX.Element => {
		const handleOnline = (): void => {
			handleOnlineSearch(record);
		};

		const handleOffline = (): void => {
			handleOfflineSearch(record);
		};

		return (
			<Space>
				<Button type='link' onClick={handleOnline}>
					Online Search
				</Button>
				<Button type='link' onClick={handleOffline}>
					Offline Search
				</Button>
			</Space>
		);
	};

	const renderTag = (_text: unknown, tag: Tag): JSX.Element => {
		return <AntTag color={getTagColor(tag.type)}>{capitalize(tag.type)}</AntTag>;
	};

	return (
		<Container className={props.className}>
			<Table
				size='small'
				dataSource={tags}
				pagination={getPaginationProps()}
				loading={tagsLoading}
				rowKey='id'
				bordered
				rowClassName={(_record, index): string => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')}
			>
				<Column title='Id' dataIndex='id' width={100} />
				<Column title='Tag' dataIndex='tag' ellipsis filterIcon={<SearchOutlined />} filterDropdown={renderTagSearchFilterDropdown} />
				<Column title='Type' dataIndex='type' width={100} filterDropdown={renderTypeSearchFilterDropdown} render={renderTag} />
				<Column title='Count' dataIndex='count' width={100} />
				<Column title='Favorites Count' dataIndex='favoriteCount' />
				<Column title='Blacklisted Count' dataIndex='blacklistedCount' />
				<Column title='Downloaded Count' dataIndex='downloadedCount' />
				<Column title='Actions' dataIndex='' width={260} render={renderActions} />
			</Table>
		</Container>
	);
};

export default Tags;
