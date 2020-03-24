import React, { useState } from 'react';
import { Card, Select, Button, Form, Tag as AntTag, InputNumber, Col, Input, Row, Checkbox } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import { RootState } from '../../store';
import { setSearchFormDrawerVisible, setActiveView } from '../../store/system';
import { actions } from '../../store';
import { SelectValue } from 'antd/lib/select';
import { Tag, Rating, SavedSearch } from '../../types/gelbooruTypes';
import TagSelectOption from './TagSelectOption';
import { getTagColor } from '../../util/utils';
import { setActivePostIndex } from '../../store/posts';
import { fetchPosts } from '../../store/searchForm';
import { addSavedSearch } from '../../store/savedSearches';

interface Props {
	className?: string;
}

const StyledCard = styled(Card)`
	border-color: rgb(217, 217, 217);
`;

const SearchForm: React.FunctionComponent<Props> = (props: Props) => {
	const dispatch = useDispatch();

	const postLimit = useSelector((state: RootState) => state.downloadedSearchForm.postLimit);
	const rating = useSelector((state: RootState) => state.downloadedSearchForm.rating);
	const selectedTags = useSelector((state: RootState) => state.downloadedSearchForm.selectedTags);
	const page = useSelector((state: RootState) => state.downloadedSearchForm.page);
	const options = useSelector((state: RootState) => state.downloadedSearchForm.tagOptions);
	const showBlacklisted = useSelector((state: RootState) => state.downloadedSearchForm.showBlacklisted);
	const showFavorites = useSelector((state: RootState) => state.downloadedSearchForm.showFavorites);
	const showVideos = useSelector((state: RootState) => state.downloadedSearchForm.showVideos);
	const showImages = useSelector((state: RootState) => state.downloadedSearchForm.showImages);
	const showGifs = useSelector((state: RootState) => state.downloadedSearchForm.showGifs);
	const [selectValue] = useState('');

	const handleChange = async (e: SelectValue): Promise<void> => {
		dispatch(actions.downloadedSearchForm.loadByPatternFromDb(e.toString()));
	};

	const handleSelect = (e: SelectValue): void => {
		const tag = options.find((t: Tag) => t.tag === e.toString());
		tag && dispatch(actions.downloadedSearchForm.addTag(tag));
	};

	const handleRatingSelect = (val: Rating): void => {
		dispatch(actions.downloadedSearchForm.setRating(val));
	};

	const handlePostCountChange = (value: number | undefined): void => {
		value && dispatch(actions.downloadedSearchForm.setPostLimit(value));
	};

	const handlePageChange = (value: number | undefined): void => {
		value !== undefined && dispatch(actions.downloadedSearchForm.setPage(value));
	};

	const handleTagClose = (tag: Tag): void => {
		dispatch(actions.downloadedSearchForm.removeTag(tag));
	};

	const handleCheckboxChange = (checkbox: 'blacklisted' | 'favorites' | 'images' | 'gifs' | 'videos'): void => {
		switch (checkbox) {
			case 'blacklisted':
				dispatch(actions.downloadedSearchForm.toggleShowBlacklisted());
				break;
			case 'favorites':
				dispatch(actions.downloadedSearchForm.toggleShowFavorites());
				break;
			case 'gifs':
				dispatch(actions.downloadedSearchForm.toggleShowGifs());
				break;
			case 'images':
				dispatch(actions.downloadedSearchForm.toggleShowImages());
				break;
			case 'videos':
				dispatch(actions.downloadedSearchForm.toggleShowVideos());
				break;
		}
	};

	const handleSubmit = async (/*mode: SearchMode*/): Promise<void> => {
		// dispatch(setSearchMode(mode));
		dispatch(actions.downloadedSearchForm.fetchPosts());
		dispatch(actions.system.setActiveView('thumbnails'));
		dispatch(actions.system.setDownloadedSearchFormDrawerVisible(false));
		dispatch(actions.posts.setActivePostIndex(undefined));
	};

	const handleClear = (): void => {
		dispatch(actions.downloadedSearchForm.clearForm());
	};

	const handleClose = (): void => {
		dispatch(actions.system.setDownloadedSearchFormDrawerVisible(false));
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

			<Input.Group>
				<Row>
					<Col span={12} style={{ paddingRight: 0 }}>
						<Form.Item label="Rating" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
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
					</Col>
					<Col span={12}>
						<Form.Item label="Mode" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
							{/* <Select defaultValue={mode} value={mode} onChange={handleModeChange}>
								<Select.Option key="online" value="online">
									Online
								</Select.Option>
								<Select.Option key="offline" value="offline">
									Offline
								</Select.Option>
							</Select> */}
						</Form.Item>
					</Col>
				</Row>
			</Input.Group>

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
			<Input.Group>
				<Form.Item>
					<Checkbox checked={showBlacklisted} onChange={(): void => handleCheckboxChange('blacklisted')}>
						Blacklisted
					</Checkbox>
					<Checkbox checked={showFavorites} onChange={(): void => handleCheckboxChange('favorites')}>
						Favorites
					</Checkbox>
					<Checkbox checked={showImages} onChange={(): void => handleCheckboxChange('images')}>
						Images
					</Checkbox>
					<Checkbox checked={showGifs} onChange={(): void => handleCheckboxChange('gifs')}>
						Gifs
					</Checkbox>
					<Checkbox checked={showVideos} onChange={(): void => handleCheckboxChange('videos')}>
						Videos
					</Checkbox>
				</Form.Item>
			</Input.Group>
			<Form.Item wrapperCol={{ span: 19, offset: 5 }}>
				<Button type="primary" htmlType="submit" onClick={(): Promise<void> => handleSubmit()}>
					Search
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
