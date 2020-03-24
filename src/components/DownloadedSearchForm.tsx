import React from 'react';
import { Button, Form, Col, Row } from 'antd';
import { useDispatch } from 'react-redux';

import { actions } from '../../store';

import TagSearch from './search-form/TagSearch';
import RatingSelect from './search-form/RatingSelect';
import SaveSearchButton from './search-form/SaveSearchButton';
import SelectedTags from './search-form/SelectedTags';
import PostCountSelect from './search-form/PostCountSelect';
import PageSelect from './search-form/PageSelect';
import Checkboxes from './search-form/Checkboxes';

interface Props {
	className?: string;
}

const SearchForm: React.FunctionComponent<Props> = (props: Props) => {
	const dispatch = useDispatch();

	const handleSubmit = async (): Promise<void> => {
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

	return (
		<Form labelCol={{ span: 5 }} wrapperCol={{ span: 18 }} layout="horizontal" className={props.className}>
			<Form.Item label="Find Tag">
				<TagSearch mode="offline" />
			</Form.Item>
			<Form.Item label="Selected Tags">
				<SelectedTags mode="offline" />
			</Form.Item>
			<Row>
				<Col span={12} style={{ paddingRight: 0 }}>
					<Form.Item label="Post Count" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
						<PostCountSelect mode="offline" />
					</Form.Item>
				</Col>
				<Col span={12}>
					<Form.Item label="Page" labelCol={{ span: 8 }} wrapperCol={{ span: 14 }}>
						<PageSelect mode="offline" />
					</Form.Item>
				</Col>
			</Row>
			<Row>
				<Col span={12} style={{ paddingRight: 0 }}>
					<Form.Item label="Rating" labelCol={{ span: 10 }} wrapperCol={{ span: 14 }}>
						<RatingSelect mode="offline" />
					</Form.Item>
				</Col>
			</Row>
			<Form.Item wrapperCol={{ span: 19, offset: 5 }}>
				<Checkboxes />
			</Form.Item>
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
				<SaveSearchButton mode="offline" />
			</Form.Item>
		</Form>
	);
};

export default SearchForm;
