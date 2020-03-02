import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { State } from '../../store/main';
import { setSearchFormDrawerVisible } from '../../store/system';
import styled from 'styled-components';
import { getTagsByPattern, getPostsForTags } from '../../service/apiService';
import { Card, Select, Button, Form, Tag as AntTag, InputNumber, Input } from 'antd';
import { SelectValue } from 'antd/lib/select';
import { Tag } from '../../types/gelbooruTypes';
import TagSelectOption from './TagSelectOption';
import { getTagColor } from '../../util/utils';
import { setPosts } from '../../store/posts';
import { setActiveView } from '../../store/system';

interface Props extends PropsFromRedux {
	className?: string;
}

const StyledCard = styled(Card)`
	border-color: rgb(217, 217, 217);
`;

const SearchForm: React.FunctionComponent<Props> = (props: Props) => {
	const [options, setOptions] = useState<Tag[]>([]);
	const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
	const [selectValue] = useState('');
	const [postCount, setPostCount] = useState(100);
	const [rating, setRating] = useState('any');

	const handleChange = async (e: SelectValue): Promise<void> => {
		const tags = await getTagsByPattern(e.toString());
		setOptions(tags);
	};

	const handleSelect = (e: SelectValue): void => {
		const tag = options.find((t: Tag) => t.tag === e.toString());
		if (tag) {
			if (!selectedTags.includes(tag)) {
				setSelectedTags((opts) => [...opts, tag]);
			} else {
				console.log('tag already selected');
			}
		}
	};

	const handlePostCountChange = (value: number | undefined): void => {
		value && setPostCount(value);
	};

	const handleTagClose = (tag: Tag): void => {
		setSelectedTags((tags) => tags.filter((el) => el.id !== tag.id));
	};

	const handleSubmit = async (): Promise<void> => {
		const searchString = selectedTags.map((tag) => tag.tag);
		const posts = await getPostsForTags(searchString);
		props.setActiveView('thumbnails');
		props.setSearchFormDrawerVisible(false);
		props.setPosts(posts);
	};

	const handleClear = (): void => {
		setSelectedTags([]);
		setPostCount(100);
		setRating('any');
	};

	const handleClose = (): void => {
		props.setSearchFormDrawerVisible(false);
	};

	const renderSelectOptions = (): JSX.Element[] => {
		return options.map((option: Tag) => (
			<Select.Option key={option.tag}>
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
				<Select defaultValue={rating} value={rating} onChange={(val: string): void => setRating(val)}>
					<Select.Option key="any">Any</Select.Option>
					<Select.Option key="safe">Safe</Select.Option>
					<Select.Option key="questionable">Questionable</Select.Option>
					<Select.Option key="eexplicit">Explicit</Select.Option>
				</Select>
			</Form.Item>
			<Form.Item label="Post Count">
				<InputNumber
					min={1}
					max={100}
					defaultValue={postCount}
					style={{ width: '100%' }}
					onChange={handlePostCountChange}
					value={postCount}
				></InputNumber>
			</Form.Item>
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
			</Form.Item>
		</Form>
	);
};

interface StateFromProps {}

const mapState = (state: State): StateFromProps => ({});

const mapDispatch = {
	setPosts,
	setActiveView,
	setSearchFormDrawerVisible
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(SearchForm);
