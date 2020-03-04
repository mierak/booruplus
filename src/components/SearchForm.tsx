import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { State } from '../../store/main';
import { setSearchFormDrawerVisible, setActiveView } from '../../store/system';
import { setPostCount, addTag, removeTag, clearTags, setRating, setPage } from '../../store/searchForm';
import styled from 'styled-components';
import { getTagsByPattern, getPostsForTags } from '../../service/apiService';
import { Card, Select, Button, Form, Tag as AntTag, InputNumber, Col, Input, Row } from 'antd';
import { SelectValue } from 'antd/lib/select';
import { Tag, Rating, SavedSearch } from '../../types/gelbooruTypes';
import TagSelectOption from './TagSelectOption';
import { getTagColor } from '../../util/utils';
import { setPosts, setActivePost } from '../../store/posts';
import { addSavedSearch } from '../../store/savedSearches';
import { saveSearch } from '../../db/database';

interface Props extends PropsFromRedux {
	className?: string;
}

const StyledCard = styled(Card)`
	border-color: rgb(217, 217, 217);
`;

const SearchForm: React.FunctionComponent<Props> = (props: Props) => {
	const [options, setOptions] = useState<Tag[]>([]);
	const [selectValue] = useState('');

	const handleChange = async (e: SelectValue): Promise<void> => {
		const tags = await getTagsByPattern(e.toString());
		setOptions(tags);
	};

	const handleSelect = (e: SelectValue): void => {
		const tag = options.find((t: Tag) => t.tag === e.toString());
		tag && props.addTag(tag);
	};

	const handleRatingSelect = (val: Rating): void => {
		props.setRating(val);
	};

	const handlePostCountChange = (value: number | undefined): void => {
		value && props.setPostCount(value);
	};

	const handlePageChange = (value: number | undefined): void => {
		value !== undefined && props.setPage(value);
	};

	const handleTagClose = (tag: Tag): void => {
		props.removeTag(tag);
	};

	const handleSubmit = async (): Promise<void> => {
		const searchString = props.selectedTags.map((tag) => tag.tag);
		const posts = await getPostsForTags(searchString, { rating: props.rating, limit: props.postCount, page: props.page });
		props.setActiveView('thumbnails');
		props.setSearchFormDrawerVisible(false);
		props.setActivePost(undefined);
		props.setPosts(posts);
	};

	const handleClear = (): void => {
		props.clearTags();
		props.setPostCount(100);
		props.setRating('any');
	};

	const handleClose = (): void => {
		props.setSearchFormDrawerVisible(false);
	};

	const handleSaveSearch = async (): Promise<void> => {
		const savedSearch: SavedSearch = {
			type: 'online',
			tags: props.selectedTags,
			rating: props.rating
		};
		const id = await saveSearch(savedSearch);
		if (id !== undefined) {
			props.addSavedSearch({
				id: id,
				type: 'online',
				tags: props.selectedTags,
				rating: props.rating
			});
		}
	};

	const renderSelectOptions = (): JSX.Element[] => {
		return options.map((option: Tag) => (
			<Select.Option key={option.tag} value={option.tag}>
				<TagSelectOption tag={option} />
			</Select.Option>
		));
	};

	const renderSelectedTags = (): JSX.Element[] => {
		return props.selectedTags.map((tag: Tag) => (
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
				<Select defaultValue={props.rating} value={props.rating} onChange={handleRatingSelect}>
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
								defaultValue={props.postCount}
								style={{ width: '100%' }}
								onChange={handlePostCountChange}
								value={props.postCount}
							></InputNumber>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item label="Page" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
							<InputNumber
								min={0}
								max={1000}
								defaultValue={props.page}
								style={{ width: '100%' }}
								onChange={handlePageChange}
								value={props.page}
							></InputNumber>
						</Form.Item>
					</Col>
				</Row>
			</Input.Group>
			<Form.Item wrapperCol={{ span: 19, offset: 5 }}>
				<Button type="primary" htmlType="submit" onClick={(): Promise<void> => handleSubmit()}>
					Submit
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

interface StateFromProps {
	postCount: number;
	rating: Rating;
	page: number;
	selectedTags: Tag[];
}

const mapState = (state: State): StateFromProps => ({
	postCount: state.searchForm.postCount,
	rating: state.searchForm.rating,
	selectedTags: state.searchForm.selectedTags,
	page: state.searchForm.page
});

const mapDispatch = {
	setPosts,
	setActiveView,
	setSearchFormDrawerVisible,
	setPostCount,
	setPage,
	addTag,
	clearTags,
	removeTag,
	setRating,
	addSavedSearch,
	setActivePost
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(SearchForm);
