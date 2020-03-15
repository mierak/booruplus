import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/main';
import { setSearchFormDrawerVisible, setActiveView } from '../../store/system';
import {
	addTag,
	removeTag,
	clearTags,
	setRating,
	setPage,
	setLimit,
	SearchMode,
	setSearchMode,
	getTagsByPatternFromApi
} from '../../store/searchForm';
import styled from 'styled-components';
import { Card, Select, Button, Form, Tag as AntTag, InputNumber, Col, Input, Row } from 'antd';
import { SelectValue } from 'antd/lib/select';
import { Tag, Rating, SavedSearch } from '../../types/gelbooruTypes';
import TagSelectOption from './TagSelectOption';
import { getTagColor } from '../../util/utils';
import { setActivePostIndex, fetchPostsFromApi } from '../../store/posts';
import { addSavedSearch } from '../../store/savedSearches';

interface Props {
	className?: string;
}

const StyledCard = styled(Card)`
	border-color: rgb(217, 217, 217);
`;

const SearchForm: React.FunctionComponent<Props> = (props: Props) => {
	const postLimit = useSelector((state: RootState) => state.searchForm.limit);
	const rating = useSelector((state: RootState) => state.searchForm.rating);
	const selectedTags = useSelector((state: RootState) => state.searchForm.selectedTags);
	const page = useSelector((state: RootState) => state.searchForm.page);
	const options = useSelector((state: RootState) => state.searchForm.tagOptions);
	const [selectValue] = useState('');
	const dispatch = useDispatch();

	const handleChange = async (e: SelectValue): Promise<void> => {
		dispatch(getTagsByPatternFromApi(e.toString()));
	};

	const handleSelect = (e: SelectValue): void => {
		const tag = options.find((t: Tag) => t.tag === e.toString());
		tag && dispatch(addTag(tag));
	};

	const handleRatingSelect = (val: Rating): void => {
		dispatch(setRating(val));
	};

	const handlePostCountChange = (value: number | undefined): void => {
		value && dispatch(setLimit(value));
	};

	const handlePageChange = (value: number | undefined): void => {
		value !== undefined && dispatch(setPage(value));
	};

	const handleTagClose = (tag: Tag): void => {
		dispatch(removeTag(tag));
	};

	const handleSubmit = async (mode: SearchMode): Promise<void> => {
		dispatch(setSearchMode(mode));
		dispatch(fetchPostsFromApi());
		dispatch(setActiveView('thumbnails'));
		dispatch(setSearchFormDrawerVisible(false));
		dispatch(setActivePostIndex(undefined));
	};

	const handleClear = (): void => {
		dispatch(clearTags());
		dispatch(setLimit(100));
		dispatch(setRating('any'));
	};

	const handleClose = (): void => {
		dispatch(setSearchFormDrawerVisible(false));
	};

	const handleSaveSearch = async (): Promise<void> => {
		const savedSearch: SavedSearch = {
			tags: selectedTags,
			rating: rating
		};
		dispatch(addSavedSearch(savedSearch));
	};

	const renderSelectOptions = (): JSX.Element[] => {
		return options.map((option: Tag) => (
			<Select.Option key={option.tag} value={option.tag}>
				<TagSelectOption tag={option} />
			</Select.Option>
		));
	};

	const renderSelectedTags = (): JSX.Element[] => {
		return selectedTags.map((tag: Tag) => (
			<AntTag
				key={tag.id}
				color={getTagColor(tag)}
				closable
				onClose={(): void => handleTagClose(tag)}
				style={{ marginTop: '4px', marginBottom: '4px' }}
			>
				{tag.tag}
			</AntTag>
		));
	};

	return (
		<Form labelCol={{ span: 5 }} wrapperCol={{ span: 18 }} layout="horizontal" className={props.className}>
			<Form.Item label="Find Tag">
				<Select showArrow={false} showSearch onSearch={handleChange} onChange={handleSelect} value={selectValue}>
					{renderSelectOptions()}
				</Select>
			</Form.Item>
			<Form.Item label="Selected Tags">
				<StyledCard bodyStyle={{ padding: '11px', minHeight: '48px' }}>{renderSelectedTags()}</StyledCard>
			</Form.Item>
			<Form.Item label="Rating">
				<Select defaultValue={rating} value={rating} onChange={handleRatingSelect}>
					<Select.Option key="any" value="any">
						Any
					</Select.Option>
					<Select.Option key="safe" value="safe">
						Safe
					</Select.Option>
					<Select.Option key="questionable" value="questionable">
						Questionable
					</Select.Option>
					<Select.Option key="explicit" value="explicit">
						Explicit
					</Select.Option>
				</Select>
			</Form.Item>
			<Input.Group>
				<Row>
					<Col span={12} style={{ paddingRight: 0 }}>
						<Form.Item label="Post Count" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
							<InputNumber
								min={1}
								max={100}
								defaultValue={postLimit}
								style={{ width: '100%' }}
								onChange={handlePostCountChange}
								value={postLimit}
							></InputNumber>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item label="Page" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
							<InputNumber
								min={0}
								max={1000}
								defaultValue={page}
								style={{ width: '100%' }}
								onChange={handlePageChange}
								value={page}
							></InputNumber>
						</Form.Item>
					</Col>
				</Row>
			</Input.Group>
			<Form.Item wrapperCol={{ span: 19, offset: 5 }}>
				<Button type="primary" htmlType="submit" onClick={(): Promise<void> => handleSubmit('online')}>
					Search Online
				</Button>
				<Button type="primary" htmlType="submit" onClick={(): Promise<void> => handleSubmit('offline')}>
					Search Offline
				</Button>
				<Button type="dashed" htmlType="submit" onClick={(): void => handleClear()} style={{ marginLeft: '8px' }}>
					Clear
				</Button>
				<Button htmlType="submit" onClick={handleClose} style={{ marginLeft: '8px' }}>
					Close
				</Button>
				<Button htmlType="submit" type="primary" onClick={handleSaveSearch} style={{ marginLeft: '8px' }}>
					Save Search
				</Button>
			</Form.Item>
		</Form>
	);
};

export default SearchForm;
