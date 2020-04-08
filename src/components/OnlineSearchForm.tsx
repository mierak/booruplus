import React from 'react';
import { Button, Form, Col, Row } from 'antd';
import { useDispatch } from 'react-redux';

import { actions } from 'store';
import { AppDispatch } from 'store/types';

import TagSearch from './search-form/TagSearch';
import RatingSelect from './search-form/RatingSelect';
import SaveSearchButton from './search-form/SaveSearchButton';
import PostCountSelect from './search-form/PostCountSelect';
import PageSelect from './search-form/PageSelect';
import SelectedTags from './search-form/SelectedTags';
import SubmitButton from './search-form/SubmitButton';

interface Props {
	className?: string;
}

const SearchForm: React.FunctionComponent<Props> = (props: Props) => {
	const dispatch = useDispatch<AppDispatch>();

	const handleSubmit = async (): Promise<void> => {
		dispatch(actions.system.setActiveView('thumbnails'));
		dispatch(actions.system.setSearchFormDrawerVisible(false));
		dispatch(actions.onlineSearchForm.setPage(0));
		dispatch(actions.posts.setActivePostIndex(undefined));
		await dispatch(actions.onlineSearchForm.fetchPosts());
	};

	const handleClear = (): void => {
		dispatch(actions.onlineSearchForm.clear());
	};

	const handleClose = (): void => {
		dispatch(actions.system.setSearchFormDrawerVisible(false));
	};

	return (
		<Form labelCol={{ span: 5 }} wrapperCol={{ span: 18 }} layout="horizontal" className={props.className}>
			<Form.Item label="Find Tag">
				<TagSearch mode="online" />
			</Form.Item>
			<Form.Item label="Selected Tags">
				<SelectedTags mode="online" />
			</Form.Item>
			<Row>
				<Col span={12} style={{ paddingRight: 0 }}>
					<Form.Item label="Rating" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
						<RatingSelect mode="online" />
					</Form.Item>
				</Col>
			</Row>
			<Row>
				<Col span={12} style={{ paddingRight: 0 }}>
					<Form.Item label="Post Count" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
						<PostCountSelect mode="online" />
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item label="Page" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
						<PageSelect mode="online" />
					</Form.Item>
				</Col>
			</Row>
			<Form.Item wrapperCol={{ span: 19, offset: 5 }}>
				<SubmitButton mode="online" />
				<Button type="dashed" htmlType="submit" onClick={handleClear} style={{ marginLeft: '8px' }}>
					Clear
				</Button>
				<Button htmlType="submit" onClick={handleClose} style={{ marginLeft: '8px' }}>
					Close
				</Button>
				<SaveSearchButton mode="online" />
			</Form.Item>
		</Form>
	);
};

export default SearchForm;
