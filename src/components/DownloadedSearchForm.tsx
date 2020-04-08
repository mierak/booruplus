import React from 'react';
import { useDispatch } from 'react-redux';
import { Button, Form, Col, Row, Popconfirm } from 'antd';

import { actions } from '../../store';
import { AppDispatch } from 'store/types';

import TagSearch from './search-form/TagSearch';
import RatingSelect from './search-form/RatingSelect';
import SaveSearchButton from './search-form/SaveSearchButton';
import SelectedTags from './search-form/SelectedTags';
import PostCountSelect from './search-form/PostCountSelect';
import PageSelect from './search-form/PageSelect';
import Checkboxes from './search-form/Checkboxes';
import SubmitButton from './search-form/SubmitButton';

interface Props {
	className?: string;
}

const SearchForm: React.FunctionComponent<Props> = (props: Props) => {
	const dispatch = useDispatch<AppDispatch>();

	const handleClear = (): void => {
		dispatch(actions.downloadedSearchForm.clearForm());
	};

	const handleClose = (): void => {
		dispatch(actions.system.setDownloadedSearchFormDrawerVisible(false));
	};

	const renderForm = (): JSX.Element => {
		return (
			// eslint-disable-next-line react/prop-types
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
				<Form.Item wrapperCol={{ span: 21, offset: 3 }}>
					<Checkboxes />
				</Form.Item>
				<Form.Item wrapperCol={{ span: 19, offset: 5 }}>
					<SubmitButton mode="offline" />
					<Button type="dashed" onClick={handleClear} style={{ marginLeft: '8px' }}>
						Clear
					</Button>
					<Button onClick={handleClose} style={{ marginLeft: '8px' }}>
						Close
					</Button>
					<SaveSearchButton mode="offline" />
				</Form.Item>
			</Form>
		);
	};

	return <>{renderForm()}</>;
};

export default SearchForm;
